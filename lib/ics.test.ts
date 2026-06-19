import { describe, expect, it } from 'vitest'
import {
  buildCalendar,
  buildVEventLines,
  escapeText,
  foldLine,
  formatLocal,
  formatUtc,
  minutesToTrigger,
  resolveReminderMinutes,
} from './ics'
import type { CalendarEvent } from './types'

function makeEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    calendar_id: '22222222-2222-2222-2222-222222222222',
    title: 'Somma Club | Encontro oficial',
    slug: 'encontro-oficial',
    summary: 'Encontro oficial do Somma Club',
    description: 'Chegue cedo, faça check-in.',
    location_name: 'Parque da Cidade',
    location_address: 'Estacionamento 10, Brasília - DF',
    location_url: null,
    start_datetime: '2026-06-20T10:00:00.000Z', // 07:00 em SP (-03)
    end_datetime: '2026-06-20T12:00:00.000Z', // 09:00 em SP
    timezone: 'America/Sao_Paulo',
    is_all_day: false,
    is_recurring: false,
    recurrence_rule: null,
    category_id: null,
    partner_name: null,
    partner_logo_url: null,
    checkin_url: 'https://sommaclub.com.br',
    cta_label: 'Saiba mais',
    cta_url: 'https://sommaclub.com.br/agenda',
    image_url: null,
    status: 'published',
    visibility: 'public',
    reminder_24h: true,
    reminder_2h: true,
    reminder_30m: true,
    custom_reminders: [],
    uid: 'evt-11111111-1111-1111-1111-111111111111@sommaclub.com.br',
    sequence: 0,
    published_at: '2026-06-01T00:00:00.000Z',
    created_by: null,
    updated_by: null,
    created_at: '2026-06-01T00:00:00.000Z',
    updated_at: '2026-06-10T15:30:00.000Z',
    deleted_at: null,
    ...overrides,
  }
}

describe('escapeText', () => {
  it('escapa vírgula, ponto e vírgula, barra e quebra de linha', () => {
    expect(escapeText('a, b; c \\ d')).toBe('a\\, b\\; c \\\\ d')
    expect(escapeText('linha1\nlinha2')).toBe('linha1\\nlinha2')
    expect(escapeText('win\r\ndows')).toBe('win\\ndows')
  })
})

describe('foldLine', () => {
  it('não dobra linhas curtas', () => {
    expect(foldLine('SUMMARY:curto')).toBe('SUMMARY:curto')
  })

  it('dobra linhas com mais de 75 octetos usando espaço de continuação', () => {
    const long = 'DESCRIPTION:' + 'a'.repeat(200)
    const folded = foldLine(long)
    const physical = folded.split('\r\n')
    expect(physical.length).toBeGreaterThan(1)
    // primeira linha <= 75 octetos
    expect(Buffer.byteLength(physical[0], 'utf8')).toBeLessThanOrEqual(75)
    // continuações começam com espaço e <= 75 octetos
    for (const line of physical.slice(1)) {
      expect(line.startsWith(' ')).toBe(true)
      expect(Buffer.byteLength(line, 'utf8')).toBeLessThanOrEqual(75)
    }
    // remontando, o conteúdo é preservado
    expect(physical.map((l, i) => (i === 0 ? l : l.slice(1))).join('')).toBe(long)
  })

  it('conta octetos UTF-8 (acentos) e não quebra no meio de um caractere', () => {
    const line = 'SUMMARY:' + 'ção '.repeat(40)
    const folded = foldLine(line)
    for (const physical of folded.split('\r\n')) {
      expect(Buffer.byteLength(physical, 'utf8')).toBeLessThanOrEqual(75)
    }
  })
})

describe('datas', () => {
  it('formatLocal converte UTC para horário de parede de São Paulo', () => {
    expect(formatLocal('2026-06-20T10:00:00.000Z', 'America/Sao_Paulo')).toBe(
      '20260620T070000',
    )
  })

  it('formatUtc produz o formato Zulu', () => {
    expect(formatUtc('2026-06-20T10:00:00.000Z')).toBe('20260620T100000Z')
  })
})

describe('minutesToTrigger', () => {
  it('converte minutos em duração ISO-8601 negativa', () => {
    expect(minutesToTrigger(1440)).toBe('-P1D')
    expect(minutesToTrigger(120)).toBe('-PT2H')
    expect(minutesToTrigger(30)).toBe('-PT30M')
    expect(minutesToTrigger(90)).toBe('-PT1H30M')
  })
})

describe('resolveReminderMinutes', () => {
  it('combina flags + custom e ordena decrescente sem duplicar', () => {
    const mins = resolveReminderMinutes(
      makeEvent({ custom_reminders: [60, 30] }),
    )
    expect(mins).toEqual([1440, 120, 60, 30])
  })
})

describe('buildVEventLines', () => {
  it('inclui campos críticos do evento', () => {
    const lines = buildVEventLines(makeEvent())
    expect(lines).toContain('BEGIN:VEVENT')
    expect(lines).toContain('END:VEVENT')
    expect(lines).toContain(
      'UID:evt-11111111-1111-1111-1111-111111111111@sommaclub.com.br',
    )
    expect(lines).toContain('DTSTART;TZID=America/Sao_Paulo:20260620T070000')
    expect(lines).toContain('DTEND;TZID=America/Sao_Paulo:20260620T090000')
    expect(lines).toContain('SEQUENCE:0')
    expect(lines).toContain('STATUS:CONFIRMED')
    expect(lines).toContain('LAST-MODIFIED:20260610T153000Z')
    expect(lines.some((l) => l.startsWith('SUMMARY:'))).toBe(true)
    // 3 lembretes => 3 VALARM
    expect(lines.filter((l) => l === 'BEGIN:VALARM')).toHaveLength(3)
  })

  it('mantém UID estável e emite SEQUENCE incrementado após edição', () => {
    const e1 = buildVEventLines(makeEvent({ sequence: 0 }))
    const e2 = buildVEventLines(makeEvent({ sequence: 1, title: 'Novo título' }))
    const uid1 = e1.find((l) => l.startsWith('UID:'))
    const uid2 = e2.find((l) => l.startsWith('UID:'))
    expect(uid1).toBe(uid2) // UID nunca muda
    expect(e2).toContain('SEQUENCE:1')
  })

  it('emite STATUS:CANCELLED para eventos cancelados', () => {
    const lines = buildVEventLines(makeEvent({ status: 'cancelled' }))
    expect(lines).toContain('STATUS:CANCELLED')
  })

  it('não duplica links que já estão escritos na descrição', () => {
    const lines = buildVEventLines(
      makeEvent({
        description: 'Garanta sua vaga: https://sommaclub.com.br/agenda',
        checkin_url: null,
        cta_url: 'https://sommaclub.com.br/agenda',
        cta_label: 'Acessar',
        location_url: null,
      }),
    )
    const desc = lines.find((l) => l.startsWith('DESCRIPTION:')) ?? ''
    const occurrences = desc.split('https://sommaclub.com.br/agenda').length - 1
    expect(occurrences).toBe(1)
  })

  it('inclui RRULE quando recorrente', () => {
    const lines = buildVEventLines(
      makeEvent({ is_recurring: true, recurrence_rule: 'FREQ=WEEKLY;BYDAY=SA' }),
    )
    expect(lines).toContain('RRULE:FREQ=WEEKLY;BYDAY=SA')
  })

  it('trata evento all-day com DTEND exclusivo', () => {
    const lines = buildVEventLines(
      makeEvent({
        is_all_day: true,
        start_datetime: '2026-06-20T03:00:00.000Z', // 20/06 00:00 SP
        end_datetime: '2026-06-20T03:00:00.000Z',
      }),
    )
    expect(lines).toContain('DTSTART;VALUE=DATE:20260620')
    expect(lines).toContain('DTEND;VALUE=DATE:20260621')
  })
})

describe('buildCalendar', () => {
  const ics = buildCalendar({
    calName: 'Agenda Somma Club',
    calDesc: 'Encontros, treinos, corridas e ativações oficiais do Somma Club',
    events: [makeEvent()],
  })

  it('contém os cabeçalhos obrigatórios do calendário', () => {
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('VERSION:2.0')
    expect(ics).toContain('PRODID:-//Somma Club//Agenda Somma Club//PT-BR')
    expect(ics).toContain('CALSCALE:GREGORIAN')
    expect(ics).toContain('METHOD:PUBLISH')
    expect(ics).toContain('X-WR-CALNAME:Agenda Somma Club')
    expect(ics).toContain('X-WR-TIMEZONE:America/Sao_Paulo')
    expect(ics).toContain('BEGIN:VTIMEZONE')
    expect(ics).toContain('TZID:America/Sao_Paulo')
    expect(ics.trimEnd().endsWith('END:VCALENDAR')).toBe(true)
  })

  it('usa CRLF como terminador de linha', () => {
    expect(ics.includes('\r\n')).toBe(true)
    // não deve haver \n solto sem \r antes
    expect(/[^\r]\n/.test(ics)).toBe(false)
  })
})
