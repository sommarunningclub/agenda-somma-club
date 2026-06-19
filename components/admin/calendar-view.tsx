'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { DEFAULT_TIMEZONE } from '@/lib/constants'
import type { Calendar, CalendarEventWithRelations } from '@/lib/types'

const mono = { fontFamily: 'var(--font-jetbrains), ui-monospace, monospace' }
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function spDate(iso: string, tz = DEFAULT_TIMEZONE): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso))
}

function spTime(iso: string, tz = DEFAULT_TIMEZONE): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

function todaySp(tz = DEFAULT_TIMEZONE): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

interface Prepared extends CalendarEventWithRelations {
  _start: string
  _end: string
  _color: string
}

export function CalendarView({
  events,
  calendars,
}: {
  events: CalendarEventWithRelations[]
  calendars: Calendar[]
}) {
  const router = useRouter()
  const today = todaySp()
  const [ty, tm] = today.split('-').map(Number)
  const [view, setView] = useState({ year: ty, month: tm - 1 })
  const [calFilter, setCalFilter] = useState('')

  const prepared: Prepared[] = useMemo(
    () =>
      events
        .filter((e) => (calFilter ? e.calendar_id === calFilter : true))
        .map((e) => ({
          ...e,
          _start: spDate(e.start_datetime, e.timezone),
          _end: spDate(e.end_datetime, e.timezone),
          _color: e.category?.color || e.calendar?.color || '#ff2c03',
        })),
    [events, calFilter],
  )

  const cells = useMemo(() => {
    const firstWeekday = new Date(Date.UTC(view.year, view.month, 1)).getUTCDay()
    const start = new Date(Date.UTC(view.year, view.month, 1 - firstWeekday))
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start)
      d.setUTCDate(start.getUTCDate() + i)
      const str = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
      return {
        str,
        day: d.getUTCDate(),
        inMonth: d.getUTCMonth() === view.month,
        events: prepared
          .filter((e) => str >= e._start && str <= e._end)
          .sort((a, b) => a.start_datetime.localeCompare(b.start_datetime)),
      }
    })
  }, [view, prepared])

  const monthEventDays = cells.filter((c) => c.inMonth && c.events.length > 0).length
  const daysInMonth = new Date(Date.UTC(view.year, view.month + 1, 0)).getUTCDate()
  const freeDays = daysInMonth - monthEventDays

  function shift(delta: number) {
    setView((v) => {
      const m = v.month + delta
      return { year: v.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 }
    })
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shift(-1)}
            aria-label="Mês anterior"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e6e8ec] bg-white text-[#4b5563] transition-colors hover:bg-[#f3f4f7]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            aria-label="Próximo mês"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e6e8ec] bg-white text-[#4b5563] transition-colors hover:bg-[#f3f4f7]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <h2 className="ml-1 text-lg font-semibold tracking-tight">
            {MONTHS[view.month]} {view.year}
          </h2>
          <button
            type="button"
            onClick={() => setView({ year: ty, month: tm - 1 })}
            className="ml-1 rounded-lg border border-[#e6e8ec] bg-white px-3 py-1.5 text-xs font-medium text-[#4b5563] transition-colors hover:bg-[#f3f4f7]"
          >
            Hoje
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-[#9ca3af] sm:inline" style={mono}>
            {monthEventDays} c/ eventos · {freeDays} livres
          </span>
          <select
            value={calFilter}
            onChange={(e) => setCalFilter(e.target.value)}
            className="h-9 rounded-xl border border-[#e6e8ec] bg-white px-3 text-sm text-[#4b5563] outline-none focus:border-[#ff2c03] focus:ring-4 focus:ring-[#ff2c03]/10"
          >
            <option value="">Todos os calendários</option>
            {calendars.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grade */}
      <div className="overflow-hidden rounded-2xl border border-[#e6e8ec] bg-white">
        <div className="grid grid-cols-7 border-b border-[#e6e8ec]">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="px-2 py-2.5 text-center text-[11px] font-medium uppercase tracking-wider text-[#9ca3af]"
              style={mono}
            >
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((cell, i) => {
            const isToday = cell.str === today
            return (
              <button
                type="button"
                key={cell.str + i}
                onClick={() => router.push(`/admin/agenda/events/new?date=${cell.str}`)}
                className={`group relative min-h-[96px] border-b border-r border-[#eef0f3] p-1.5 text-left transition-colors last:border-r-0 hover:bg-[#f8f9fb] sm:min-h-[116px] ${
                  cell.inMonth ? 'bg-white' : 'bg-[#fafbfc]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                      isToday
                        ? 'bg-[#ff2c03] text-white'
                        : cell.inMonth
                          ? 'text-[#1f2937]'
                          : 'text-[#c3c7cf]'
                    }`}
                  >
                    {cell.day}
                  </span>
                  <Plus className="h-3.5 w-3.5 text-[#c3c7cf] opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                <div className="mt-1 space-y-1">
                  {cell.events.slice(0, 3).map((e) => (
                    <span
                      key={e.id}
                      role="link"
                      tabIndex={0}
                      onClick={(ev) => {
                        ev.stopPropagation()
                        router.push(`/admin/agenda/events/${e.id}`)
                      }}
                      className="block truncate rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-tight hover:brightness-95"
                      style={{ backgroundColor: `${e._color}1a`, color: e._color }}
                      title={e.title}
                    >
                      {!e.is_all_day ? `${spTime(e.start_datetime, e.timezone)} ` : ''}
                      {e.title}
                    </span>
                  ))}
                  {cell.events.length > 3 ? (
                    <span className="block px-1.5 text-[10px] font-medium text-[#9ca3af]">
                      +{cell.events.length - 3} mais
                    </span>
                  ) : null}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap items-center gap-4">
        {calendars.map((c) => (
          <span key={c.id} className="inline-flex items-center gap-1.5 text-xs text-[#6b7280]">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: c.color ?? '#ff2c03' }}
            />
            {c.name}
          </span>
        ))}
      </div>
    </div>
  )
}
