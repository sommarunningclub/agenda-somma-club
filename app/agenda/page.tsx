import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/agenda/site-header'
import { SiteFooter } from '@/components/agenda/site-footer'
import { Hero } from '@/components/agenda/hero'
import { AboutSection } from '@/components/agenda/about-section'
import { HowItWorks } from '@/components/agenda/how-it-works'
import { Benefits } from '@/components/agenda/benefits'
import { EventsSection } from '@/components/agenda/events-section'
import { SubscribeSection } from '@/components/agenda/subscribe-section'
import { Faq } from '@/components/agenda/faq'
import { RacesSection } from '@/components/agenda/races-section'
import { QrSection } from '@/components/agenda/qr-section'
import { Marquee } from '@/components/agenda/marquee'
import { Animations } from '@/components/agenda/animations'
import { FAQ_ITEMS } from '@/lib/faq'
import { FinalCta } from '@/components/agenda/final-cta'
import { PageViewTracker } from '@/components/agenda/page-view-tracker'
import { MobileCtaBar } from '@/components/agenda/mobile-cta-bar'
import { getUpcomingPublicEvents } from '@/lib/calendar-data'
import { getSampleEvents, toCardData, type EventCardData } from '@/lib/sample-events'
import { buildSubscribeLinks } from '@/lib/subscribe-links'
import { getSiteUrl } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Somma Club: Running Club e Comunidade de Corrida em Brasília (DF)',
  description:
    'O Somma Club é o maior running club de Brasília: comunidade de corrida aberta e gratuita, com encontros todo sábado no Parque da Cidade. Para iniciantes e experientes. Assine a agenda grátis e receba treinos, corridas e eventos no seu calendário.',
  keywords: [
    'Somma Club',
    'running club Brasília',
    'corrida em Brasília',
    'grupo de corrida em Brasília',
    'comunidade de corrida no DF',
    'corrida para iniciantes em Brasília',
    'treino de corrida no Parque da Cidade',
    'grupo de corrida gratuito',
    'assessoria de corrida Brasília',
    'eventos de corrida em Brasília',
  ],
  alternates: { canonical: '/agenda' },
  openGraph: {
    title: 'Somma Club: Running Club e Comunidade de Corrida em Brasília',
    description:
      'Comunidade de corrida aberta e gratuita em Brasília. Encontros todo sábado no Parque da Cidade, para iniciantes e experientes. Assine a agenda grátis.',
    url: `${getSiteUrl()}/agenda`,
    siteName: 'Somma Club',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/SMEWNGS-1336.jpg',
        width: 1200,
        height: 630,
        alt: 'Comunidade do Somma Club correndo junta no Parque da Cidade, em Brasília',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Somma Club: Running Club e Comunidade de Corrida em Brasília',
    description:
      'Comunidade de corrida aberta e gratuita em Brasília. Encontros todo sábado no Parque da Cidade. Assine a agenda grátis.',
    images: ['/SMEWNGS-1336.jpg'],
  },
}

// Revalida a cada 5 min (a página é majoritariamente estática + dados de eventos).
export const revalidate = 300

export default async function AgendaPage() {
  const links = buildSubscribeLinks('somma')
  const racesLinks = buildSubscribeLinks('corridas-df')

  let events: EventCardData[] = []
  let isSample = false
  try {
    const real = await getUpcomingPublicEvents('somma', 12)
    if (real.length > 0) {
      events = real.map(toCardData)
    } else {
      events = getSampleEvents()
      isSample = true
    }
  } catch {
    events = getSampleEvents()
    isSample = true
  }

  // Corridas externas do DF (calendário "corridas-df")
  let races: Awaited<ReturnType<typeof getUpcomingPublicEvents>> = []
  try {
    races = await getUpcomingPublicEvents('corridas-df', 40)
  } catch {
    races = []
  }

  const siteUrl = getSiteUrl()

  const organizationSchema = {
    '@type': 'SportsClub',
    '@id': `${siteUrl}/#organization`,
    name: 'Somma Club',
    alternateName: ['Somma Running Club', 'Agenda Somma Club'],
    description:
      'O maior running club de Brasília. Comunidade de corrida aberta e gratuita, com encontros todo sábado no Parque da Cidade, para corredores de todos os níveis, de iniciantes a experientes.',
    url: siteUrl,
    logo: `${siteUrl}/somma-logo.svg`,
    image: `${siteUrl}/SMEWNGS-1336.jpg`,
    sport: 'Running',
    email: 'contato@sommaclub.com.br',
    telephone: '+55-61-99537-2477',
    areaServed: { '@type': 'City', name: 'Brasília', '@id': 'https://www.wikidata.org/wiki/Q2844' },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Parque da Cidade Sarah Kubitschek',
      addressLocality: 'Brasília',
      addressRegion: 'DF',
      postalCode: '70655-775',
      addressCountry: 'BR',
    },
    sameAs: [
      'https://www.instagram.com/somma.club/',
      'https://www.strava.com/clubs/1608501',
      'https://sommaclub.com.br',
    ],
  }

  const eventsSchema = events.slice(0, 12).map((e) => ({
    '@type': 'SportsEvent',
    name: e.title,
    startDate: e.start_datetime,
    endDate: e.end_datetime,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    sport: 'Running',
    isAccessibleForFree: true,
    location: {
      '@type': 'Place',
      name: e.location_name || 'Parque da Cidade Sarah Kubitschek',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Brasília',
        addressRegion: 'DF',
        addressCountry: 'BR',
      },
    },
    organizer: { '@type': 'SportsClub', name: 'Somma Club', url: siteUrl },
  }))

  const faqSchema = {
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [organizationSchema, ...eventsSchema, faqSchema],
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#ff2c03] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageViewTracker />
      <Animations />
      <SiteHeader />
      <main>
        <Hero events={events} />
        <Marquee />
        <div className="relative z-10 rounded-t-[2.5rem] bg-white text-neutral-900 shadow-[0_-30px_60px_rgba(0,0,0,0.25)] md:rounded-t-[3.5rem]">
          <AboutSection />
          <HowItWorks />
          <Benefits />
          <EventsSection events={events} isSample={isSample} />
          <SubscribeSection links={links} calendarSlug="somma" />
          <QrSection url={`${getSiteUrl()}/agenda`} />
          <RacesSection races={races} />
          <div className="-mt-6 px-5 pb-2 text-center sm:px-8">
            <Link
              href="/agenda/corridas"
              className="inline-flex items-center gap-1 text-sm font-black uppercase tracking-wide text-[#cc2402] transition-colors hover:text-[#ff2c03]"
            >
              Ver todas as corridas em Brasília →
            </Link>
          </div>
          {races.length > 0 ? (
            <SubscribeSection
              id="assinar-corridas"
              links={racesLinks}
              calendarSlug="corridas-df"
              eyebrow="Agenda de corridas"
              title="Assine as corridas do DF"
              subtitle="Receba as principais provas de Brasília direto no seu calendário."
            />
          ) : null}
          <Faq />
        </div>
        <FinalCta />
      </main>
      <SiteFooter />
      <MobileCtaBar />
    </div>
  )
}
