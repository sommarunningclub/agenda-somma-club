'use client'

import { useMemo, useState } from 'react'
import {
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  List,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DEFAULT_TIMEZONE } from '@/lib/constants'
import type { CalendarEventWithRelations } from '@/lib/types'

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function spDate(iso: string, tz = DEFAULT_TIMEZONE) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso))
}

function fmtBr(iso: string, tz = DEFAULT_TIMEZONE) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: tz,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso))
}

function dateLabel(e: CalendarEventWithRelations) {
  const tz = e.timezone || DEFAULT_TIMEZONE
  const s = fmtBr(e.start_datetime, tz)
  const en = fmtBr(e.end_datetime, tz)
  if (s === en) return s
  const [sd, sm, sy] = s.split('/')
  const [ed, em, ey] = en.split('/')
  if (sy === ey && sm === em) return `${sd} e ${ed}/${sm}/${sy}`
  return `${s} – ${en}`
}

function longDate(str: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${str}T12:00:00Z`))
}

function tone(status?: string | null) {
  const t = (status || '').toLowerCase()
  if (t.includes('abert')) return 'bg-[#16a34a]/10 text-[#15803d]'
  if (t.includes('sold') || t.includes('encerrad') || t.includes('esgot'))
    return 'bg-[#dc2626]/10 text-[#dc2626]'
  return 'bg-[#d97706]/10 text-[#b45309]'
}

function StatusPill({ status }: { status?: string | null }) {
  if (!status) return null
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tone(status)}`}
    >
      {status}
    </span>
  )
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

interface Prepared extends CalendarEventWithRelations {
  _start: string
  _end: string
  _color: string
}

export function RacesSection({
  races,
}: {
  races: CalendarEventWithRelations[]
}) {
  const prepared: Prepared[] = useMemo(
    () =>
      races.map((e) => ({
        ...e,
        _start: spDate(e.start_datetime, e.timezone),
        _end: spDate(e.end_datetime, e.timezone),
        _color: e.category?.color || e.calendar?.color || '#16a34a',
      })),
    [races],
  )

  // Mês inicial = mês da primeira corrida
  const firstMonth = useMemo(() => {
    if (prepared.length === 0) {
      const now = new Date()
      return { year: now.getUTCFullYear(), month: now.getUTCMonth() }
    }
    const min = prepared.reduce((a, b) => (a._start <= b._start ? a : b))._start
    const [y, m] = min.split('-').map(Number)
    return { year: y, month: m - 1 }
  }, [prepared])

  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const [month, setMonth] = useState(firstMonth)
  const [day, setDay] = useState<{ str: string; races: Prepared[] } | null>(null)

  const cells = useMemo(() => {
    const firstWeekday = new Date(Date.UTC(month.year, month.month, 1)).getUTCDay()
    const start = new Date(Date.UTC(month.year, month.month, 1 - firstWeekday))
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start)
      d.setUTCDate(start.getUTCDate() + i)
      const str = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
      return {
        str,
        day: d.getUTCDate(),
        inMonth: d.getUTCMonth() === month.month,
        races: prepared.filter((e) => str >= e._start && str <= e._end),
      }
    })
  }, [month, prepared])

  const monthRaces = useMemo(
    () =>
      prepared
        .filter((e) => {
          const [y, m] = e._start.split('-').map(Number)
          return y === month.year && m - 1 === month.month
        })
        .sort((a, b) => a._start.localeCompare(b._start)),
    [prepared, month],
  )

  if (races.length === 0) return null

  function shift(delta: number) {
    setMonth((v) => {
      const m = v.month + delta
      return { year: v.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 }
    })
  }

  return (
    <section className="px-5 py-14 sm:px-8 md:py-20">
      <div data-anim="reveal" className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-[#ff2c03]">
              Agenda externa · curadoria Somma
            </span>
            <h2
              className="mt-3 text-4xl font-black uppercase leading-[0.95] tracking-tight text-black sm:text-5xl"
              style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
            >
              Corridas em Brasília
            </h2>
            <p className="mt-3 font-semibold text-black/55">
              As principais provas de rua do DF, garimpadas pela gente. Assine a agenda de
              corridas e receba tudo no seu calendário.
            </p>
          </div>

          {/* Toggle */}
          <div className="flex rounded-full border border-neutral-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setView('calendar')}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold transition-colors ${
                view === 'calendar' ? 'bg-black text-white' : 'text-black/55 hover:text-black'
              }`}
            >
              <CalendarDays className="h-4 w-4" />
              Calendário
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold transition-colors ${
                view === 'list' ? 'bg-black text-white' : 'text-black/55 hover:text-black'
              }`}
            >
              <List className="h-4 w-4" />
              Lista
            </button>
          </div>
        </div>

        {view === 'calendar' ? (
          <>
            {/* Toolbar do mês */}
            <div className="mb-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => shift(-1)}
                aria-label="Mês anterior"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-black/60 transition-colors hover:bg-neutral-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => shift(1)}
                aria-label="Próximo mês"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-black/60 transition-colors hover:bg-neutral-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <h3 className="ml-1 text-lg font-black uppercase tracking-tight text-black">
                {MONTHS[month.month]} {month.year}
              </h3>
              <button
                type="button"
                onClick={() => setMonth(firstMonth)}
                className="ml-auto rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-bold text-black/60 transition-colors hover:bg-neutral-50"
              >
                Início
              </button>
            </div>

            {/* Grade */}
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              <div className="grid grid-cols-7 border-b border-neutral-200">
                {WEEKDAYS.map((w) => (
                  <div
                    key={w}
                    className="px-1 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-black/35"
                  >
                    {w}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {cells.map((cell, i) => (
                  <button
                    type="button"
                    key={cell.str + i}
                    onClick={() => setDay({ str: cell.str, races: cell.races })}
                    disabled={!cell.inMonth}
                    aria-label={`Ver corridas de ${cell.day}`}
                    className={`min-h-[72px] border-b border-r border-neutral-100 p-1.5 text-left transition-colors last:border-r-0 sm:min-h-[110px] ${
                      cell.inMonth
                        ? 'cursor-pointer bg-white hover:bg-neutral-50'
                        : 'cursor-default bg-neutral-50/50'
                    }`}
                  >
                    <span
                      className={`text-xs font-bold ${
                        cell.inMonth ? 'text-black/70' : 'text-black/25'
                      }`}
                    >
                      {cell.day}
                    </span>
                    <div className="mt-1 space-y-1">
                      {cell.races.map((r) => (
                        <span
                          key={r.id}
                          className="block truncate rounded-md px-1.5 py-0.5 text-[10px] font-bold leading-tight sm:text-[11px]"
                          style={{ backgroundColor: `${r._color}1a`, color: r._color }}
                        >
                          {r.title}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Lista do mês (detalhes + status) */}
            {monthRaces.length > 0 ? (
              <div className="mt-4 space-y-2">
                {monthRaces.map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-black text-black">{r.title}</p>
                      <p className="text-xs font-semibold text-black/45">{dateLabel(r)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusPill status={r.summary} />
                      {r.cta_url ? (
                        <a
                          href={r.cta_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-semibold text-[#cc2402] hover:text-[#ff2c03]"
                        >
                          {r.cta_label || 'Página da prova'}
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-center text-sm font-medium text-black/40">
                Nenhuma corrida neste mês. Use as setas pra navegar pelos próximos.
              </p>
            )}
          </>
        ) : (
          <>
            {/* Tabela (desktop) */}
            <div className="hidden overflow-hidden rounded-2xl border border-neutral-200 bg-white lg:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-[11px] font-bold uppercase tracking-wider text-black/40">
                    <th className="px-5 py-3.5">Corrida</th>
                    <th className="px-5 py-3.5">Descrição</th>
                    <th className="whitespace-nowrap px-5 py-3.5">Data</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {prepared.map((r) => (
                    <tr key={r.id} className="align-top transition-colors hover:bg-neutral-50/60">
                      <td className="px-5 py-4 font-black text-black">{r.title}</td>
                      <td className="max-w-sm px-5 py-4 text-black/60">{r.description}</td>
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-black/70">
                        {dateLabel(r)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill status={r.summary} />
                      </td>
                      <td className="px-5 py-4">
                        {r.cta_url ? (
                          <a
                            href={r.cta_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-[#cc2402] hover:text-[#ff2c03]"
                          >
                            {r.cta_label || 'Página da prova'}
                            <ArrowUpRight className="h-4 w-4" />
                          </a>
                        ) : (
                          <span className="text-black/30">—</span>
                        )}
                        {r.partner_name ? (
                          <span className="mt-0.5 block text-xs text-black/35">
                            via {r.partner_name}
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards (mobile) */}
            <div className="space-y-3 lg:hidden">
              {prepared.map((r) => (
                <div key={r.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-black text-black">{r.title}</h3>
                    <span className="shrink-0 whitespace-nowrap text-sm font-bold text-black/70">
                      {dateLabel(r)}
                    </span>
                  </div>
                  {r.description ? (
                    <p className="mt-1.5 text-sm text-black/55">{r.description}</p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <StatusPill status={r.summary} />
                    {r.cta_url ? (
                      <a
                        href={r.cta_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-semibold text-[#cc2402]"
                      >
                        {r.cta_label || 'Página da prova'}
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Modal do dia */}
        <Dialog
          open={!!day}
          onOpenChange={(o) => {
            if (!o) setDay(null)
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="capitalize">
                {day ? longDate(day.str) : ''}
              </DialogTitle>
            </DialogHeader>
            {day && day.races.length > 0 ? (
              <div className="space-y-3">
                {day.races.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-xl border border-neutral-200 bg-[#F8F9FA] p-3.5"
                  >
                    <p className="font-black text-black">{r.title}</p>
                    {r.description ? (
                      <p className="mt-1 text-sm text-black/55">{r.description}</p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <StatusPill status={r.summary} />
                      {r.cta_url ? (
                        <a
                          href={r.cta_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-semibold text-[#cc2402] hover:text-[#ff2c03]"
                        >
                          {r.cta_label || 'Página da prova'}
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      ) : null}
                    </div>
                    {r.partner_name ? (
                      <p className="mt-1 text-xs text-black/35">via {r.partner_name}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm font-medium text-black/50">
                Nenhuma corrida neste dia.
              </p>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}
