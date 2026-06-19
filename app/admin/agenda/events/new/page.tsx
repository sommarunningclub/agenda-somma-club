import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { listCalendars, listCategories } from '@/lib/calendar-data'
import { EventForm } from '@/components/admin/event-form'
import { ConfigWarning } from '@/components/admin/config-warning'

export const dynamic = 'force-dynamic'

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const { date } = await searchParams
  const initialDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined
  try {
    const [calendars, categories] = await Promise.all([
      listCalendars(),
      listCategories(),
    ])

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
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Novo evento</h1>
        </div>
        <EventForm
          mode="create"
          initial={null}
          initialDate={initialDate}
          calendars={calendars}
          categories={categories}
        />
      </div>
    )
  } catch {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Novo evento</h1>
        <ConfigWarning />
      </div>
    )
  }
}
