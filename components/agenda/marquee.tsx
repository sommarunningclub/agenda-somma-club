'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const DEFAULT_ITEMS = [
  'SOMMA CLUB',
  'CORRIDA EM BRASÍLIA',
  'RUNNING CLUB',
  'PARQUE DA CIDADE',
  'COMUNIDADE',
  'TREINOS GRATUITOS',
  'PARA INICIANTES',
  'BRASÍLIA · DF',
  'VIBE BOA',
]

/** Faixa de texto em loop infinito (GSAP), estilo ticker esportivo. */
export function Marquee({ items = DEFAULT_ITEMS }: { items?: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const tween = gsap.to(track, {
      xPercent: -50,
      duration: 22,
      ease: 'none',
      repeat: -1,
    })
    return () => {
      tween.kill()
    }
  }, [])

  // Duas cópias para loop contínuo (xPercent -50 exibe a 2ª cópia idêntica).
  const loop = [...items, ...items]

  return (
    <div className="overflow-hidden border-y-2 border-black bg-black py-4 sm:py-5">
      <div
        ref={trackRef}
        className="flex w-max items-center gap-8 whitespace-nowrap will-change-transform sm:gap-10"
        aria-hidden
      >
        {loop.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-8 text-2xl font-extrabold uppercase tracking-tight text-white sm:gap-10 sm:text-3xl"
          >
            {item}
            <span className="text-[#ff2c03]">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
