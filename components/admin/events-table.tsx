'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { StatusBadge } from './status-badge'
import { EventRowActions } from './event-row-actions'
import { setShowInMain } from '@/app/admin/agenda/actions'
import { formatEventDateTime } from '@/lib/format'
import type { CalendarEventWithRelations } from '@/lib/types'

const mono = { fontFamily: 'var(--font-jetbrains), ui-monospace, monospace' }

export function EventsTable({ events }: { events: CalendarEventWithRelations[] }) {
  const router = useRouter()
  const [sel, setSel] = useState<Set<string>>(new Set())
  const [pending, start] = useTransition()

  const allChecked = events.length > 0 && events.every((e) => sel.has(e.id))

  function toggle(id: string) {
    setSel((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }
  function toggleAll() {
    setSel(allChecked ? new Set() : new Set(events.map((e) => e.id)))
  }

  function apply(ids: string[], value: boolean) {
    start(async () => {
      const res = await setShowInMain(ids, value)
      if (res.ok) {
        toast.success(value ? 'Adicionado à agenda interna.' : 'Removido da agenda interna.')
        setSel(new Set())
        router.refresh()
      } else {
        toast.error(res.error ?? 'Algo deu errado.')
      }
    })
  }

  return (
    <div className="space-y-3">
      {sel.size > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#e6e8ec] bg-white px-4 py-2.5">
          <span className="text-sm font-medium text-[#1f2937]">
            {sel.size} selecionado{sel.size > 1 ? 's' : ''}
          </span>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => apply([...sel], true)}
              className="rounded-lg bg-[#1f2329] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Mostrar na interna
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => apply([...sel], false)}
              className="rounded-lg border border-[#e6e8ec] bg-white px-3 py-1.5 text-xs font-semibold text-[#4b5563] transition-colors hover:bg-[#f3f4f7] disabled:opacity-50"
            >
              Remover da interna
            </button>
          </div>
        </div>
      ) : null}

      {/* Mobile: lista de cards (estilo app) */}
      <div className="space-y-3 lg:hidden">
        <label className="flex items-center gap-2 px-1 text-xs font-medium text-[#6b7280]">
          <input
            type="checkbox"
            checked={allChecked}
            onChange={toggleAll}
            aria-label="Selecionar todos"
            className="h-4 w-4 rounded border-neutral-300 accent-[#ff2c03]"
          />
          Selecionar todos
        </label>
        {events.map((e) => (
          <div
            key={e.id}
            className={`rounded-2xl border bg-white p-4 transition-colors ${
              sel.has(e.id) ? 'border-[#ff2c03] ring-1 ring-[#ff2c03]/30' : 'border-[#e6e8ec]'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={sel.has(e.id)}
                onChange={() => toggle(e.id)}
                aria-label={`Selecionar ${e.title}`}
                className="mt-1 h-4 w-4 shrink-0 rounded border-neutral-300 accent-[#ff2c03]"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/admin/agenda/events/${e.id}`}
                    className="text-[15px] font-semibold leading-tight text-[#1f2937] hover:underline"
                  >
                    {e.title}
                  </Link>
                  <EventRowActions id={e.id} status={e.status} />
                </div>
                <p className="mt-1 text-xs text-[#6b7280]" style={mono}>
                  {formatEventDateTime(e.start_datetime, e.timezone)}
                </p>
                {e.partner_name ? (
                  <p className="mt-0.5 text-xs text-[#9ca3af]">Parceiro: {e.partner_name}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge status={e.status} />
                  {e.category ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f3f4f7] px-2.5 py-1 text-xs text-[#4b5563]">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: e.category.color ?? '#ff2c03' }}
                      />
                      {e.category.name}
                    </span>
                  ) : null}
                  {e.calendar ? (
                    <span className="rounded-full bg-[#f3f4f7] px-2.5 py-1 text-xs text-[#6b7280]">
                      {e.calendar.name}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-[#f0f1f4] pt-3">
              <span className="text-xs font-medium text-[#6b7280]">Na agenda interna</span>
              {e.calendar?.slug === 'somma' ? (
                <span className="text-xs text-[#9ca3af]">Sempre</span>
              ) : (
                <Switch
                  checked={!!e.show_in_main}
                  disabled={pending}
                  onCheckedChange={(v) => apply([e.id], v)}
                  aria-label="Mostrar na agenda interna"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: tabela */}
      <div className="hidden overflow-x-auto rounded-2xl border border-[#e6e8ec] bg-white lg:block">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr
              className="border-b border-[#e6e8ec] text-left text-[11px] uppercase tracking-wider text-[#9ca3af]"
              style={mono}
            >
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  aria-label="Selecionar todos"
                  className="h-4 w-4 rounded border-neutral-300 accent-[#ff2c03]"
                />
              </th>
              <th className="px-4 py-3 font-medium">Evento</th>
              <th className="px-4 py-3 font-medium">Data e horário</th>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 font-medium">Calendário</th>
              <th className="px-4 py-3 font-medium">Na interna</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eef0f3]">
            {events.map((e) => (
              <tr key={e.id} className="transition-colors hover:bg-[#f8f9fb]">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={sel.has(e.id)}
                    onChange={() => toggle(e.id)}
                    aria-label={`Selecionar ${e.title}`}
                    className="h-4 w-4 rounded border-neutral-300 accent-[#ff2c03]"
                  />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/agenda/events/${e.id}`}
                    className="font-medium text-[#1f2937] hover:underline"
                  >
                    {e.title}
                  </Link>
                  {e.partner_name ? (
                    <span className="block text-xs text-[#9ca3af]">
                      Parceiro: {e.partner_name}
                    </span>
                  ) : null}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-[#6b7280]" style={mono}>
                  {formatEventDateTime(e.start_datetime, e.timezone)}
                </td>
                <td className="px-4 py-3">
                  {e.category ? (
                    <span className="inline-flex items-center gap-1.5 text-[#4b5563]">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: e.category.color ?? '#ff2c03' }}
                      />
                      {e.category.name}
                    </span>
                  ) : (
                    <span className="text-[#c3c7cf]">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-[#6b7280]">{e.calendar?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  {e.calendar?.slug === 'somma' ? (
                    <span className="text-xs text-[#9ca3af]">Interna</span>
                  ) : (
                    <Switch
                      checked={!!e.show_in_main}
                      disabled={pending}
                      onCheckedChange={(v) => apply([e.id], v)}
                      aria-label="Mostrar na agenda interna"
                    />
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={e.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <EventRowActions id={e.id} status={e.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
