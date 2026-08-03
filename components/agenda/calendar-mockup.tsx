import { formatTimeRange, getDayBadge } from '@/lib/format'
import { DEFAULT_TIMEZONE } from '@/lib/constants'
import type { EventCardData } from '@/lib/sample-events'

/** Mock visual de um app de calendário com a Agenda Somma já assinada. */
export function CalendarMockup({ events }: { events: EventCardData[] }) {
  const list = events.slice(0, 4)
  const monthLabel = new Intl.DateTimeFormat('pt-BR', {
    timeZone: DEFAULT_TIMEZONE,
    month: 'long',
    year: 'numeric',
  })
    .format(new Date())
    .replace(/^./, (c) => c.toUpperCase())

  return (
    <div className="relative mx-auto w-full max-w-sm">
      {/* glow */}
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-[#ff2c03]/20 blur-3xl" aria-hidden />
      <div className="overflow-hidden rounded-[2rem] border border-white/15 bg-zinc-950/90 shadow-2xl">
        {/* barra do app */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-5 py-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-[#ff4d35]">
              Agenda Somma Club
            </p>
            <p className="text-lg font-bold text-white">{monthLabel}</p>
          </div>
          <span
            data-anim="mockup-badge"
            className="inline-flex h-8 items-center rounded-full bg-[#ff2c03]/15 px-3 text-xs font-semibold text-[#ff6a52]"
          >
            Assinada ✓
          </span>
        </div>

        {/* lista de eventos */}
        <ul className="divide-y divide-white/5">
          {list.map((event) => {
            const tz = event.timezone || DEFAULT_TIMEZONE
            const badge = getDayBadge(event.start_datetime, tz)
            const color = event.category?.color || '#ff2c03'
            return (
              <li
                key={event.id}
                data-anim="mockup-row"
                className="flex items-center gap-3 px-5 py-3.5"
              >
                <div className="flex w-10 flex-col items-center">
                  <span className="text-[10px] font-semibold uppercase text-white/40">
                    {badge.weekday}
                  </span>
                  <span className="text-lg font-bold leading-tight text-white">
                    {badge.day}
                  </span>
                </div>
                <div
                  data-anim="mockup-bar"
                  className="h-9 w-1 origin-top rounded-full"
                  style={{ backgroundColor: color }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {event.title}
                  </p>
                  <p className="text-xs text-white/50">
                    {formatTimeRange(event.start_datetime, event.end_datetime, tz)}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>

        <div className="border-t border-white/10 bg-white/[0.02] px-5 py-3 text-center text-[11px] text-white/40">
          Atualiza sozinho toda vez que o Somma posta algo novo
        </div>
      </div>
    </div>
  )
}
