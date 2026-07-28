import { NextResponse } from 'next/server'
import { DEFAULT_TIMEZONE, getSiteUrl } from '@/lib/constants'
import { eventPath, getPublicEventBySlugOrId } from '@/lib/calendar-data'
import {
  buildCalendar,
  buildDescription,
  buildLocation,
  formatDateOnly,
  formatUtc,
} from '@/lib/ics'
import type { CalendarEvent } from '@/lib/types'

export const dynamic = 'force-dynamic'

/**
 * "Adicionar à agenda" de UM evento (o feed de calendário inteiro vive em
 * /api/calendar/[feed]). Serve para landings externas (ex.: Corrida na Praia)
 * apontarem para cá em vez de duplicar data, hora e local no próprio código.
 *
 *   GET /api/calendar/evento/<slug>.ics             → download do .ics (Apple e genérico)
 *   GET /api/calendar/evento/<slug>.ics?app=google  → 302 para o Google Agenda
 *   GET /api/calendar/evento/<slug>.ics?app=outlook → 302 para o Outlook pessoal
 *   GET /api/calendar/evento/<slug>.ics?app=office  → 302 para o Outlook corporativo
 *
 * Sem tracking: aqui é download avulso, não assinatura. Contar isso em
 * calendar_feed_hits inflaria a métrica de dispositivos assinantes.
 */

type Destino = 'ics' | 'google' | 'outlook' | 'office'

const DESTINOS: Destino[] = ['ics', 'google', 'outlook', 'office']

/** Janela do evento no formato que cada destino espera. */
function janela(event: CalendarEvent) {
  const tz = event.timezone || DEFAULT_TIMEZONE

  if (event.is_all_day) {
    const inicio = formatDateOnly(event.start_datetime, tz)
    let fim = formatDateOnly(event.end_datetime, tz)
    // DTEND de all-day é exclusivo: um evento de um dia termina no dia seguinte.
    if (fim <= inicio) {
      const d = new Date(`${inicio.slice(0, 4)}-${inicio.slice(4, 6)}-${inicio.slice(6, 8)}T00:00:00Z`)
      d.setUTCDate(d.getUTCDate() + 1)
      fim = formatUtc(d).slice(0, 8)
    }
    return { allDay: true, googleInicio: inicio, googleFim: fim, tz }
  }

  return {
    allDay: false,
    googleInicio: formatUtc(event.start_datetime),
    googleFim: formatUtc(event.end_datetime),
    tz,
  }
}

/** Texto do corpo: descrição do evento + link da página na agenda. */
function corpo(event: CalendarEvent, pagina: string): string {
  const base = buildDescription(event)
  return [base, `Página do evento: ${pagina}`].filter(Boolean).join('\n\n')
}

function urlGoogle(event: CalendarEvent, pagina: string): string {
  const { allDay, googleInicio, googleFim, tz } = janela(event)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${googleInicio}/${googleFim}`,
    details: corpo(event, pagina),
  })
  const local = buildLocation(event)
  if (local) params.set('location', local)
  // Com datas em UTC (…Z) o ctz é ignorado; em all-day ele evita que o Google
  // interprete a data no fuso do navegador.
  if (allDay) params.set('ctz', tz)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/** YYYYMMDD → YYYY-MM-DD (formato de data que o Outlook espera em all-day). */
function comHifens(dateOnly: string): string {
  return `${dateOnly.slice(0, 4)}-${dateOnly.slice(4, 6)}-${dateOnly.slice(6, 8)}`
}

function urlOutlook(event: CalendarEvent, pagina: string, host: string): string {
  const { allDay, tz } = janela(event)
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    body: corpo(event, pagina),
    // O Outlook aceita ISO em UTC e resolve o fuso do usuário sozinho.
    startdt: allDay
      ? comHifens(formatDateOnly(event.start_datetime, tz))
      : new Date(event.start_datetime).toISOString(),
    enddt: allDay
      ? comHifens(formatDateOnly(event.end_datetime, tz))
      : new Date(event.end_datetime).toISOString(),
  })
  if (allDay) params.set('allday', 'true')
  const local = buildLocation(event)
  if (local) params.set('location', local)
  return `https://${host}/calendar/0/deeplink/compose?${params.toString()}`
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug: raw } = await params
  const slug = raw.replace(/\.ics$/i, '')

  const pedido = new URL(request.url).searchParams.get('app')?.toLowerCase() ?? 'ics'
  const destino: Destino = DESTINOS.includes(pedido as Destino)
    ? (pedido as Destino)
    : 'ics'

  let event: Awaited<ReturnType<typeof getPublicEventBySlugOrId>> = null
  try {
    event = await getPublicEventBySlugOrId(slug)
  } catch (error) {
    console.error('[ics:evento] falha ao buscar evento:', error)
    return new NextResponse('Não foi possível carregar o evento agora.', { status: 503 })
  }

  if (!event) {
    return new NextResponse('Evento não encontrado.', { status: 404 })
  }

  const pagina = `${getSiteUrl()}${eventPath(event)}`

  if (destino === 'google') {
    return NextResponse.redirect(urlGoogle(event, pagina), 302)
  }
  if (destino === 'outlook' || destino === 'office') {
    const host = destino === 'office' ? 'outlook.office.com' : 'outlook.live.com'
    return NextResponse.redirect(urlOutlook(event, pagina, host), 302)
  }

  const ics = buildCalendar({
    calName: event.title,
    calDesc: event.summary || event.title,
    timeZone: event.timezone || DEFAULT_TIMEZONE,
    events: [event],
  })

  return new NextResponse(ics, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      // attachment (e não inline): no iOS e no Android é o que dispara a folha
      // "Adicionar ao calendário" em vez de abrir o .ics como texto.
      'Content-Disposition': `attachment; filename="${slug}.ics"`,
      'Cache-Control': 'no-store, max-age=0',
      // A landing da Corrida na Praia é outro domínio e pode querer ler o feed.
      'Access-Control-Allow-Origin': '*',
    },
  })
}
