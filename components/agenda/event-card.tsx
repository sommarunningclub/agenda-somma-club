import Link from 'next/link'
import { ArrowUpRight, MapPin } from 'lucide-react'
import { formatTimeRange, getDayBadge } from '@/lib/format'
import { eventPath } from '@/lib/calendar-data'
import type { EventCardData } from '@/lib/sample-events'
import { DEFAULT_TIMEZONE } from '@/lib/constants'

export function EventCard({ event }: { event: EventCardData }) {
  const tz = event.timezone || DEFAULT_TIMEZONE
  const badge = getDayBadge(event.start_datetime, tz)
  const color = event.category?.color || '#ff2c03'

  return (
    <Link
      href={eventPath(event)}
      className="group relative flex gap-4 agenda-card-sm p-4"
    >
      <div
        className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-somma-orange text-white"
        style={{ boxShadow: `inset 0 -3px 0 0 ${color}` }}
      >
        <span className="text-[11px] font-bold uppercase tracking-wide text-white/70">
          {badge.month}
        </span>
        <span className="text-2xl font-black leading-none">{badge.day}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
            aria-hidden
          />
          <span className="truncate text-xs font-bold uppercase tracking-wide text-somma-ink-muted">
            {event.category?.name ?? 'Somma Club'}
            {event.partner_name ? ` · ${event.partner_name}` : ''}
          </span>
        </div>
        <h3 className="mt-1 line-clamp-2 font-black text-somma-ink group-hover:text-somma-orange-dark">
          {event.title}
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-somma-ink-muted">
          <span className="capitalize">{badge.weekday}</span>
          <span aria-hidden>·</span>
          <span>{formatTimeRange(event.start_datetime, event.end_datetime, tz)}</span>
        </div>
        {event.location_name ? (
          <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-somma-ink-muted/80">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">{event.location_name}</span>
          </div>
        ) : null}
      </div>

      <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 text-somma-orange/30 transition-colors group-hover:text-somma-orange" />
    </Link>
  )
}
