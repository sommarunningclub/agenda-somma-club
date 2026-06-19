'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { EVENT_STATUSES, STATUS_LABELS } from '@/lib/constants'
import type { Calendar, EventCategory } from '@/lib/types'

const selectClass =
  'h-10 rounded-xl border border-[#e6e8ec] bg-white px-3 text-sm text-[#4b5563] outline-none transition-colors focus:border-[#ff2c03] focus:ring-4 focus:ring-[#ff2c03]/10'

export function EventsFilters({
  calendars,
  categories,
}: {
  calendars: Calendar[]
  categories: EventCategory[]
}) {
  const router = useRouter()
  const params = useSearchParams()

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    router.push(`/admin/agenda/events?${next.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className={selectClass}
        value={params.get('range') ?? ''}
        onChange={(e) => update('range', e.target.value)}
        aria-label="Período"
      >
        <option value="">Todos os períodos</option>
        <option value="upcoming">Próximos</option>
        <option value="past">Passados</option>
      </select>

      <select
        className={selectClass}
        value={params.get('status') ?? ''}
        onChange={(e) => update('status', e.target.value)}
        aria-label="Status"
      >
        <option value="">Todos os status</option>
        {EVENT_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={params.get('calendar') ?? ''}
        onChange={(e) => update('calendar', e.target.value)}
        aria-label="Calendário"
      >
        <option value="">Todos os calendários</option>
        {calendars.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={params.get('category') ?? ''}
        onChange={(e) => update('category', e.target.value)}
        aria-label="Categoria"
      >
        <option value="">Todas as categorias</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  )
}
