import { getReadClient, getServiceClient, isSupabaseConfigured } from './supabase'
import type {
  Calendar,
  CalendarEvent,
  CalendarEventWithRelations,
  EventCategory,
} from './types'

const EVENT_SELECT =
  '*, calendar:calendars(slug,name,color), category:event_categories(name,slug,color)'

/** Gera um slug url-safe a partir de um texto. */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/** Busca um calendário pelo slug. */
export async function getCalendarBySlug(slug: string): Promise<Calendar | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = getReadClient()
  const { data, error } = await supabase
    .from('calendars')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  return (data as Calendar) ?? null
}

/**
 * Eventos que devem entrar no feed .ics público de um calendário.
 * Inclui published (CONFIRMED) e cancelled (CANCELLED, para propagar remoção).
 * Exclui draft, paused, archived e deletados.
 */
export async function getFeedEvents(calendarSlug: string): Promise<CalendarEvent[]> {
  const calendar = await getCalendarBySlug(calendarSlug)
  if (!calendar) return []

  const supabase = getReadClient()
  const build = (withMain: boolean) => {
    let q = supabase
      .from('calendar_events')
      .select('*')
      .in('status', ['published', 'cancelled'])
      .eq('visibility', 'public')
      .is('deleted_at', null)
    if (calendarSlug === 'somma' && withMain) {
      q = q.or(`calendar_id.eq.${calendar.id},show_in_main.eq.true`)
    } else {
      q = q.eq('calendar_id', calendar.id)
    }
    return q.order('start_datetime', { ascending: true })
  }

  if (calendarSlug === 'somma') {
    const withMain = await build(true)
    if (!withMain.error) return (withMain.data as CalendarEvent[]) ?? []
    // coluna show_in_main ainda não existe → segue sem ela
  }
  const { data, error } = await build(false)
  if (error) throw error
  return (data as CalendarEvent[]) ?? []
}

/** Próximos eventos publicados para exibir na landing. */
export async function getUpcomingPublicEvents(
  calendarSlug = 'somma',
  limit = 12,
): Promise<CalendarEventWithRelations[]> {
  const calendar = await getCalendarBySlug(calendarSlug)
  if (!calendar) return []

  const supabase = getReadClient()
  const gte = new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  const build = (withMain: boolean) => {
    let q = supabase
      .from('calendar_events')
      .select(EVENT_SELECT)
      .eq('status', 'published')
      .eq('visibility', 'public')
      .is('deleted_at', null)
      .gte('end_datetime', gte)
    if (calendarSlug === 'somma' && withMain) {
      q = q.or(`calendar_id.eq.${calendar.id},show_in_main.eq.true`)
    } else {
      q = q.eq('calendar_id', calendar.id)
    }
    return q.order('start_datetime', { ascending: true }).limit(limit)
  }

  if (calendarSlug === 'somma') {
    const withMain = await build(true)
    if (!withMain.error) return (withMain.data as CalendarEventWithRelations[]) ?? []
  }
  const { data, error } = await build(false)
  if (error) throw error
  return (data as CalendarEventWithRelations[]) ?? []
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Caminho canônico da página de um evento. */
export function eventPath(e: { slug?: string | null; id: string }): string {
  return `/agenda/${e.slug || e.id}`
}

/**
 * Busca um único evento PÚBLICO e PUBLICADO por slug (ou id) para a página de detalhe.
 * Retorna null se não existir ou não for público.
 */
export async function getPublicEventBySlugOrId(
  slugOrId: string,
): Promise<CalendarEventWithRelations | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = getReadClient()
  let query = supabase
    .from('calendar_events')
    .select(EVENT_SELECT)
    .eq('status', 'published')
    .eq('visibility', 'public')
    .is('deleted_at', null)

  query = UUID_RE.test(slugOrId)
    ? query.or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
    : query.eq('slug', slugOrId)

  const { data, error } = await query.limit(1).maybeSingle()
  if (error) throw error
  return (data as CalendarEventWithRelations) ?? null
}

/**
 * Todos os eventos públicos publicados (futuros + recentes) para o sitemap e listagens.
 * Inclui qualquer calendário público.
 */
export async function listIndexablePublicEvents(
  limit = 500,
): Promise<CalendarEventWithRelations[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getReadClient()
  // Inclui passado recente (90 dias) para não derrubar URLs já indexadas de provas recém-ocorridas.
  const gte = new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString()
  const { data, error } = await supabase
    .from('calendar_events')
    .select(EVENT_SELECT)
    .eq('status', 'published')
    .eq('visibility', 'public')
    .is('deleted_at', null)
    .gte('end_datetime', gte)
    .order('start_datetime', { ascending: true })
    .limit(limit)
  if (error) throw error
  return (data as CalendarEventWithRelations[]) ?? []
}

/** Próximos eventos de um calendário, exceto um id (para "outros eventos"). */
export async function getRelatedPublicEvents(
  calendarSlug: string,
  excludeId: string,
  limit = 4,
): Promise<CalendarEventWithRelations[]> {
  const list = await getUpcomingPublicEvents(calendarSlug, limit + 1).catch(() => [])
  return list.filter((e) => e.id !== excludeId).slice(0, limit)
}

/* ----------------------------- Admin queries ----------------------------- */

export async function listCalendars(): Promise<Calendar[]> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('calendars')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data as Calendar[]) ?? []
}

export async function listCategories(): Promise<EventCategory[]> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('event_categories')
    .select('*')
    .order('name', { ascending: true })
  if (error) throw error
  return (data as EventCategory[]) ?? []
}

export interface AdminEventFilters {
  calendarId?: string
  categoryId?: string
  status?: string
  range?: 'upcoming' | 'past'
}

export async function listAdminEvents(
  filters: AdminEventFilters = {},
): Promise<CalendarEventWithRelations[]> {
  const supabase = getServiceClient()
  let query = supabase
    .from('calendar_events')
    .select(EVENT_SELECT)
    .is('deleted_at', null)

  if (filters.calendarId) query = query.eq('calendar_id', filters.calendarId)
  if (filters.categoryId) query = query.eq('category_id', filters.categoryId)
  if (filters.status) query = query.eq('status', filters.status)

  const nowIso = new Date().toISOString()
  if (filters.range === 'upcoming') {
    query = query.gte('end_datetime', nowIso).order('start_datetime', { ascending: true })
  } else if (filters.range === 'past') {
    query = query.lt('end_datetime', nowIso).order('start_datetime', { ascending: false })
  } else {
    // Sem filtro de período: mostra os criados mais recentemente primeiro.
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query.limit(500)
  if (error) throw error
  return (data as CalendarEventWithRelations[]) ?? []
}

export async function getAdminEvent(
  id: string,
): Promise<CalendarEventWithRelations | null> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('calendar_events')
    .select(EVENT_SELECT)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle()
  if (error) throw error
  return (data as CalendarEventWithRelations) ?? null
}
