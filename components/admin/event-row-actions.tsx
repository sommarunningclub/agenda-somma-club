'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import Link from 'next/link'
import {
  Copy,
  MoreHorizontal,
  Pause,
  Pencil,
  Send,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  deleteEvent,
  duplicateEvent,
  setEventStatus,
} from '@/app/admin/agenda/actions'
import { track } from '@/lib/tracking'
import type { EventStatus } from '@/lib/constants'

export function EventRowActions({
  id,
  status,
}: {
  id: string
  status: EventStatus
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    startTransition(async () => {
      const res = await fn()
      if (res.ok) {
        toast.success(success)
        router.refresh()
      } else {
        toast.error(res.error ?? 'Algo deu errado.')
      }
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={pending}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50"
        aria-label="Ações"
      >
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <Link href={`/admin/agenda/events/${id}`}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </DropdownMenuItem>

        {status !== 'published' ? (
          <DropdownMenuItem
            onClick={() => {
              run(() => setEventStatus(id, 'published'), 'Evento publicado.')
              track('calendar_admin_event_publish', { id })
            }}
          >
            <Send className="mr-2 h-4 w-4" />
            Publicar
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => run(() => setEventStatus(id, 'paused'), 'Evento pausado.')}
          >
            <Pause className="mr-2 h-4 w-4" />
            Pausar
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={() => run(() => duplicateEvent(id), 'Evento duplicado.')}
        >
          <Copy className="mr-2 h-4 w-4" />
          Duplicar
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => {
            if (confirm('Excluir este evento? Ele sairá do calendário público.')) {
              run(() => deleteEvent(id), 'Evento excluído.')
            }
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
