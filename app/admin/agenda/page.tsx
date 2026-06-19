import Link from 'next/link'
import { ArrowRight, CalendarClock, CalendarDays, FileEdit, Send } from 'lucide-react'
import { listAdminEvents } from '@/lib/calendar-data'
import { getServiceClient } from '@/lib/supabase'
import { ConfigWarning } from '@/components/admin/config-warning'
import { StatusBadge } from '@/components/admin/status-badge'
import { formatEventDateTime } from '@/lib/format'
import type { CalendarEventWithRelations } from '@/lib/types'

export const dynamic = 'force-dynamic'

const mono = { fontFamily: 'var(--font-jetbrains), ui-monospace, monospace' }

export default async function AdminDashboard() {
  let events: CalendarEventWithRelations[] = []
  let configured = true
  try {
    events = await listAdminEvents()
  } catch {
    configured = false
  }

  if (!configured) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Painel</h1>
        <ConfigWarning />
      </div>
    )
  }

  const now = Date.now()
  const published = events.filter((e) => e.status === 'published')
  const drafts = events.filter((e) => e.status === 'draft')
  const upcoming = events
    .filter((e) => new Date(e.end_datetime).getTime() >= now && e.status !== 'archived')
    .sort(
      (a, b) =>
        new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime(),
    )

  let clicksCount = 0
  let leadsCount = 0
  try {
    const db = getServiceClient()
    const [{ count: cc }, { count: lc }] = await Promise.all([
      db.from('calendar_clicks').select('*', { count: 'exact', head: true }),
      db.from('calendar_leads').select('*', { count: 'exact', head: true }),
    ])
    clicksCount = cc ?? 0
    leadsCount = lc ?? 0
  } catch {
    /* tracking pode não ter dados ainda */
  }

  const stats = [
    { label: 'Total de eventos', value: events.length, icon: CalendarDays },
    { label: 'Publicados', value: published.length, icon: Send },
    { label: 'Rascunhos', value: drafts.length, icon: FileEdit },
    { label: 'Próximos', value: upcoming.length, icon: CalendarClock },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span
            className="text-[11px] font-medium uppercase tracking-wider text-[#9ca3af]"
            style={mono}
          >
            Visão geral
          </span>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Painel</h1>
        </div>
        <Link
          href="/admin/agenda/events"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#cc2402] hover:text-[#ff2c03]"
        >
          Ver todos os eventos <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-[#e6e8ec] bg-white p-5">
            <s.icon className="h-5 w-5 text-[#9ca3af]" />
            <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
              {s.value}
            </p>
            <p
              className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-[#6b7280]"
              style={mono}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <Link
        href="/admin/agenda/metrics"
        className="flex items-center justify-between gap-4 rounded-2xl border border-[#e6e8ec] bg-white p-5 transition-colors hover:border-[#ff2c03]/40"
      >
        <div className="flex flex-wrap gap-8">
          <div>
            <p className="text-2xl font-semibold tabular-nums">{clicksCount}</p>
            <p
              className="text-[11px] font-medium uppercase tracking-wider text-[#6b7280]"
              style={mono}
            >
              Cliques p/ adicionar
            </p>
          </div>
          <div>
            <p className="text-2xl font-semibold tabular-nums">{leadsCount}</p>
            <p
              className="text-[11px] font-medium uppercase tracking-wider text-[#6b7280]"
              style={mono}
            >
              Leads captados
            </p>
          </div>
        </div>
        <span className="shrink-0 text-sm font-medium text-[#cc2402]">Ver métricas →</span>
      </Link>

      <div className="rounded-2xl border border-[#e6e8ec] bg-white">
        <div className="flex items-center justify-between border-b border-[#e6e8ec] px-5 py-4">
          <h2 className="text-sm font-semibold">Próximos eventos</h2>
          <Link
            href="/admin/agenda/events/new"
            className="text-sm font-medium text-[#cc2402] hover:text-[#ff2c03]"
          >
            + Novo evento
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-[#6b7280]">
            Nenhum evento futuro.{' '}
            <Link
              href="/admin/agenda/events/new"
              className="font-medium text-[#cc2402] hover:text-[#ff2c03]"
            >
              Criar o primeiro
            </Link>
            .
          </p>
        ) : (
          <ul className="divide-y divide-[#eef0f3]">
            {upcoming.slice(0, 6).map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-[#f8f9fb]"
              >
                <div className="min-w-0">
                  <Link
                    href={`/admin/agenda/events/${e.id}`}
                    className="truncate text-sm font-medium text-[#1f2937] hover:underline"
                  >
                    {e.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-[#6b7280]" style={mono}>
                    {formatEventDateTime(e.start_datetime, e.timezone)}
                    {e.calendar ? ` · ${e.calendar.name}` : ''}
                  </p>
                </div>
                <StatusBadge status={e.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
