import { DEFAULT_TIMEZONE } from './constants'

/** Formata data/hora longa em pt-BR no fuso de São Paulo. Ex.: "sáb, 21 jun, 07:00". */
export function formatEventDateTime(
  input: string | Date,
  timeZone = DEFAULT_TIMEZONE,
): string {
  const date = input instanceof Date ? input : new Date(input)
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone,
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/** Apenas a data. Ex.: "21 de junho de 2026". */
export function formatEventDate(
  input: string | Date,
  timeZone = DEFAULT_TIMEZONE,
): string {
  const date = input instanceof Date ? input : new Date(input)
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone,
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/** Apenas o horário. Ex.: "07:00". */
export function formatEventTime(
  input: string | Date,
  timeZone = DEFAULT_TIMEZONE,
): string {
  const date = input instanceof Date ? input : new Date(input)
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/** Faixa de horário "07:00 – 09:00". */
export function formatTimeRange(
  start: string | Date,
  end: string | Date,
  timeZone = DEFAULT_TIMEZONE,
): string {
  return `${formatEventTime(start, timeZone)} – ${formatEventTime(end, timeZone)}`
}

/** Componentes para o mock de card (dia/mês). Ex.: { day: "21", month: "JUN" }. */
export function getDayBadge(input: string | Date, timeZone = DEFAULT_TIMEZONE) {
  const date = input instanceof Date ? input : new Date(input)
  const day = new Intl.DateTimeFormat('pt-BR', { timeZone, day: '2-digit' }).format(date)
  const month = new Intl.DateTimeFormat('pt-BR', { timeZone, month: 'short' })
    .format(date)
    .replace('.', '')
    .toUpperCase()
  const weekday = new Intl.DateTimeFormat('pt-BR', { timeZone, weekday: 'short' })
    .format(date)
    .replace('.', '')
  return { day, month, weekday }
}

/** Converte um timestamptz para o valor de um <input type="datetime-local"> em SP. */
export function toDatetimeLocalValue(
  input: string | Date | null | undefined,
  timeZone = DEFAULT_TIMEZONE,
): string {
  if (!input) return ''
  const date = input instanceof Date ? input : new Date(input)
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  )
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`
}

/**
 * Converte um valor de <input type="datetime-local"> (horário de parede, no fuso
 * informado) para um ISO em UTC, pronto para gravar em timestamptz.
 * Calcula o offset real do fuso na data — robusto mesmo se o Brasil voltar a ter DST.
 */
export function localInputToUtcISO(
  value: string,
  timeZone = DEFAULT_TIMEZONE,
): string {
  const [datePart, timePart = '00:00'] = value.split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  const [hh, mm] = timePart.split(':').map(Number)
  const utcGuess = Date.UTC(y, m - 1, d, hh, mm)

  const tzParts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(new Date(utcGuess))
      .map((p) => [p.type, p.value]),
  )
  const tzAsUtc = Date.UTC(
    Number(tzParts.year),
    Number(tzParts.month) - 1,
    Number(tzParts.day),
    Number(tzParts.hour),
    Number(tzParts.minute),
    Number(tzParts.second),
  )
  const offset = tzAsUtc - utcGuess
  return new Date(utcGuess - offset).toISOString()
}
