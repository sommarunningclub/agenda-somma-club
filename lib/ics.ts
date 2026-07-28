/**
 * Gerador de iCalendar (RFC 5545) próprio — sem dependências.
 *
 * Por que próprio: controle total sobre UID estável, SEQUENCE, VALARM, RRULE,
 * dobra de linha (75 octetos), escape de caracteres e VTIMEZONE America/Sao_Paulo.
 * Tudo aqui são funções puras → 100% testável (ver lib/ics.test.ts).
 *
 * Observação de timezone: o Brasil aboliu o horário de verão em 2019, então
 * America/Sao_Paulo é fixo em -03:00. Mesmo assim emitimos VTIMEZONE + TZID
 * para máxima compatibilidade entre Apple, Google e Outlook.
 */

import { DEFAULT_TIMEZONE } from './constants'
import type { CalendarEvent } from './types'

export const ICS_PRODID = '-//Somma Club//Agenda Somma Club//PT-BR'
const CRLF = '\r\n'

/* -------------------------------------------------------------------------- */
/*  Escapes e dobra de linha                                                   */
/* -------------------------------------------------------------------------- */

/** Escapa texto para um valor iCalendar (RFC 5545 §3.3.11). */
export function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n/g, '\\n')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\n')
}

/**
 * Dobra uma linha lógica em linhas físicas de no máximo 75 octetos (UTF-8),
 * com continuação iniciada por um espaço. (RFC 5545 §3.1)
 */
export function foldLine(line: string): string {
  const segments: string[] = []
  let current = ''
  let currentBytes = 0

  for (const ch of Array.from(line)) {
    const chBytes = Buffer.byteLength(ch, 'utf8')
    // Linhas de continuação reservam 1 octeto para o espaço inicial.
    const max = segments.length === 0 ? 75 : 74
    if (currentBytes + chBytes > max) {
      segments.push(current)
      current = ''
      currentBytes = 0
    }
    current += ch
    currentBytes += chBytes
  }
  segments.push(current)

  return segments.map((seg, i) => (i === 0 ? seg : ` ${seg}`)).join(CRLF)
}

/* -------------------------------------------------------------------------- */
/*  Datas                                                                       */
/* -------------------------------------------------------------------------- */

function toDate(input: string | Date): Date {
  return input instanceof Date ? input : new Date(input)
}

/** Componentes de data/hora no fuso informado (formato YYYYMMDDTHHMMSS). */
export function formatLocal(input: string | Date, timeZone = DEFAULT_TIMEZONE): string {
  const date = toDate(input)
  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
  const parts = Object.fromEntries(
    dtf.formatToParts(date).map((p) => [p.type, p.value]),
  )
  return `${parts.year}${parts.month}${parts.day}T${parts.hour}${parts.minute}${parts.second}`
}

/** Data UTC com Z (para DTSTAMP / LAST-MODIFIED). */
export function formatUtc(input: string | Date): string {
  return toDate(input)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')
}

/** Apenas a data (YYYYMMDD) no fuso informado, para eventos all-day. */
export function formatDateOnly(input: string | Date, timeZone = DEFAULT_TIMEZONE): string {
  return formatLocal(input, timeZone).slice(0, 8)
}

/** Soma 1 dia a uma data YYYYMMDD (DTEND exclusivo de all-day). */
function nextDay(dateOnly: string): string {
  const d = new Date(
    `${dateOnly.slice(0, 4)}-${dateOnly.slice(4, 6)}-${dateOnly.slice(6, 8)}T00:00:00Z`,
  )
  d.setUTCDate(d.getUTCDate() + 1)
  return formatUtc(d).slice(0, 8)
}

/* -------------------------------------------------------------------------- */
/*  Lembretes (VALARM)                                                          */
/* -------------------------------------------------------------------------- */

/** Converte minutos em duração ISO-8601 negativa (ex.: 1440 → -P1D, 30 → -PT30M). */
export function minutesToTrigger(minutes: number): string {
  if (minutes <= 0) return 'PT0M'
  const days = Math.floor(minutes / 1440)
  const rem = minutes % 1440
  const hours = Math.floor(rem / 60)
  const mins = rem % 60

  let out = '-P'
  if (days) out += `${days}D`
  if (hours || mins) {
    out += 'T'
    if (hours) out += `${hours}H`
    if (mins) out += `${mins}M`
  }
  return out
}

function buildAlarm(minutes: number, description: string): string[] {
  return [
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText(description)}`,
    `TRIGGER:${minutesToTrigger(minutes)}`,
    'END:VALARM',
  ]
}

/** Resolve a lista de minutos de lembrete de um evento (24h/2h/30m + custom). */
export function resolveReminderMinutes(event: Partial<CalendarEvent>): number[] {
  const minutes = new Set<number>()
  if (event.reminder_24h) minutes.add(1440)
  if (event.reminder_2h) minutes.add(120)
  if (event.reminder_30m) minutes.add(30)
  for (const m of event.custom_reminders ?? []) {
    if (Number.isFinite(m) && m > 0) minutes.add(Math.round(m))
  }
  return Array.from(minutes).sort((a, b) => b - a)
}

/* -------------------------------------------------------------------------- */
/*  VEVENT                                                                      */
/* -------------------------------------------------------------------------- */

function statusToIcs(status: CalendarEvent['status']): string {
  if (status === 'cancelled') return 'CANCELLED'
  return 'CONFIRMED'
}

/** Local em uma linha ("Nome, Endereço"). Exportado: os deeplinks de
 *  Google/Outlook (evento único) precisam do mesmo texto do LOCATION. */
export function buildLocation(event: CalendarEvent): string | null {
  const parts = [event.location_name, event.location_address].filter(Boolean)
  return parts.length ? parts.join(', ') : null
}

/** Descrição do evento + links estruturados. Exportado pelo mesmo motivo
 *  de buildLocation: manter .ics e deeplinks com o mesmo conteúdo. */
export function buildDescription(event: CalendarEvent): string | null {
  const desc = event.description?.trim() ?? ''
  const blocks: string[] = []
  if (desc) blocks.push(desc)

  // Só anexa links estruturados que ainda NÃO aparecem no texto da descrição,
  // evitando duplicar quando o admin já escreveu os links na própria descrição.
  const inDesc = (url: string) => desc.includes(url)
  const links: string[] = []
  if (event.checkin_url && !inDesc(event.checkin_url)) {
    links.push(`Check-in: ${event.checkin_url}`)
  }
  if (event.cta_url && !inDesc(event.cta_url)) {
    links.push(`${event.cta_label || 'Saiba mais'}: ${event.cta_url}`)
  }
  if (event.location_url && !inDesc(event.location_url)) {
    links.push(`Local: ${event.location_url}`)
  }
  if (links.length) blocks.push(links.join('\n'))

  const text = blocks.join('\n\n').trim()
  return text || null
}

function resolveUrl(event: CalendarEvent): string | null {
  return event.cta_url || event.checkin_url || event.location_url || null
}

/** Strip de prefixo "RRULE:" caso o admin tenha salvo com ele. */
function normalizeRrule(rule: string): string {
  return rule.trim().replace(/^RRULE:/i, '').trim()
}

/** Gera as linhas lógicas (sem dobra) de um VEVENT. */
export function buildVEventLines(event: CalendarEvent): string[] {
  const tz = event.timezone || DEFAULT_TIMEZONE
  const lines: string[] = ['BEGIN:VEVENT']

  lines.push(`UID:${event.uid}`)
  lines.push(`DTSTAMP:${formatUtc(event.updated_at || event.created_at)}`)

  if (event.is_all_day) {
    const start = formatDateOnly(event.start_datetime, tz)
    let end = formatDateOnly(event.end_datetime, tz)
    if (end <= start) end = nextDay(start)
    lines.push(`DTSTART;VALUE=DATE:${start}`)
    lines.push(`DTEND;VALUE=DATE:${end}`)
  } else {
    lines.push(`DTSTART;TZID=${tz}:${formatLocal(event.start_datetime, tz)}`)
    lines.push(`DTEND;TZID=${tz}:${formatLocal(event.end_datetime, tz)}`)
  }

  if (event.is_recurring && event.recurrence_rule) {
    lines.push(`RRULE:${normalizeRrule(event.recurrence_rule)}`)
  }

  lines.push(`SUMMARY:${escapeText(event.title)}`)

  const description = buildDescription(event)
  if (description) lines.push(`DESCRIPTION:${escapeText(description)}`)

  const location = buildLocation(event)
  if (location) lines.push(`LOCATION:${escapeText(location)}`)

  const url = resolveUrl(event)
  if (url) lines.push(`URL:${url}`)

  lines.push(`LAST-MODIFIED:${formatUtc(event.updated_at || event.created_at)}`)
  lines.push(`SEQUENCE:${event.sequence ?? 0}`)
  lines.push(`STATUS:${statusToIcs(event.status)}`)

  const alarmDescription = event.summary || event.title
  for (const minutes of resolveReminderMinutes(event)) {
    lines.push(...buildAlarm(minutes, alarmDescription))
  }

  lines.push('END:VEVENT')
  return lines
}

/* -------------------------------------------------------------------------- */
/*  VTIMEZONE + VCALENDAR                                                       */
/* -------------------------------------------------------------------------- */

function buildVTimezone(timeZone: string): string[] {
  // Brasil sem horário de verão desde 2019 → STANDARD fixo -0300.
  if (timeZone === 'America/Sao_Paulo') {
    return [
      'BEGIN:VTIMEZONE',
      'TZID:America/Sao_Paulo',
      'X-LIC-LOCATION:America/Sao_Paulo',
      'BEGIN:STANDARD',
      'TZNAME:-03',
      'TZOFFSETFROM:-0300',
      'TZOFFSETTO:-0300',
      'DTSTART:19700101T000000',
      'END:STANDARD',
      'END:VTIMEZONE',
    ]
  }
  return []
}

export interface BuildCalendarOptions {
  calName: string
  calDesc: string
  timeZone?: string
  prodId?: string
  events: CalendarEvent[]
}

/** Monta o conteúdo .ics completo (com CRLF e dobra de linha). */
export function buildCalendar(options: BuildCalendarOptions): string {
  const timeZone = options.timeZone || DEFAULT_TIMEZONE
  const prodId = options.prodId || ICS_PRODID

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${prodId}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(options.calName)}`,
    `X-WR-CALDESC:${escapeText(options.calDesc)}`,
    `X-WR-TIMEZONE:${timeZone}`,
    ...buildVTimezone(timeZone),
  ]

  for (const event of options.events) {
    lines.push(...buildVEventLines(event))
  }

  lines.push('END:VCALENDAR')

  return lines.map(foldLine).join(CRLF) + CRLF
}
