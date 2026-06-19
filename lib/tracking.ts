'use client'

/**
 * Eventos de growth para GTM (dataLayer) e Meta Pixel (fbq), se existirem.
 * Não inventa IDs: os scripts só são injetados se as env vars estiverem setadas
 * (ver components/analytics.tsx). Aqui só empurramos eventos com segurança.
 */

type TrackParams = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
    fbq?: (...args: unknown[]) => void
  }
}

export type CalendarEventName =
  | 'calendar_page_view'
  | 'calendar_lead_submit'
  | 'calendar_add_click'
  | 'calendar_platform_select'
  | 'calendar_admin_event_create'
  | 'calendar_admin_event_publish'

export function track(event: CalendarEventName, params: TrackParams = {}): void {
  if (typeof window === 'undefined') return
  try {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event, ...params })
    if (typeof window.fbq === 'function') {
      window.fbq('trackCustom', event, params)
    }
  } catch {
    /* tracking nunca deve quebrar a UX */
  }
}
