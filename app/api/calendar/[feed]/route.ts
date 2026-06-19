import { createHash } from 'crypto'
import { NextResponse, after } from 'next/server'
import { CALENDARS, CALENDAR_SLUGS, type CalendarSlug } from '@/lib/constants'
import { getFeedEvents } from '@/lib/calendar-data'
import { getServiceClient, isSupabaseConfigured } from '@/lib/supabase'
import { feedClientFromUa } from '@/lib/ua'
import { buildCalendar } from '@/lib/ics'

// Sempre executa no servidor. Sem cache de CDN para registrar cada busca (assinatura).
export const dynamic = 'force-dynamic'

function hashIp(ip: string | null): string | null {
  if (!ip) return null
  const salt = process.env.AGENDA_SESSION_SECRET || 'somma-agenda'
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32)
}

function decode(value: string | null): string | null {
  if (!value) return null
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/**
 * Feed iCalendar público de um calendário (somma / assessoria / parceiros / corridas-df).
 * Registra cada busca em calendar_feed_hits (proxy de dispositivos assinantes).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ feed: string }> },
) {
  const { feed } = await params
  const slug = feed.replace(/\.ics$/i, '') as CalendarSlug

  if (!CALENDAR_SLUGS.includes(slug)) {
    return new NextResponse('Calendário não encontrado.', { status: 404 })
  }

  const meta = CALENDARS[slug]
  let warning: string | undefined

  let events = [] as Awaited<ReturnType<typeof getFeedEvents>>
  try {
    events = await getFeedEvents(slug)
  } catch (error) {
    warning = 'supabase-unavailable'
    console.error('[ics] falha ao buscar eventos:', error)
  }

  const ics = buildCalendar({
    calName: meta.calName,
    calDesc: meta.calDesc,
    events,
  })

  // Registra a busca depois de responder (não bloqueia o feed).
  const h = request.headers
  const ua = h.get('user-agent')?.slice(0, 400) || null
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || null
  const country = h.get('x-vercel-ip-country')
  const region = h.get('x-vercel-ip-country-region')
  const city = decode(h.get('x-vercel-ip-city'))

  after(async () => {
    if (!isSupabaseConfigured()) return
    try {
      await getServiceClient().from('calendar_feed_hits').insert({
        calendar_slug: slug,
        client: feedClientFromUa(ua),
        ip_hash: hashIp(ip),
        user_agent: ua,
        country,
        region,
        city,
      })
    } catch {
      /* tabela ainda não criada (rode a migration de feed) — ignora */
    }
  })

  return new NextResponse(ics, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `inline; filename="${slug}.ics"`,
      // sem cache de CDN para cada dispositivo bater na origem e ser contado
      'Cache-Control': 'no-store, max-age=0',
      ...(warning ? { 'X-Agenda-Warning': warning } : {}),
    },
  })
}
