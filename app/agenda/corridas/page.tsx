import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SiteHeader } from '@/components/agenda/site-header'
import { SiteFooter } from '@/components/agenda/site-footer'
import { SubscribeSection } from '@/components/agenda/subscribe-section'
import { EventCard } from '@/components/agenda/event-card'
import { getUpcomingPublicEvents, eventPath } from '@/lib/calendar-data'
import { buildSubscribeLinks } from '@/lib/subscribe-links'
import { toCardData } from '@/lib/sample-events'
import { formatEventDate } from '@/lib/format'
import { getSiteUrl, DEFAULT_TIMEZONE } from '@/lib/constants'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Corridas em Brasília 2026 — Calendário de Corridas de Rua no DF',
  description:
    'Calendário das principais corridas de rua de Brasília e do Distrito Federal. Veja datas, locais e provas de corrida no DF e adicione tudo ao seu calendário gratuitamente com o Somma Club.',
  keywords: [
    'corridas em Brasília',
    'corridas de rua Brasília',
    'calendário de corridas DF',
    'provas de corrida Brasília',
    'corridas Distrito Federal 2026',
    'agenda de corridas Brasília',
  ],
  alternates: { canonical: '/agenda/corridas' },
  openGraph: {
    title: 'Corridas em Brasília 2026 — Calendário de Corridas de Rua no DF',
    description:
      'As principais corridas de rua de Brasília e do DF em um só lugar. Datas, locais e provas — adicione ao seu calendário grátis.',
    url: `${getSiteUrl()}/agenda/corridas`,
    siteName: 'Somma Club',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: '/SMEWNGS-1336.jpg', alt: 'Corridas de rua em Brasília' }],
  },
}

export default async function CorridasPage() {
  const races = await getUpcomingPublicEvents('corridas-df', 80).catch(() => [])
  const links = buildSubscribeLinks('corridas-df')
  const siteUrl = getSiteUrl()

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Corridas em Brasília',
    itemListElement: races.slice(0, 30).map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${siteUrl}${eventPath(e)}`,
      name: e.title,
    })),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Agenda Somma Club', item: `${siteUrl}/agenda` },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Corridas em Brasília',
        item: `${siteUrl}/agenda/corridas`,
      },
    ],
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#ff2c03] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <SiteHeader />

      <main>
        <section className="bg-[#ff2c03] px-5 py-12 sm:px-8 md:py-16">
          <div className="mx-auto max-w-4xl">
            <Link
              href="/agenda"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-black/70 transition-colors hover:text-black"
            >
              <ArrowLeft className="h-4 w-4" />
              Agenda Somma Club
            </Link>
            <span className="mt-5 block text-xs font-black uppercase tracking-[0.18em] text-black/70">
              Calendário de corridas · Brasília · DF
            </span>
            <h1
              className="mt-2 text-4xl font-black uppercase leading-[0.9] tracking-tight text-white sm:text-6xl"
              style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
            >
              Corridas em Brasília
            </h1>
            <p className="mt-4 max-w-2xl text-base font-semibold text-black/75 sm:text-lg">
              O calendário das principais corridas de rua de Brasília e do Distrito Federal.
              Veja as datas e os locais das próximas provas e adicione tudo ao seu calendário
              de graça — sem perder nenhuma corrida no DF.
            </p>
          </div>
        </section>

        <div className="relative z-10 rounded-t-[2.5rem] bg-white text-neutral-900 shadow-[0_-30px_60px_rgba(0,0,0,0.25)] md:rounded-t-[3.5rem]">
          <section className="px-5 py-12 sm:px-8 md:py-16">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                Próximas corridas no DF
              </h2>

              {races.length === 0 ? (
                <p className="mt-6 rounded-2xl border border-dashed border-neutral-300 bg-[#F8F9FA] p-10 text-center font-semibold text-black/50">
                  Em breve as próximas corridas de Brasília por aqui. Assine a agenda para
                  ser avisado.
                </p>
              ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {races.map((e) => (
                    <EventCard key={e.id} event={toCardData(e)} />
                  ))}
                </div>
              )}

              {races.length > 0 ? (
                <div className="mt-10 rounded-2xl bg-[#F8F9FA] p-5 text-sm font-medium text-black/60">
                  <h3 className="text-xs font-black uppercase tracking-wider text-black/40">
                    Corridas por data
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {races.slice(0, 12).map((e) => (
                      <li key={e.id}>
                        <Link href={eventPath(e)} className="hover:text-[#cc2402]">
                          <strong className="text-black">
                            {formatEventDate(e.start_datetime, e.timezone || DEFAULT_TIMEZONE)}
                          </strong>{' '}
                          — {e.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </section>

          <SubscribeSection
            links={links}
            calendarSlug="corridas-df"
            eyebrow="Agenda de corridas"
            title="Assine as corridas do DF"
            subtitle="Receba todas as corridas de rua de Brasília direto no seu calendário. É grátis."
          />
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
