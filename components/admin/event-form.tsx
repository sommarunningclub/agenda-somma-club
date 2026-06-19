'use client'

import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { EventPreview } from './event-preview'
import { createEvent, updateEvent } from '@/app/admin/agenda/actions'
import { track } from '@/lib/tracking'
import { toDatetimeLocalValue } from '@/lib/format'
import { EVENT_STATUSES, STATUS_LABELS, DEFAULT_TIMEZONE } from '@/lib/constants'
import type { EventInput } from '@/lib/validations'
import type { Calendar, CalendarEventWithRelations, EventCategory } from '@/lib/types'

interface FormValues {
  calendar_id: string
  title: string
  slug: string
  summary: string
  description: string
  location_name: string
  location_address: string
  location_url: string
  start_datetime: string
  end_datetime: string
  timezone: string
  is_all_day: boolean
  is_recurring: boolean
  recurrence_rule: string
  category_id: string
  partner_name: string
  partner_logo_url: string
  checkin_url: string
  cta_label: string
  cta_url: string
  image_url: string
  status: (typeof EVENT_STATUSES)[number]
  visibility: 'public' | 'unlisted' | 'private'
  show_in_main: boolean
  reminder_24h: boolean
  reminder_2h: boolean
  reminder_30m: boolean
}

function buildDefaults(
  initial: CalendarEventWithRelations | null,
  calendars: Calendar[],
  initialDate?: string,
): FormValues {
  const fallbackCalendar =
    calendars.find((c) => c.slug === 'somma')?.id ?? calendars[0]?.id ?? ''
  const start = initial
    ? toDatetimeLocalValue(initial.start_datetime)
    : initialDate
      ? `${initialDate}T07:00`
      : ''
  const end = initial
    ? toDatetimeLocalValue(initial.end_datetime)
    : initialDate
      ? `${initialDate}T09:00`
      : ''
  return {
    calendar_id: initial?.calendar_id ?? fallbackCalendar,
    title: initial?.title ?? '',
    slug: initial?.slug ?? '',
    summary: initial?.summary ?? '',
    description: initial?.description ?? '',
    location_name: initial?.location_name ?? '',
    location_address: initial?.location_address ?? '',
    location_url: initial?.location_url ?? '',
    start_datetime: start,
    end_datetime: end,
    timezone: initial?.timezone ?? DEFAULT_TIMEZONE,
    is_all_day: initial?.is_all_day ?? false,
    is_recurring: initial?.is_recurring ?? false,
    recurrence_rule: initial?.recurrence_rule ?? '',
    category_id: initial?.category_id ?? '',
    partner_name: initial?.partner_name ?? '',
    partner_logo_url: initial?.partner_logo_url ?? '',
    checkin_url: initial?.checkin_url ?? '',
    cta_label: initial?.cta_label ?? '',
    cta_url: initial?.cta_url ?? '',
    image_url: initial?.image_url ?? '',
    status: (initial?.status ?? 'draft') as FormValues['status'],
    visibility: (initial?.visibility ?? 'public') as FormValues['visibility'],
    show_in_main: initial?.show_in_main ?? false,
    reminder_24h: initial?.reminder_24h ?? true,
    reminder_2h: initial?.reminder_2h ?? false,
    reminder_30m: initial?.reminder_30m ?? true,
  }
}

function parseMinutes(text: string): number[] {
  return text
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0)
}

export function EventForm({
  mode,
  eventId,
  initial,
  initialDate,
  calendars,
  categories,
}: {
  mode: 'create' | 'edit'
  eventId?: string
  initial: CalendarEventWithRelations | null
  initialDate?: string
  calendars: Calendar[]
  categories: EventCategory[]
}) {
  const router = useRouter()
  const { register, handleSubmit, control, watch, formState } = useForm<FormValues>({
    defaultValues: buildDefaults(initial, calendars, initialDate),
  })

  const v = watch()
  const selectedCategory = categories.find((c) => c.id === v.category_id)

  async function onSubmit(values: FormValues) {
    const customText =
      (document.getElementById('custom_reminders') as HTMLInputElement | null)?.value ?? ''

    if (values.title.trim().length < 3) {
      toast.error('Informe um título com pelo menos 3 caracteres.')
      return
    }
    if (!values.start_datetime || !values.end_datetime) {
      toast.error('Informe início e término.')
      return
    }
    if (new Date(values.end_datetime) < new Date(values.start_datetime)) {
      toast.error('O término deve ser depois do início.')
      return
    }

    const payload: EventInput = {
      ...values,
      custom_reminders: parseMinutes(customText),
    } as unknown as EventInput

    const res =
      mode === 'create'
        ? await createEvent(payload)
        : await updateEvent(eventId as string, payload)

    if (!res.ok) {
      toast.error(res.error ?? 'Não foi possível salvar.')
      return
    }

    if (mode === 'create') {
      track('calendar_admin_event_create', { id: res.id })
    }
    if (values.status === 'published') {
      track('calendar_admin_event_publish', { id: res.id ?? eventId })
    }

    toast.success(mode === 'create' ? 'Evento criado!' : 'Evento salvo!')
    router.push('/admin/agenda/events')
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-8 lg:grid-cols-[1fr_320px]"
    >
      <div className="space-y-8">
        {/* Informações principais */}
        <Section title="Informações principais">
          <Field label="Título" required>
            <Input {...register('title')} placeholder="Somma Club | Encontro oficial" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Calendário" required>
              <select className={selectClass} {...register('calendar_id')}>
                {calendars.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Slug (opcional)" hint="Gerado a partir do título se vazio.">
              <Input {...register('slug')} placeholder="encontro-oficial" />
            </Field>
          </div>
          <Field label="Resumo curto (opcional)">
            <Input {...register('summary')} placeholder="Aparece no lembrete do calendário" />
          </Field>
        </Section>

        {/* Data e horário */}
        <Section title="Data e horário">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Início" required>
              <Input type="datetime-local" {...register('start_datetime')} />
            </Field>
            <Field label="Término" required>
              <Input type="datetime-local" {...register('end_datetime')} />
            </Field>
          </div>
          <p className="text-xs text-neutral-500">
            Fuso horário: <strong>America/Sao_Paulo (Brasília)</strong>
          </p>
          <input type="hidden" {...register('timezone')} />
          <Toggle control={control} name="is_all_day" label="Evento de dia inteiro" />
        </Section>

        {/* Local */}
        <Section title="Local">
          <Field label="Nome do local">
            <Input {...register('location_name')} placeholder="Parque da Cidade" />
          </Field>
          <Field label="Endereço">
            <Input
              {...register('location_address')}
              placeholder="Estacionamento 10, Brasília - DF"
            />
          </Field>
          <Field label="Link do local (Maps, opcional)">
            <Input {...register('location_url')} placeholder="https://maps.google.com/..." />
          </Field>
        </Section>

        {/* Descrição e links */}
        <Section title="Descrição e links">
          <Field label="Descrição">
            <Textarea
              rows={5}
              {...register('description')}
              placeholder="Descreva o evento. Os links abaixo entram automaticamente na descrição do calendário."
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Link de check-in">
              <Input {...register('checkin_url')} placeholder="https://sommaclub.com.br" />
            </Field>
            <Field label="Link da imagem (opcional)">
              <Input {...register('image_url')} placeholder="https://..." />
            </Field>
            <Field label="Texto do botão (CTA)">
              <Input {...register('cta_label')} placeholder="Saiba mais" />
            </Field>
            <Field label="Link do botão (CTA)">
              <Input {...register('cta_url')} placeholder="https://..." />
            </Field>
          </div>
        </Section>

        {/* Categoria e parceiro */}
        <Section title="Categoria e parceiro">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Categoria">
              <select className={selectClass} {...register('category_id')}>
                <option value="">Sem categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Nome do parceiro (opcional)">
              <Input {...register('partner_name')} placeholder="Evolve" />
            </Field>
            <Field label="Logo do parceiro (URL, opcional)">
              <Input {...register('partner_logo_url')} placeholder="https://..." />
            </Field>
          </div>
        </Section>

        {/* Lembretes */}
        <Section title="Lembretes">
          <Toggle control={control} name="reminder_24h" label="24 horas antes" />
          <Toggle control={control} name="reminder_2h" label="2 horas antes" />
          <Toggle control={control} name="reminder_30m" label="30 minutos antes" />
          <Field
            label="Lembretes extras (minutos, separados por vírgula)"
            hint="Ex.: 60, 15 → 1h e 15min antes."
          >
            <Input
              id="custom_reminders"
              defaultValue={(initial?.custom_reminders ?? []).join(', ')}
              placeholder="60, 15"
            />
          </Field>
        </Section>

        {/* Recorrência */}
        <Section title="Recorrência">
          <Toggle control={control} name="is_recurring" label="Evento recorrente" />
          <Field
            label="Regra de recorrência (RRULE)"
            hint="Ex.: FREQ=WEEKLY;BYDAY=SA (toda semana no sábado)."
          >
            <Input
              {...register('recurrence_rule')}
              placeholder="FREQ=WEEKLY;BYDAY=SA"
            />
          </Field>
        </Section>

        {/* Status de publicação */}
        <Section title="Status de publicação">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Status">
              <select className={selectClass} {...register('status')}>
                {EVENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Visibilidade">
              <select className={selectClass} {...register('visibility')}>
                <option value="public">Pública</option>
                <option value="unlisted">Não listada</option>
                <option value="private">Privada</option>
              </select>
            </Field>
          </div>
          <p className="text-xs text-neutral-500">
            Apenas eventos <strong>publicados</strong> e <strong>públicos</strong> entram no
            feed .ics. Use <strong>cancelado</strong> para remover de quem já assinou.
          </p>
          <Toggle
            control={control}
            name="show_in_main"
            label="Aparecer também na agenda interna (Somma)"
          />
          <p className="text-xs text-neutral-500">
            Útil para corridas externas: liga o evento também no feed e na landing da
            agenda do Somma.
          </p>
        </Section>

        <div className="flex items-center gap-3 border-t pt-6">
          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            {mode === 'create' ? 'Criar evento' : 'Salvar alterações'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push('/admin/agenda/events')}
          >
            Cancelar
          </Button>
        </div>
      </div>

      {/* Preview sticky */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <EventPreview
          title={v.title}
          start={v.start_datetime}
          end={v.end_datetime}
          locationName={v.location_name}
          categoryName={selectedCategory?.name}
          categoryColor={selectedCategory?.color ?? '#ff2c03'}
          partnerName={v.partner_name}
        />
      </aside>
    </form>
  )
}

/* ------------------------------- helpers UI ------------------------------- */

const selectClass =
  'flex h-10 w-full rounded-xl border border-[#e6e8ec] bg-white px-3 text-sm text-[#4b5563] outline-none transition-colors focus:border-[#ff2c03] focus:ring-4 focus:ring-[#ff2c03]/10'

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-[#e6e8ec] bg-white p-6">
      <h2
        className="mb-4 text-[11px] font-medium uppercase tracking-wider text-[#9ca3af]"
        style={{ fontFamily: 'var(--font-jetbrains), ui-monospace, monospace' }}
      >
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required ? <span className="text-[#ff2c03]"> *</span> : null}
      </Label>
      {children}
      {hint ? <p className="text-xs text-neutral-400">{hint}</p> : null}
    </div>
  )
}

function Toggle({
  control,
  name,
  label,
}: {
  control: ReturnType<typeof useForm<FormValues>>['control']
  name:
    | 'is_all_day'
    | 'is_recurring'
    | 'reminder_24h'
    | 'reminder_2h'
    | 'reminder_30m'
    | 'show_in_main'
  label: string
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border bg-neutral-50/60 px-3.5 py-2.5">
          <span className="text-sm font-medium text-neutral-700">{label}</span>
          <Switch checked={field.value} onCheckedChange={field.onChange} />
        </label>
      )}
    />
  )
}
