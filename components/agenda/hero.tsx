import { CalendarPlus, ArrowDown, Bell } from 'lucide-react'
import { CalendarMockup } from './calendar-mockup'
import { ArrowDoodle, ArrowLoop, SpinBadge } from './doodles'
import type { EventCardData } from '@/lib/sample-events'

// Sombra "extrudada" 3D (estilo do formato pedido), em laranja escuro.
const EXTRUDE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  .map((n) => `${n}px ${n}px 0 #8a1a02`)
  .join(', ')

const DISPLAY_FONT = '"Arial Black", Impact, system-ui, sans-serif'

export function Hero({ events }: { events: EventCardData[] }) {
  return (
    <section className="relative overflow-hidden bg-[#ff2c03]">
      <div className="absolute inset-0 bg-grid-ink opacity-[0.5]" aria-hidden />
      <div className="absolute inset-0 bg-radial-ink" aria-hidden />

      {/* Setas decorativas */}
      <div className="pointer-events-none absolute left-2 top-28 z-10 hidden h-20 w-20 text-black/80 md:block lg:h-28 lg:w-28">
        <ArrowDoodle />
      </div>

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        {/* Coluna de texto */}
        <div className="relative">
          <span
            data-anim="hero-item"
            className="inline-flex items-center gap-2 rounded-full border border-black/20 bg-black/5 px-3 py-1 text-xs font-bold uppercase tracking-wide text-black/70"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-black" />
            Running club de Brasília · Parque da Cidade · DF
          </span>

          {/* H1 único: comunidade de corrida em Brasília (palavras empilhadas como marca) */}
          <h1
            data-anim="hero-item"
            className="mt-5 flex flex-col"
            aria-label="Somma Club: running club e comunidade de corrida em Brasília"
          >
            <span
              className="m-0 text-[clamp(3.25rem,11vw,150px)] font-black uppercase leading-[0.82] tracking-tighter text-white"
              style={{ fontFamily: DISPLAY_FONT, textShadow: EXTRUDE }}
            >
              Corrida
            </span>
            <span
              className="m-0 ml-0 text-[clamp(3.75rem,13vw,180px)] font-black uppercase leading-[0.82] tracking-tighter text-black sm:ml-[6%]"
              style={{ fontFamily: DISPLAY_FONT, textShadow: '4px 4px 0 #ffffff' }}
            >
              Somma
            </span>
            <span
              className="m-0 ml-0 text-[clamp(3.25rem,11vw,150px)] font-black uppercase leading-[0.82] tracking-tighter text-transparent sm:ml-[14%] md:[-webkit-text-stroke-width:2px]"
              style={{
                fontFamily: DISPLAY_FONT,
                WebkitTextStroke: '3px #000',
              }}
            >
              Club
            </span>
          </h1>

          <p
            data-anim="hero-item"
            className="mt-6 max-w-lg text-balance text-base font-semibold text-black/80 sm:text-lg"
          >
            O <strong>running club de Brasília</strong> que corre junto. Todo sábado, às
            7h, a gente se encontra no Parque da Cidade, e é <strong>de graça</strong>. Tá
            começando agora, já corre faz tempo ou só quer fazer parte da turma? Vem com a
            gente. Assine a agenda e receba cada treino, corrida e evento direto no seu
            calendário.
          </p>

          <div data-anim="hero-item" className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="#assinar"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-black px-7 text-base font-bold text-white shadow-xl shadow-black/25 transition-transform hover:scale-[1.03] active:scale-95"
            >
              <CalendarPlus className="h-5 w-5" />
              Adicionar agenda grátis
            </a>
            <a
              href="#como-funciona"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-black/30 px-6 text-base font-bold text-black transition-colors hover:bg-black/5"
            >
              Como funciona
              <ArrowDown className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Coluna visual */}
        <div className="relative flex justify-center lg:justify-end">
          <div
            data-anim="float"
            className="relative w-full max-w-sm rotate-[-3deg] will-change-transform"
          >
            <CalendarMockup events={events} />

            {/* Card flutuante pequeno */}
            <div
              data-anim="float2"
              className="absolute left-2 -top-4 z-30 flex items-center gap-2 rounded-2xl border border-white/40 bg-white/20 px-3 py-2 text-white shadow-2xl backdrop-blur-md will-change-transform sm:-left-4 lg:-left-8"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black">
                <Bell className="h-4 w-4 text-[#ff6a52]" />
              </span>
              <div className="leading-tight">
                <p className="text-[11px] font-bold">A gente te lembra</p>
                <p className="text-[10px] text-white/80">24h · 2h · 30min antes</p>
              </div>
            </div>
          </div>

          {/* Seta apontando pro mock */}
          <div className="pointer-events-none absolute -bottom-2 left-0 hidden h-16 w-16 text-black/80 md:block lg:h-20 lg:w-20">
            <ArrowLoop />
          </div>

          {/* Selo girando (CTA) */}
          <SpinBadge className="absolute -bottom-8 right-0 z-40 hidden md:flex lg:-right-6" />
        </div>

        <a
          href="#sobre"
          data-anim="hero-item"
          className="col-span-full mx-auto mt-4 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-black/70 transition-colors hover:text-black lg:col-span-2"
        >
          Role e descubra
          <ArrowDown className="h-4 w-4 animate-bounce" />
        </a>
      </div>
    </section>
  )
}
