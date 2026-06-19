'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { eventSchema, type EventInput } from '@/lib/validations'
import { isAdminAuthenticated } from '@/lib/auth'
import { getServiceClient } from '@/lib/supabase'
import { slugify } from '@/lib/calendar-data'
import { localInputToUtcISO } from '@/lib/format'
import type { EventStatus } from '@/lib/constants'

export interface ActionResult {
  ok: boolean
  id?: string
  error?: string
}

/** Garante que apenas o admin autenticado executa escritas. */
async function assertAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login')
  }
}

function inputToRow(input: EventInput) {
  const tz = input.timezone || 'America/Sao_Paulo'
  return {
    calendar_id: input.calendar_id,
    category_id: input.category_id,
    title: input.title,
    slug: input.slug || slugify(input.title),
    summary: input.summary,
    description: input.description,
    location_name: input.location_name,
    location_address: input.location_address,
    location_url: input.location_url,
    start_datetime: localInputToUtcISO(input.start_datetime, tz),
    end_datetime: localInputToUtcISO(input.end_datetime, tz),
    timezone: tz,
    is_all_day: input.is_all_day,
    is_recurring: input.is_recurring,
    recurrence_rule: input.recurrence_rule,
    partner_name: input.partner_name,
    partner_logo_url: input.partner_logo_url,
    checkin_url: input.checkin_url,
    cta_label: input.cta_label,
    cta_url: input.cta_url,
    image_url: input.image_url,
    status: input.status,
    visibility: input.visibility,
    show_in_main: input.show_in_main,
    reminder_24h: input.reminder_24h,
    reminder_2h: input.reminder_2h,
    reminder_30m: input.reminder_30m,
    custom_reminders: input.custom_reminders,
  }
}

function revalidateAll() {
  revalidatePath('/agenda')
  revalidatePath('/admin/agenda')
  revalidatePath('/admin/agenda/events')
}

export async function createEvent(input: EventInput): Promise<ActionResult> {
  await assertAdmin()
  const parsed = eventSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  try {
    const row = inputToRow(parsed.data)
    const supabase = getServiceClient()
    const payload = {
      ...row,
      created_by: 'admin',
      updated_by: 'admin',
      published_at: row.status === 'published' ? new Date().toISOString() : null,
    }
    let res = await supabase
      .from('calendar_events')
      .insert(payload)
      .select('id')
      .single()
    if (res.error) {
      // coluna show_in_main ainda não existe → tenta sem ela
      const { show_in_main: _omit, ...fallback } = payload
      res = await supabase.from('calendar_events').insert(fallback).select('id').single()
    }
    if (res.error) throw res.error
    revalidateAll()
    return { ok: true, id: res.data.id as string }
  } catch (error) {
    console.error('[createEvent]', error)
    return { ok: false, error: 'Não foi possível criar o evento.' }
  }
}

export async function updateEvent(
  id: string,
  input: EventInput,
): Promise<ActionResult> {
  await assertAdmin()
  const parsed = eventSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  try {
    const row = inputToRow(parsed.data)
    const supabase = getServiceClient()
    // updated_at + SEQUENCE são tratados pelo trigger bump_event_on_change.
    const payload = { ...row, updated_by: 'admin' }
    let { error } = await supabase
      .from('calendar_events')
      .update(payload)
      .eq('id', id)
    if (error) {
      const { show_in_main: _omit, ...fallback } = payload
      const retry = await supabase
        .from('calendar_events')
        .update(fallback)
        .eq('id', id)
      error = retry.error
    }
    if (error) throw error
    revalidateAll()
    revalidatePath(`/admin/agenda/events/${id}`)
    return { ok: true, id }
  } catch (error) {
    console.error('[updateEvent]', error)
    return { ok: false, error: 'Não foi possível salvar o evento.' }
  }
}

export async function setEventStatus(
  id: string,
  status: EventStatus,
): Promise<ActionResult> {
  await assertAdmin()
  try {
    const supabase = getServiceClient()
    const { error } = await supabase
      .from('calendar_events')
      .update({ status, updated_by: 'admin' })
      .eq('id', id)
    if (error) throw error
    revalidateAll()
    return { ok: true, id }
  } catch (error) {
    console.error('[setEventStatus]', error)
    return { ok: false, error: 'Não foi possível alterar o status.' }
  }
}

/** Define se eventos aparecem na agenda interna (Somma). Aceita 1 ou vários ids. */
export async function setShowInMain(
  ids: string[],
  value: boolean,
): Promise<ActionResult> {
  await assertAdmin()
  if (!ids.length) return { ok: false, error: 'Nenhum evento selecionado.' }
  try {
    const supabase = getServiceClient()
    const { error } = await supabase
      .from('calendar_events')
      .update({ show_in_main: value, updated_by: 'admin' })
      .in('id', ids)
    if (error) throw error
    revalidateAll()
    return { ok: true }
  } catch (error) {
    console.error('[setShowInMain]', error)
    return {
      ok: false,
      error:
        'Não foi possível atualizar. Rode a migration "agenda interna" no Supabase.',
    }
  }
}

/** Exclusão suave: marca deleted_at (some do feed e da landing). */
export async function deleteEvent(id: string): Promise<ActionResult> {
  await assertAdmin()
  try {
    const supabase = getServiceClient()
    const { error } = await supabase
      .from('calendar_events')
      .update({ deleted_at: new Date().toISOString(), updated_by: 'admin' })
      .eq('id', id)
    if (error) throw error
    revalidateAll()
    return { ok: true, id }
  } catch (error) {
    console.error('[deleteEvent]', error)
    return { ok: false, error: 'Não foi possível excluir o evento.' }
  }
}

export async function duplicateEvent(id: string): Promise<ActionResult> {
  await assertAdmin()
  try {
    const supabase = getServiceClient()
    const { data: original, error: fetchError } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('id', id)
      .single()
    if (fetchError) throw fetchError

    const {
      id: _id,
      uid: _uid,
      sequence: _seq,
      created_at: _ca,
      updated_at: _ua,
      published_at: _pa,
      ...rest
    } = original as Record<string, unknown>

    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        ...rest,
        title: `${original.title} (cópia)`,
        status: 'draft',
        published_at: null,
        sequence: 0,
        uid: null, // trigger gera um novo UID estável
        created_by: 'admin',
        updated_by: 'admin',
      })
      .select('id')
      .single()
    if (error) throw error
    revalidateAll()
    return { ok: true, id: data.id as string }
  } catch (error) {
    console.error('[duplicateEvent]', error)
    return { ok: false, error: 'Não foi possível duplicar o evento.' }
  }
}
