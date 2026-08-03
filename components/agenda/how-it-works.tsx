import { CalendarCheck, RefreshCw, Smartphone } from 'lucide-react'
import { ArrowShort } from './doodles'

const STEPS = [
  {
    icon: Smartphone,
    title: ['ESCOLHA SEU', 'CALENDÁRIO'],
    text: 'iPhone, Mac, Google ou Outlook. Você usa o app que já tem no bolso.',
    chips: ['iPhone', 'Google', 'Outlook'],
  },
  {
    icon: CalendarCheck,
    title: ['TOQUE EM', 'ADICIONAR'],
    text: 'Um toque e pronto. Sem baixar nenhum aplicativo.',
    chips: ['1 toque', 'grátis'],
  },
  {
    icon: RefreshCw,
    title: ['PRONTO, ATUALIZA', 'SOZINHO'],
    text: 'Novidades e mudanças chegam sozinhas pra você.',
    chips: ['auto-sync'],
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="scroll-mt-24 px-5 sm:px-8">
      <div className="mx-auto max-w-6xl py-14 md:py-20" data-anim="pin">
        <div data-anim="reveal" className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <span className="agenda-eyebrow">Como funciona</span>
            <h2
              className="agenda-title mt-3 text-4xl leading-[0.95] sm:text-5xl"
              style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
            >
              Três passos e pronto
            </h2>
          </div>

          <div data-anim="reveal-stagger" className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="agenda-card relative flex flex-col p-6 sm:p-8">
                <span className="absolute right-6 top-6 text-5xl font-black text-somma-orange/10">
                  {i + 1}
                </span>
                <div className="agenda-icon h-12 w-12">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="agenda-title mt-5 text-xl leading-tight md:text-2xl">
                  {step.title[0]}
                  <br />
                  {step.title[1]}
                </h3>
                <p className="agenda-body mt-2 text-sm">{step.text}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {step.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full bg-somma-orange/10 px-3 py-1 text-xs font-bold text-somma-orange-dark"
                    >
                      {chip}
                    </span>
                  ))}
                </div>

                {i < STEPS.length - 1 ? (
                  <div className="absolute -right-9 bottom-10 z-10 hidden h-14 w-14 text-somma-orange/40 md:block">
                    <ArrowShort />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
