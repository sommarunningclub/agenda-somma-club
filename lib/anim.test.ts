import { describe, it, expect } from 'vitest'
import { ALLOWED_EASES, EASES, DURATION, REVEAL, LENIS, prefersReducedMotion } from './anim'

describe('anim primitives', () => {
  it('só expõe easings da lista permitida', () => {
    const allowed = ['none', 'expo', 'power4', 'power2.out', 'power2.in', 'power2.inOut']
    for (const e of ALLOWED_EASES) expect(allowed).toContain(e)
    expect(ALLOWED_EASES).toContain(EASES.out)
  })

  it('REVEAL usa power2.out, start "top 70%" e stagger 0.05', () => {
    expect(REVEAL.ease).toBe('power2.out')
    expect(REVEAL.start).toBe('top 70%')
    expect(REVEAL.stagger).toBe(0.05)
  })

  it('durações de entrada ficam entre 0.2 e 0.6s', () => {
    for (const d of [DURATION.reveal, DURATION.revealFast, DURATION.hover]) {
      expect(d).toBeGreaterThanOrEqual(0.2)
      expect(d).toBeLessThanOrEqual(0.6)
    }
  })

  it('Lenis: duration 2 e âncoras 1.2', () => {
    expect(LENIS.duration).toBe(2)
    expect(LENIS.anchorsDuration).toBe(1.2)
  })

  it('prefersReducedMotion retorna true sem window (SSR/node)', () => {
    expect(prefersReducedMotion()).toBe(true)
  })
})
