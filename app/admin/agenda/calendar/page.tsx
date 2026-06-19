import { listAdminEvents, listCalendars } from '@/lib/calendar-data'
import { CalendarView } from '@/components/admin/calendar-view'
import { ConfigWarning } from '@/components/admin/config-warning'

export const dynamic = 'force-dynamic'

const mono = { fontFamily: 'var(--font-jetbrains), ui-monospace, monospace' }

export default async function CalendarPage() {
  try {
    const [events, calendars] = await Promise.all([
      listAdminEvents(),
      listCalendars(),
    ])
    return (
      <div className="space-y-6">
        <div>
          <span
            className="text-[11px] font-medium uppercase tracking-wider text-[#9ca3af]"
            style={mono}
          >
            Visão completa
          </span>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Calendário</h1>
        </div>
        <CalendarView events={events} calendars={calendars} />
      </div>
    )
  } catch {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Calendário</h1>
        <ConfigWarning />
      </div>
    )
  }
}
