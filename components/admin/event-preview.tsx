'use client'

import { MapPin } from 'lucide-react'
import { formatEventDateTime, formatTimeRange } from '@/lib/format'

interface PreviewProps {
  title?: string
  start?: string
  end?: string
  locationName?: string
  categoryName?: string
  categoryColor?: string
  partnerName?: string
}

/** Pré-visualização de como o evento aparece no calendário. */
export function EventPreview({
  title,
  start,
  end,
  locationName,
  categoryName,
  categoryColor = '#ff2c03',
  partnerName,
}: PreviewProps) {
  const hasDates = Boolean(start && end)

  return (
    <div className="rounded-xl border bg-white p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-400">
        Pré-visualização
      </p>
      <div className="rounded-xl border border-neutral-900/10 bg-neutral-950 p-4 text-white">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: categoryColor }}
          />
          <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-white/50">
            {categoryName || 'Somma Club'}
            {partnerName ? ` · ${partnerName}` : ''}
          </span>
        </div>
        <h3 className="mt-1 font-semibold">{title || 'Título do evento'}</h3>
        <p className="mt-1 text-sm text-white/60">
          {hasDates ? (
            <>
              <span className="capitalize">
                {formatEventDateTime(start as string)}
              </span>{' '}
              · {formatTimeRange(start as string, end as string)}
            </>
          ) : (
            'Defina data e horário'
          )}
        </p>
        {locationName ? (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-white/50">
            <MapPin className="h-3.5 w-3.5" />
            {locationName}
          </p>
        ) : null}
      </div>
    </div>
  )
}
