import { CalendarPlus } from 'lucide-react'

export function FinalCta() {
  return (
    <section className="relative overflow-hidden px-5 py-24 sm:px-8">
      <div
        data-anim="parallax"
        data-parallax="-15"
        className="pointer-events-none absolute inset-0 -z-10 bg-[url('/SMEWNGS-1336.jpg')] bg-cover bg-center opacity-20"
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-grid opacity-30" aria-hidden />
      <div data-anim="reveal" className="relative mx-auto max-w-3xl text-center">
        <h2 className="text-balance text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Sua próxima corrida já tem data
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg font-medium text-white/85">
          Bora fazer parte do maior running club de Brasília? Assine a agenda gratuita do
          Somma Club e deixe o calendário te lembrar de cada treino, corrida e encontro. De
          graça, pra sempre.
        </p>
        <a
          href="#assinar"
          className="mt-9 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold text-somma-orange shadow-xl shadow-black/15 transition-transform hover:scale-[1.03] active:scale-95 sm:w-auto"
        >
          <CalendarPlus className="h-5 w-5" />
          Adicionar agenda grátis
        </a>
      </div>
    </section>
  )
}
