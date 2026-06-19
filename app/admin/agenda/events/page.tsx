import Link from 'next/link'
import { CalendarPlus } from 'lucide-react'
import {
  listAdminEvents,
  listCalendars,
  listCategories,
  type AdminEventFilters,
} from '@/lib/calendar-data'
import { EventsFilters } from '@/components/admin/events-filters'
import { EventsTable } from '@/components/admin/events-table'
import { ConfigWarning } from '@/components/admin/config-warning'

export const dynamic = 'force-dynamic'

const mono = { fontFamily: 'var(--font-jetbrains), ui-monospace, monospace' }

type SearchParams = Promise<{
  range?: string
  status?: string
  calendar?: string
  category?: string
}>

export default async function EventsListPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const filters: AdminEventFilters = {
    range: sp.range === 'upcoming' || sp.range === 'past' ? sp.range : undefined,
    status: sp.status || undefined,
    calendarId: sp.calendar || undefined,
    categoryId: sp.category || undefined,
  }

  try {
    const [events, calendars, categories] = await Promise.all([
      listAdminEvents(filters),
      listCalendars(),
      listCategories(),
    ])

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span
              className="text-[11px] font-medium uppercase tracking-wider text-[#9ca3af]"
              style={mono}
            >
              Gerenciar
            </span>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Eventos</h1>
          </div>
          <Link
            href="/admin/agenda/events/new"
            className="hidden h-10 items-center gap-1.5 rounded-xl bg-[#ff2c03] px-4 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 lg:inline-flex"
          >
            <CalendarPlus className="h-4 w-4" />
            Novo evento
          </Link>
        </div>

        <EventsFilters calendars={calendars} categories={categories} />

        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d6dae0] bg-white p-12 text-center">
            <p className="text-sm text-[#6b7280]">
              Nenhum evento encontrado com esses filtros.
            </p>
            <Link
              href="/admin/agenda/events/new"
              className="mt-3 inline-block text-sm font-medium text-[#cc2402] hover:text-[#ff2c03]"
            >
              Criar um novo evento
            </Link>
          </div>
        ) : (
          <EventsTable events={events} />
        )}
      </div>
    )
  } catch {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Eventos</h1>
        <ConfigWarning />
      </div>
    )
  }
}
