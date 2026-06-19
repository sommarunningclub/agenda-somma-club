'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Copy, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { duplicateEvent } from '@/app/admin/agenda/actions'

export function DuplicateButton({ id }: { id: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await duplicateEvent(id)
          if (res.ok && res.id) {
            toast.success('Evento duplicado. Edite a cópia (rascunho).')
            router.push(`/admin/agenda/events/${res.id}`)
            router.refresh()
          } else {
            toast.error(res.error ?? 'Não foi possível duplicar.')
          }
        })
      }
      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#e6e8ec] bg-white px-3 text-sm font-semibold text-[#4b5563] transition-colors hover:bg-[#f3f4f7] disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
      Duplicar
    </button>
  )
}
