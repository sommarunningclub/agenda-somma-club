import { EventCard } from './event-card'
import type { EventCardData } from '@/lib/sample-events'

export function EventsSection({
  events,
  isSample,
}: {
  events: EventCardData[]
  isSample?: boolean
}) {
  return (
    <section className="px-5 py-14 sm:px-8 md:py-20">
      <div data-anim="reveal" className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-[#ff2c03]">
              Próximos eventos
            </span>
            <h2
              className="mt-3 text-4xl font-black uppercase leading-[0.95] tracking-tight text-black sm:text-5xl"
              style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
            >
              Entram na agenda
            </h2>
          </div>
          <a
            href="#assinar"
            className="-mx-1 inline-flex min-h-[44px] items-center px-1 text-sm font-black uppercase text-[#cc2402] transition-colors hover:text-[#ff2c03]"
          >
            Assinar para receber →
          </a>
        </div>

        {events.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-neutral-300 bg-[#F8F9FA] p-10 text-center font-semibold text-black/50">
            Em breve novos eventos por aqui. Assine a agenda para ser avisado.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {isSample ? (
          <p className="mt-6 text-center text-xs font-medium text-black/40">
            * Exemplos ilustrativos. Configure o Supabase para exibir os eventos reais.
          </p>
        ) : null}
      </div>
    </section>
  )
}
