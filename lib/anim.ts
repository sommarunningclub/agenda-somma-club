// Constantes e configs puras do sistema de animação (sem DOM, testáveis).

/** Conjunto de easings permitido no projeto. Padrão de entrada: `out`. */
export const EASES = {
  none: 'none',
  expo: 'expo',
  power4: 'power4',
  out: 'power2.out',
  in: 'power2.in',
  inOut: 'power2.inOut',
} as const

/** Lista achatada para validação. */
export const ALLOWED_EASES: readonly string[] = Object.values(EASES)

/** Durações padrão (segundos). Entradas entre 0.2 e 0.6. */
export const DURATION = {
  reveal: 0.5,
  revealFast: 0.3,
  hover: 0.4,
} as const

/** Config de reveal de entrada (dispara uma vez, sem scrub). */
export const REVEAL = {
  y: 32,
  duration: DURATION.reveal,
  ease: EASES.out,
  stagger: 0.05,
  start: 'top 70%',
} as const

/** Config do smooth scroll (Lenis). */
export const LENIS = {
  duration: 2,
  anchorsDuration: 1.2,
} as const

/** True se o usuário pediu menos movimento — ou se não há window (SSR/node). */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
