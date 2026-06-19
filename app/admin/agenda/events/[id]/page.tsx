import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import {
  getAdminEvent,
  listCalendars,
  listCategories,
} from '@/lib/calendar-data'
import { EventForm } from '@/components/admin/event-form'
import { StatusBadge } from '@/components/admin/status-badge'
import { DuplicateButton } from '@/components/admin/duplicate-button'
import { ConfigWarning } from '@/components/admin/config-warning'

export const dynamic = 'force-dynamic'

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  try {
    const [event, calendars, categories] = await Promise.all([
      getAdminEvent(id),
      listCalendars(),
      listCategories(),
    ])

    if (!event) notFound()

    return (
      <div className="space-y-6">
        <div>
          <Link
            href="/admin/agenda/events"
            className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para eventos
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Editar evento</h1>
            <StatusBadge status={event.status} />
            <div className="ml-auto">
              <DuplicateButton id={event.id} />
            </div>
          </div>
        </div>
        <EventForm
          mode="edit"
          eventId={event.id}
          initial={event}
          calendars={calendars}
          categories={categories}
        />
      </div>
    )
  } catch {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Editar evento</h1>
        <ConfigWarning />
      </div>
    )
  }
}
