'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Orquestrador de animações GSAP da landing (progressive enhancement):
 * - entrada do hero (stagger)
 * - flutuação contínua do mock de calendário
 * - reveals no scroll dos painéis
 * Respeita prefers-reduced-motion (sem JS, o conteúdo já fica visível).
 */
export function Animations() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    gsap.registerPlugin(ScrollTrigger)
    // No iOS, o colapso da barra do Safari dispara resize; evita recalcular à toa.
    ScrollTrigger.config({ ignoreMobileResize: true })

    const ctx = gsap.context(() => {
      // Entrada do hero
      const heroItems = gsap.utils.toArray<HTMLElement>('[data-anim="hero-item"]')
      if (heroItems.length) {
        gsap.from(heroItems, {
          y: 30,
          autoAlpha: 0,
          duration: 0.85,
          ease: 'power3.out',
          stagger: 0.1,
        })
      }

      // Flutuação contínua (mock do calendário)
      gsap.utils.toArray<HTMLElement>('[data-anim="float"]').forEach((el) => {
        gsap.to(el, {
          y: -14,
          duration: 3.2,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
      })

      // Card flutuante secundário (amplitude/ritmo diferentes)
      gsap.utils.toArray<HTMLElement>('[data-anim="float2"]').forEach((el) => {
        gsap.to(el, {
          y: -10,
          rotate: -2,
          duration: 2.4,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: 0.6,
        })
      })

      // Card de calendário "ganhando vida"
      const rows = gsap.utils.toArray<HTMLElement>('[data-anim="mockup-row"]')
      if (rows.length) {
        gsap.from(rows, {
          x: -28,
          autoAlpha: 0,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.12,
          delay: 0.35,
        })
      }
      const bars = gsap.utils.toArray<HTMLElement>('[data-anim="mockup-bar"]')
      if (bars.length) {
        gsap.from(bars, {
          scaleY: 0,
          autoAlpha: 0,
          duration: 0.5,
          ease: 'back.out(2)',
          stagger: 0.12,
          delay: 0.5,
        })
      }
      gsap.utils.toArray<HTMLElement>('[data-anim="mockup-badge"]').forEach((el) => {
        gsap.to(el, {
          scale: 1.07,
          duration: 1.1,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          transformOrigin: 'center',
        })
      })

      // Reveals no scroll
      gsap.utils.toArray<HTMLElement>('[data-anim="reveal"]').forEach((el) => {
        gsap.from(el, {
          y: 48,
          autoAlpha: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        })
      })

      ScrollTrigger.refresh()
    })

    // Recalcula posições quando a orientação muda ou as fontes (Arial Black/Geist)
    // terminam de carregar e deslocam as alturas dos painéis.
    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('orientationchange', onResize)
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {})
    }

    return () => {
      window.removeEventListener('orientationchange', onResize)
      ctx.revert()
    }
  }, [])

  return null
}
