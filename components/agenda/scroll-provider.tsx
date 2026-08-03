'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { LENIS, prefersReducedMotion } from '@/lib/anim'

/**
 * Smooth scroll (Lenis) sincronizado com o GSAP ticker + barra de progresso de scroll.
 * Progressive enhancement: não monta nada se prefers-reduced-motion estiver ativo.
 */
export function ScrollProvider() {
  useEffect(() => {
    if (prefersReducedMotion()) return

    gsap.registerPlugin(ScrollTrigger)

    const lenis = new Lenis({
      duration: LENIS.duration,
      anchors: { duration: LENIS.anchorsDuration },
    })

    lenis.on('scroll', ScrollTrigger.update)
    const onTick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(onTick)
    gsap.ticker.lagSmoothing(0)

    const bar = document.getElementById('scroll-progress')
    let progress: gsap.core.Tween | undefined
    if (bar) {
      gsap.set(bar, { scaleX: 0, transformOrigin: 'left center' })
      progress = gsap.to(bar, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      })
    }

    return () => {
      gsap.ticker.remove(onTick)
      progress?.scrollTrigger?.kill()
      progress?.kill()
      lenis.destroy()
    }
  }, [])

  return null
}
