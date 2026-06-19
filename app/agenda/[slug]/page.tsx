import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CalendarDays, Clock, MapPin, Tag, Users } from 'lucide-react'
import { SiteHeader } from '@/components/agenda/site-header'
import { SiteFooter } from '@/components/agenda/site-footer'
import { SubscribeSection } from '@/components/agenda/subscribe-section'
import { EventCard } from '@/components/agenda/event-card'
import {
  getPublicEventBySlugOrId,
  getRelatedPublicEvents,
  eventPath,
} from '@/lib/calendar-data'
import { buildSubscribeLinks } from '@/lib/subscribe-links'
import { toCardData } from '@/lib/sample-events'
import { formatEventDate, formatTimeRange, getDayBadge } from '@/lib/format'
import { CALENDARS, getSiteUrl, type CalendarSlug, DEFAULT_TIMEZONE } from '@/lib/constants'

export const revalidate = 300

function plain(text: string | null | undefined, max = 160): string {
  if (!text) return ''
  const t = text.replace(/\s+/g, ' ').trim()
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t
}

function calSlugOf(slug: string | null | undefined): CalendarSlug {
  return slug && slug in CALENDARS ? (slug as CalendarSlug) : 'somma'
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const event = await getPublicEventBySlugOrId(slug).catch(() => null)
  if (!event) {
    return { title: 'Evento não encontrado', robots: { index: false, follow: true } }
  }

  const tz = event.timezone || DEFAULT_TIMEZONE
  const date = formatEventDate(event.start_datetime, tz)
  const place = event.location_name ? `${event.location_name}, Brasília` : 'Brasília (DF)'
  // O template do layout já adiciona " | Somma Club" ao final.
  const title = `${event.title} — ${date}`
  const description =
    plain(event.summary) ||
    plain(event.description) ||
    `${event.title}: corrida e evento do Somma Club em ${place}, ${date}. Veja horário, local e adicione ao seu calendário gratuitamente.`
  const url = `${getSiteUrl()}${eventPath(event)}`
  const image = event.image_url || '/SMEWNGS-1336.jpg'

  return {
    title,
    description,
    alternates: { canonical: eventPath(event) },
    openGraph: {
      title: `${title} | Somma Club`,
      description,
      url,
      siteName: 'Somma Club',
      locale: 'pt_BR',
      type: 'article',
      images: [{ url: image, alt: event.title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  }
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const event = await getPublicEventBySlugOrId(slug).catch(() => null)
  if (!event) notFound()

  const tz = event.timezone || DEFAULT_TIMEZONE
  const badge = getDayBadge(event.start_datetime, tz)
  const date = formatEventDate(event.start_datetime, tz)
  const timeRange = formatTimeRange(event.start_datetime, event.end_datetime, tz)
  const calSlug = calSlugOf(event.calendar?.slug)
  const links = buildSubscribeLinks(calSlug)
  const color = event.category?.color || '#ff2c03'
  const siteUrl = getSiteUrl()

  const mapsUrl =
    event.location_url ||
    (event.location_address || event.location_name
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${event.location_name ?? ''} ${event.location_address ?? ''} Brasília DF`.trim(),
        )}`
      : null)

  const related = await getRelatedPublicEvents(calSlug, event.id, 4)

  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: event.title,
    description: plain(event.summary || event.description, 300) || event.title,
    startDate: event.start_datetime,
    endDate: event.end_datetime,
    eventStatus:
      event.status === 'cancelled'
        ? 'https://schema.org/EventCancelled'
        : 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    sport: 'Running',
    isAccessibleForFree: true,
    image: [event.image_url || `${siteUrl}/SMEWNGS-1336.jpg`],
    url: `${siteUrl}${eventPath(event)}`,
    location: {
      '@type': 'Place',
      name: event.location_name || 'Parque da Cidade Sarah Kubitschek',
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.location_address || undefined,
        addressLocality: 'Brasília',
        addressRegion: 'DF',
        addressCountry: 'BR',
      },
    },
    organizer: { '@type': 'SportsClub', name: 'Somma Club', url: siteUrl },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Agenda Somma Club', item: `${siteUrl}/agenda` },
      {
        '@type': 'ListItem',
        position: 2,
        name: event.title,
        item: `${siteUrl}${eventPath(event)}`,
      },
    ],
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#ff2c03] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <SiteHeader />

      <main>
        {/* Hero do evento */}
        <section className="relative overflow-hidden bg-[#ff2c03] px-5 py-10 sm:px-8 md:py-14">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/agenda"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-black/70 transition-colors hover:text-black"
            >
              <ArrowLeft className="h-4 w-4" />
              Agenda Somma Club
            </Link>

            <div className="mt-5 flex items-start gap-4">
              <div
                className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-black text-white"
                style={{ boxShadow: `inset 0 -4px 0 0 ${color}` }}
              >
                <span className="text-xs font-bold uppercase tracking-wide text-white/70">
                  {badge.month}
                </span>
                <span className="text-3xl font-black leading-none">{badge.day}</span>
              </div>
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-black/70">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {event.category?.name ?? 'Evento Somma Club'}
                  {event.partner_name ? ` · ${event.partner_name}` : ''}
                </span>
                <h1
                  className="mt-2 text-3xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-4xl md:text-5xl"
                  style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
                >
                  {event.title}
                </h1>
              </div>
            </div>
          </div>
        </section>

        <div className="relative z-10 rounded-t-[2.5rem] bg-white text-neutral-900 shadow-[0_-30px_60px_rgba(0,0,0,0.25)] md:rounded-t-[3.5rem]">
          <article className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
            {/* Ficha do evento */}
            <dl className="grid gap-3 sm:grid-cols-2">
              <InfoRow icon={CalendarDays} label="Data" value={date} />
              <InfoRow
                icon={Clock}
                label="Horário"
                value={`${timeRange} (horário de Brasília)`}
              />
              {event.location_name ? (
                <InfoRow
                  icon={MapPin}
                  label="Local"
                  value={event.location_address || event.location_name}
                  title={event.location_name}
                  href={mapsUrl}
                />
              ) : null}
              {event.category ? (
                <InfoRow icon={Tag} label="Categoria" value={event.category.name} />
              ) : null}
              <InfoRow
                icon={Users}
                label="Quem participa"
                value="Aberto a todos · gratuito"
              />
            </dl>

            {event.description ? (
              <div className="mt-10">
                <h2 className="text-xl font-black uppercase tracking-tight text-black">
                  Sobre o evento
                </h2>
                <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-black/70">
                  {event.description}
                </p>
              </div>
            ) : null}

            <p className="mt-8 rounded-2xl bg-[#F8F9FA] p-5 text-sm font-medium text-black/60">
              <strong className="text-black">{event.title}</strong> faz parte da agenda do{' '}
              <Link href="/agenda" className="font-bold text-[#cc2402] hover:underline">
                Somma Club
              </Link>
              , o maior running club de Brasília. Adicione este evento ao seu calendário e
              receba automaticamente os próximos treinos e corridas em Brasília.
            </p>

            {event.checkin_url || event.cta_url ? (
              <div className="mt-6 flex flex-wrap gap-3">
                {event.cta_url ? (
                  <a
                    href={event.cta_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 items-center justify-center rounded-full bg-black px-6 text-sm font-bold text-white transition-transform hover:scale-[1.03] active:scale-95"
                  >
                    {event.cta_label || 'Saiba mais'}
                  </a>
                ) : null}
                {event.checkin_url ? (
                  <a
                    href={event.checkin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 items-center justify-center rounded-full border-2 border-black/20 px-6 text-sm font-bold text-black transition-colors hover:bg-black/5"
                  >
                    Fazer check-in
                  </a>
                ) : null}
              </div>
            ) : null}
          </article>

          <SubscribeSection
            links={links}
            calendarSlug={calSlug}
            eyebrow="Não perca"
            title="Adicione ao seu calendário"
            subtitle="Receba este e os próximos eventos do Somma Club direto no seu celular. É grátis."
          />

          {related.length > 0 ? (
            <section className="px-5 py-12 sm:px-8 md:py-16">
              <div className="mx-auto max-w-3xl">
                <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                  Próximos eventos
                </h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {related.map((e) => (
                    <EventCard key={e.id} event={toCardData(e)} />
                  ))}
                </div>
                <Link
                  href="/agenda"
                  className="mt-6 inline-block text-sm font-black uppercase text-[#cc2402] hover:text-[#ff2c03]"
                >
                  Ver toda a agenda →
                </Link>
              </div>
            </section>
          ) : null}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
  title,
  href,
}: {
  icon: typeof CalendarDays
  label: string
  value: string
  title?: string
  href?: string | null
}) {
  const body = (
    <div className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-[#F8F9FA] p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black text-[#ff6a52]">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <dt className="text-[11px] font-bold uppercase tracking-wider text-black/40">
          {label}
        </dt>
        <dd className="font-bold capitalize text-black">{title || value}</dd>
        {title && value !== title ? (
          <dd className="text-sm font-medium text-black/50">{value}</dd>
        ) : null}
      </div>
    </div>
  )
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block transition-colors hover:[&>div]:border-[#ff2c03]/40">
      {body}
    </a>
  ) : (
    body
  )
}
