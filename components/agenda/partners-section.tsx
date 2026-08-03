import { AppleCalendarIcon, GoogleCalendarIcon, OutlookIcon } from './brand-icons'

const PLATFORMS = [
  { label: 'Apple Calendar', Icon: AppleCalendarIcon },
  { label: 'Google Calendar', Icon: GoogleCalendarIcon },
  { label: 'Outlook', Icon: OutlookIcon },
]

export function PartnersSection() {
  return (
    <section className="px-5 py-14 sm:px-8 md:py-20">
      <div data-anim="reveal" className="mx-auto max-w-5xl text-center">
        <span className="agenda-eyebrow">Funciona em todo lugar</span>
        <h2
          className="agenda-title mt-3 text-4xl leading-[0.95] sm:text-5xl"
          style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
        >
          Pronto pra correr junto
        </h2>
        <p className="agenda-body mx-auto mt-3 max-w-xl">
          A agenda do Somma Club entra no app que você já usa. Escolheu, adicionou, pronto:
          os encontros aparecem sozinhos.
        </p>

        <div
          data-anim="reveal-stagger"
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          {PLATFORMS.map(({ label, Icon }) => (
            <div
              key={label}
              className="agenda-card-sm flex items-center gap-3 px-5 py-4"
            >
              <Icon className="h-9 w-9" />
              <span className="font-black text-somma-ink">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
