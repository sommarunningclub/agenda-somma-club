import { STATUS_LABELS, type EventStatus } from '@/lib/constants'
import { cn } from '@/lib/utils'

const STYLES: Record<EventStatus, string> = {
  draft: 'bg-[#f3f4f7] text-[#6b7280]',
  published: 'bg-[#16a34a]/10 text-[#15803d]',
  paused: 'bg-[#d97706]/10 text-[#b45309]',
  cancelled: 'bg-[#dc2626]/10 text-[#dc2626]',
  archived: 'bg-[#f3f4f7] text-[#9ca3af]',
}

export function StatusBadge({ status }: { status: EventStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        STYLES[status] ?? STYLES.draft,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
