'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { REVEAL, EASES, DURATION, prefersReducedMotion } from '@/lib/anim'

/**
 * Orquestrador de animações GSAP do site (progressive enhancement).
 * Easings restritos a: none, expo, power4, power2.out, power2.in, power2.inOut.
 * Respeita prefers-reduced-motion (sem JS, o conteúdo já fica visível).
 */
export function Animations() {
  useEffect(() => {
    if (prefersReducedMotion()) return

    gsap.registerPlugin(ScrollTrigger)
    ScrollTrigger.config({ ignoreMobileResize: true })

    const ctx = gsap.context(() => {
      const heroItems = gsap.utils.toArray<HTMLElement>('[data-anim="hero-item"]')
      if (heroItems.length) {
        gsap.from(heroItems, {
          y: 30,
          autoAlpha: 0,
          duration: 0.6,
          ease: EASES.out,
          stagger: REVEAL.stagger,
        })
      }

      gsap.utils.toArray<HTMLElement>('[data-anim="float"]').forEach((el) => {
        gsap.to(el, { y: -14, duration: 3.2, ease: EASES.inOut, repeat: -1, yoyo: true })
      })
      gsap.utils.toArray<HTMLElement>('[data-anim="float2"]').forEach((el) => {
        gsap.to(el, {
          y: -10,
          rotate: -2,
          duration: 2.4,
          ease: EASES.inOut,
          repeat: -1,
          yoyo: true,
          delay: 0.6,
        })
      })

      const rows = gsap.utils.toArray<HTMLElement>('[data-anim="mockup-row"]')
      if (rows.length) {
        gsap.from(rows, {
          x: -28,
          autoAlpha: 0,
          duration: DURATION.reveal,
          ease: EASES.out,
          stagger: 0.12,
          delay: 0.35,
        })
      }
      const bars = gsap.utils.toArray<HTMLElement>('[data-anim="mockup-bar"]')
      if (bars.length) {
        gsap.from(bars, {
          scaleY: 0,
          autoAlpha: 0,
          duration: DURATION.reveal,
          ease: EASES.out,
          stagger: 0.12,
          delay: 0.5,
          transformOrigin: 'top',
        })
      }
      gsap.utils.toArray<HTMLElement>('[data-anim="mockup-badge"]').forEach((el) => {
        gsap.to(el, {
          scale: 1.07,
          duration: 1.1,
          ease: EASES.inOut,
          repeat: -1,
          yoyo: true,
          transformOrigin: 'center',
        })
      })

      gsap.utils.toArray<HTMLElement>('[data-anim="reveal"]').forEach((el) => {
        gsap.from(el, {
          y: REVEAL.y,
          autoAlpha: 0,
          duration: REVEAL.duration,
          ease: EASES.out,
          scrollTrigger: { trigger: el, start: REVEAL.start, once: true },
        })
      })

      gsap.utils.toArray<HTMLElement>('[data-anim="reveal-stagger"]').forEach((group) => {
        const children = Array.from(group.children) as HTMLElement[]
        if (!children.length) return
        gsap.from(children, {
          y: REVEAL.y,
          autoAlpha: 0,
          duration: REVEAL.duration,
          ease: EASES.out,
          stagger: REVEAL.stagger,
          scrollTrigger: { trigger: group, start: REVEAL.start, once: true },
        })
      })

      gsap.utils.toArray<HTMLElement>('[data-anim="parallax"]').forEach((el) => {
        const amount = Number(el.dataset.parallax ?? '-10')
        gsap.to(el, {
          yPercent: amount,
          ease: EASES.none,
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })

      gsap.utils.toArray<SVGPathElement>('[data-anim="route"]').forEach((path) => {
        const len = path.getTotalLength()
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })
        gsap.to(path, {
          strokeDashoffset: 0,
          ease: EASES.none,
          scrollTrigger: {
            trigger: path.closest('section') ?? path,
            start: 'top 80%',
            end: 'bottom 60%',
            scrub: true,
          },
        })
      })

      gsap.utils.toArray<HTMLElement>('[data-anim="pin"]').forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top top',
          end: '+=80%',
          pin: true,
          pinSpacing: true,
        })
      })

      ScrollTrigger.refresh()
    })

    const pressEls = Array.from(
      document.querySelectorAll<HTMLElement>('[data-anim="press"]'),
    )
    const down = (e: Event) =>
      gsap.to(e.currentTarget as HTMLElement, {
        scale: 0.96,
        duration: DURATION.hover,
        ease: EASES.out,
      })
    const up = (e: Event) =>
      gsap.to(e.currentTarget as HTMLElement, {
        scale: 1,
        duration: DURATION.hover,
        ease: EASES.out,
      })
    pressEls.forEach((el) => {
      el.addEventListener('pointerdown', down)
      el.addEventListener('pointerup', up)
      el.addEventListener('pointerleave', up)
    })

    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('orientationchange', onResize)
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {})
    }

    return () => {
      window.removeEventListener('orientationchange', onResize)
      pressEls.forEach((el) => {
        el.removeEventListener('pointerdown', down)
        el.removeEventListener('pointerup', up)
        el.removeEventListener('pointerleave', up)
      })
      ctx.revert()
    }
  }, [])

  return null
}
