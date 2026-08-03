import { describe, it, expect } from 'vitest'
import { runningRoutePath } from './route-path'

describe('runningRoutePath', () => {
  it('começa com um comando moveto (M)', () => {
    expect(runningRoutePath()).toMatch(/^M /)
  })

  it('é determinístico para a mesma seed', () => {
    expect(runningRoutePath({ seed: 7 })).toBe(runningRoutePath({ seed: 7 }))
  })

  it('muda quando a seed muda', () => {
    expect(runningRoutePath({ seed: 1 })).not.toBe(runningRoutePath({ seed: 2 }))
  })

  it('gera (points - 1) curvas Bézier', () => {
    const d = runningRoutePath({ points: 6, seed: 3 })
    const cs = d.match(/C /g) ?? []
    expect(cs.length).toBe(5)
  })
})
