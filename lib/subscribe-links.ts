import { getSiteHost, getSiteUrl, type CalendarSlug } from './constants'

/**
 * Monta os links de assinatura por plataforma. Funções puras:
 * geramos no servidor (com getSiteUrl) e passamos prontos ao client.
 */

export function buildIcsUrl(slug: CalendarSlug, siteUrl = getSiteUrl()): string {
  return `${siteUrl}/api/calendar/${slug}.ics`
}

/** iPhone / Mac / Apple Calendar — protocolo webcal://. */
export function buildWebcalUrl(slug: CalendarSlug, host = getSiteHost()): string {
  return `webcal://${host}/api/calendar/${slug}.ics`
}

/**
 * Google Calendar — adiciona por URL (cid).
 * Usamos a URL webcal:// no cid: o Google trata como assinatura recorrente de
 * forma mais confiável (a forma https às vezes dá "Verifique o URL").
 */
export function buildGoogleUrl(slug: CalendarSlug, siteUrl = getSiteUrl()): string {
  const host = siteUrl.replace(/^https?:\/\//, '')
  const webcal = buildWebcalUrl(slug, host)
  return `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcal)}`
}

/** Outlook (web) — adiciona da web por URL. */
export function buildOutlookUrl(
  slug: CalendarSlug,
  siteUrl = getSiteUrl(),
  name = 'Agenda Somma Club',
): string {
  const ics = buildIcsUrl(slug, siteUrl)
  return `https://outlook.office.com/calendar/0/addfromweb?url=${encodeURIComponent(
    ics,
  )}&name=${encodeURIComponent(name)}`
}

export interface SubscribeLinks {
  ics: string
  webcal: string
  google: string
  outlook: string
}

export function buildSubscribeLinks(
  slug: CalendarSlug,
  siteUrl = getSiteUrl(),
): SubscribeLinks {
  const host = siteUrl.replace(/^https?:\/\//, '')
  return {
    ics: buildIcsUrl(slug, siteUrl),
    webcal: buildWebcalUrl(slug, host),
    google: buildGoogleUrl(slug, siteUrl),
    outlook: buildOutlookUrl(slug, siteUrl),
  }
}
