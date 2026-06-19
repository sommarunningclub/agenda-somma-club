import type { EventStatus } from './constants'

/** Visibilidade do evento no feed público. */
export type EventVisibility = 'public' | 'unlisted' | 'private'

export interface Calendar {
  id: string
  name: string
  slug: string
  description: string | null
  ics_path: string | null
  is_public: boolean
  color: string | null
  created_at: string
  updated_at: string
}

export interface EventCategory {
  id: string
  name: string
  slug: string
  color: string | null
  created_at: string
  updated_at: string
}

export interface CalendarEvent {
  id: string
  calendar_id: string
  title: string
  slug: string | null
  summary: string | null
  description: string | null
  location_name: string | null
  location_address: string | null
  location_url: string | null
  start_datetime: string
  end_datetime: string
  timezone: string
  is_all_day: boolean
  is_recurring: boolean
  recurrence_rule: string | null
  category_id: string | null
  partner_name: string | null
  partner_logo_url: string | null
  checkin_url: string | null
  cta_label: string | null
  cta_url: string | null
  image_url: string | null
  status: EventStatus
  visibility: EventVisibility
  /** Se true, aparece também na agenda interna (Somma), mesmo sendo de outro calendário. */
  show_in_main: boolean
  reminder_24h: boolean
  reminder_2h: boolean
  reminder_30m: boolean
  /** Lista de minutos antes do evento para lembretes extras. Ex.: [60, 15]. */
  custom_reminders: number[] | null
  uid: string
  sequence: number
  published_at: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

/** Evento com dados relacionados de calendário e categoria (joins). */
export interface CalendarEventWithRelations extends CalendarEvent {
  calendar?: Pick<Calendar, 'slug' | 'name' | 'color'> | null
  category?: Pick<EventCategory, 'name' | 'slug' | 'color'> | null
}

export interface CalendarLead {
  id: string
  name: string
  email: string
  phone: string | null
  platform: string | null
  calendar_slug: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
  lgpd_accepted: boolean
  lgpd_accepted_at: string | null
  created_at: string
}

export interface CalendarClick {
  id: string
  calendar_slug: string | null
  platform: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  user_agent: string | null
  ip_hash: string | null
  created_at: string
}
