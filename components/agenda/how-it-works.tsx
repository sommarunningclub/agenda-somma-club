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
    <section id="como-funciona" className="scroll-mt-24 px-5 py-14 sm:px-8 md:py-20">
      <div data-anim="reveal" className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-[#ff2c03]">
            Como funciona
          </span>
          <h2
            className="mt-3 text-4xl font-black uppercase leading-[0.95] tracking-tight text-black sm:text-5xl"
            style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
          >
            Três passos e pronto
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="relative flex flex-col rounded-[2rem] border border-neutral-200 bg-[#F8F9FA] p-6 sm:p-8"
            >
              <span className="absolute right-6 top-6 text-5xl font-black text-black/5">
                {i + 1}
              </span>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-[#ff6a52]">
                <step.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-black uppercase leading-tight text-black md:text-2xl">
                {step.title[0]}
                <br />
                {step.title[1]}
              </h3>
              <p className="mt-2 text-sm font-semibold text-black/55">{step.text}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {step.chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full bg-[#ff2c03]/10 px-3 py-1 text-xs font-bold text-[#cc2402]"
                  >
                    {chip}
                  </span>
                ))}
              </div>

              {i < STEPS.length - 1 ? (
                <div className="absolute -right-9 bottom-10 z-10 hidden h-14 w-14 text-black md:block">
                  <ArrowShort />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
