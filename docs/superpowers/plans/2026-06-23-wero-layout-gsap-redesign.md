# Redesign Wero + GSAP — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar a estrutura de seções (scroll-storytelling) e a camada de animação GSAP/Lenis do site Wero ao site público do Agenda Somma Club, mantendo marca, copy e funcionalidades.

**Architecture:** Reimplementar a estrutura do Wero como componentes React/Tailwind no app Next.js atual + camada de animação client (GSAP + ScrollTrigger + Lenis). Os componentes funcionais existentes (subscribe, events, races, qr) têm a lógica preservada — mudam layout, ordem e animação. As animações são progressive enhancement: a página funciona sem JS e com `prefers-reduced-motion`.

**Tech Stack:** Next.js 15.2.6 (App Router), React 19, TypeScript 5, Tailwind 3.4.17, GSAP 3.15 (+ ScrollTrigger), Lenis (a adicionar), Vitest (node env).

## Global Constraints

- **Marca:** manter laranja `#ff2c03` / preto, fonte display `"Arial Black", Impact, sans-serif`. NÃO usar paleta/fonte do Wero.
- **Copy:** preservar a copy atual; sem travessões (`—`) em texto visível.
- **Funcionalidade:** não alterar a lógica de dados (Supabase, `lib/subscribe-links`, `lib/tracking`, subscribe webcal/Google/Outlook, QR, calendário de corridas). Apenas consumir.
- **Easings permitidos (apenas estes):** `none`, `expo`, `power4`, `power2.out`, `power2.in`, `power2.inOut`. Padrão de entrada: `power2.out`.
- **Durações:** entradas 0.2–0.6s. `stagger: 0.05` para grupos.
- **Scrub:** só para parallax, barra de progresso e route-draw. Nunca para reveals (reveals disparam uma vez, `start: "top 70%"`).
- **Acessibilidade:** respeitar `prefers-reduced-motion` (desligar/atenuar; sem pin/scrub). Conteúdo visível sem JS.
- **gsap já é dependência**; adicionar apenas `lenis`. ScrollTrigger/Observer vêm do gsap.
- **Escopo:** páginas públicas `/agenda`, `/agenda/corridas`, `/agenda/[slug]`. Admin fora.

## Estratégia de verificação

O ambiente de teste (`vitest`) é **node-only**; não há jsdom/RTL configurado e o usuário não pediu para adicionar. Portanto:
- **Lógica pura** (`lib/anim.ts`, `lib/route-path.ts`): TDD com vitest (teste falha → implementa → passa).
- **Componentes/animação:** o ciclo de verificação de cada task é `npm run build` (typecheck + compilação) e `npm run lint`, mais checagem visual em `npm run dev`. Não fabricar testes de componente sem ambiente de DOM.

## File Structure

- `package.json` — adicionar `lenis`.
- `lib/anim.ts` (CREATE) — constantes/configs puras de animação + `prefersReducedMotion()`. Testável.
- `lib/anim.test.ts` (CREATE) — testes de `lib/anim.ts`.
- `lib/route-path.ts` (CREATE) — gerador puro do path SVG da rota de corrida. Testável.
- `lib/route-path.test.ts` (CREATE) — testes de `lib/route-path.ts`.
- `components/agenda/scroll-provider.tsx` (CREATE) — Lenis + sync GSAP ticker + barra de progresso.
- `app/agenda/layout.tsx` (CREATE) — monta ScrollProvider + Animations + barra de progresso para as 3 páginas.
- `components/agenda/animations.tsx` (MODIFY) — estende o orquestrador (reveal/parallax/route-draw/pinned/press) com os easings permitidos.
- `components/agenda/manifesto-section.tsx` (CREATE) — "O que é o Somma Club" + rota animada + pilares.
- `components/agenda/about-section.tsx` (DELETE) — copy migra para manifesto-section.
- `components/agenda/video-section.tsx` (CREATE) — "Somma em movimento" (vídeo/foto + CTA).
- `components/agenda/partners-section.tsx` (CREATE) — mural de plataformas/parceiros.
- `components/agenda/how-it-works.tsx` (MODIFY) — seção pinned.
- `components/agenda/hero.tsx` (MODIFY) — deixa "Role e descubra".
- `components/agenda/faq.tsx` (MODIFY) — pergunta em tipografia gigante + reveal.
- `components/agenda/final-cta.tsx` (MODIFY) — parallax na foto + reveal.
- `app/agenda/page.tsx` (MODIFY) — nova ordem de seções; troca About→Manifesto; adiciona Video/Partners; remove mount duplicado de Animations.
- `app/agenda/corridas/page.tsx` (MODIFY) — linguagem nova (hero + rota, reveals).
- `app/agenda/[slug]/page.tsx` (MODIFY) — linguagem nova (hero animado, reveals).

---

### Task 1: Dependência Lenis + primitivas puras de animação

**Files:**
- Modify: `package.json` (adicionar `lenis`)
- Create: `lib/anim.ts`
- Test: `lib/anim.test.ts`

**Interfaces:**
- Produces: `EASES`, `ALLOWED_EASES: string[]`, `DURATION`, `REVEAL`, `LENIS`, `prefersReducedMotion(): boolean` em `@/lib/anim`.

- [ ] **Step 1: Instalar Lenis**

Run: `npm install lenis@^1.1.18`
Expected: `package.json` ganha `"lenis": "^1.1.18"` em dependencies; `npm install` conclui sem erro.

- [ ] **Step 2: Escrever o teste que falha** — `lib/anim.test.ts`

```ts
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
```

- [ ] **Step 3: Rodar o teste e ver falhar**

Run: `npx vitest run lib/anim.test.ts`
Expected: FAIL (`Cannot find module './anim'`).

- [ ] **Step 4: Implementar `lib/anim.ts`**

```ts
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
```

- [ ] **Step 5: Rodar o teste e ver passar**

Run: `npx vitest run lib/anim.test.ts`
Expected: PASS (5 testes).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json lib/anim.ts lib/anim.test.ts
git commit -m "feat(anim): primitivas puras de animação + dependência Lenis"
```

---

### Task 2: Gerador puro do path da rota de corrida

**Files:**
- Create: `lib/route-path.ts`
- Test: `lib/route-path.test.ts`

**Interfaces:**
- Produces: `runningRoutePath(opts?: { width?: number; height?: number; points?: number; seed?: number }): string` em `@/lib/route-path`.

- [ ] **Step 1: Escrever o teste que falha** — `lib/route-path.test.ts`

```ts
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
```

- [ ] **Step 2: Rodar o teste e ver falhar**

Run: `npx vitest run lib/route-path.test.ts`
Expected: FAIL (`Cannot find module './route-path'`).

- [ ] **Step 3: Implementar `lib/route-path.ts`**

```ts
/**
 * Gera um path SVG de "rota de corrida" (polilinha suavizada, estilo traçado de GPS).
 * Determinístico por seed — seguro para render no servidor e no cliente.
 */
export function runningRoutePath(opts?: {
  width?: number
  height?: number
  points?: number
  seed?: number
}): string {
  const width = opts?.width ?? 1000
  const height = opts?.height ?? 400
  const points = Math.max(2, opts?.points ?? 7)
  let seed = (opts?.seed ?? 1) >>> 0

  // LCG determinístico (sem Math.random, para render estável)
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }

  const step = width / (points - 1)
  const pts = Array.from({ length: points }, (_, i) => ({
    x: i * step,
    y: height * (0.2 + 0.6 * rand()),
  }))

  let d = `M ${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i]
    const p1 = pts[i + 1]
    const cx = ((p0.x + p1.x) / 2).toFixed(2)
    d += ` C ${cx},${p0.y.toFixed(2)} ${cx},${p1.y.toFixed(2)} ${p1.x.toFixed(2)},${p1.y.toFixed(2)}`
  }
  return d
}
```

- [ ] **Step 4: Rodar o teste e ver passar**

Run: `npx vitest run lib/route-path.test.ts`
Expected: PASS (4 testes).

- [ ] **Step 5: Commit**

```bash
git add lib/route-path.ts lib/route-path.test.ts
git commit -m "feat(anim): gerador determinístico do path da rota de corrida"
```

---

### Task 3: ScrollProvider (Lenis + sync GSAP + barra de progresso)

**Files:**
- Create: `components/agenda/scroll-provider.tsx`

**Interfaces:**
- Consumes: `LENIS`, `prefersReducedMotion` de `@/lib/anim`.
- Produces: componente `<ScrollProvider />` (default-free, named export). Anima o elemento `#scroll-progress` se existir.

- [ ] **Step 1: Implementar o componente**

```tsx
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
      anchors: { offset: 0, onComplete: () => {} },
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
```

- [ ] **Step 2: Verificar build/lint**

Run: `npm run build`
Expected: compila sem erros de tipo (import de `lenis` resolve).
Run: `npm run lint`
Expected: sem erros novos.

- [ ] **Step 3: Commit**

```bash
git add components/agenda/scroll-provider.tsx
git commit -m "feat(anim): ScrollProvider com Lenis + barra de progresso"
```

---

### Task 4: Layout compartilhado de /agenda monta os providers

**Files:**
- Create: `app/agenda/layout.tsx`
- Modify: `app/agenda/page.tsx` (remover `<Animations />` do corpo e seu import)

**Interfaces:**
- Consumes: `<ScrollProvider />`, `<Animations />`.
- Produces: barra `#scroll-progress` no DOM de todas as páginas sob `/agenda`.

- [ ] **Step 1: Criar `app/agenda/layout.tsx`**

```tsx
import type { ReactNode } from 'react'
import { ScrollProvider } from '@/components/agenda/scroll-provider'
import { Animations } from '@/components/agenda/animations'

export default function AgendaLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div
        id="scroll-progress"
        aria-hidden
        className="fixed left-0 top-0 z-[60] h-1 w-full origin-left scale-x-0 bg-[#ff2c03]"
      />
      <ScrollProvider />
      <Animations />
      {children}
    </>
  )
}
```

- [ ] **Step 2: Remover o mount duplicado de Animations em `app/agenda/page.tsx`**

Remover a linha de import:
```tsx
import { Animations } from '@/components/agenda/animations'
```
E remover a tag `<Animations />` do JSX (fica logo após `<PageViewTracker />`). O `<PageViewTracker />` permanece.

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: compila; `/agenda`, `/agenda/corridas`, `/agenda/[slug]` continuam gerando. Sem dupla montagem de Animations.

- [ ] **Step 4: Verificação visual**

Run: `npm run dev` e abrir `http://localhost:3000/agenda`.
Expected: scroll suave (Lenis) ativo; barra laranja no topo cresce conforme rola; reveals continuam funcionando.

- [ ] **Step 5: Commit**

```bash
git add app/agenda/layout.tsx app/agenda/page.tsx
git commit -m "feat(agenda): layout compartilhado monta ScrollProvider + Animations"
```

---

### Task 5: Estender o orquestrador de animações

**Files:**
- Modify: `components/agenda/animations.tsx`

**Interfaces:**
- Consumes: `REVEAL`, `EASES`, `DURATION`, `prefersReducedMotion` de `@/lib/anim`.
- Produces: comportamento para os atributos `data-anim`: `hero-item`, `float`, `float2`, `mockup-row`, `mockup-bar`, `mockup-badge`, `reveal`, `reveal-stagger` (container), `parallax`, `route` (path SVG), `pin` (container) + `press` (micro-hover). Tudo no conjunto de easings permitido.

- [ ] **Step 1: Reescrever `components/agenda/animations.tsx`**

```tsx
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
      // Entrada do hero
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

      // Flutuações contínuas (mock do calendário)
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

      // Card de calendário "ganhando vida"
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

      // Reveals individuais (uma vez)
      gsap.utils.toArray<HTMLElement>('[data-anim="reveal"]').forEach((el) => {
        gsap.from(el, {
          y: REVEAL.y,
          autoAlpha: 0,
          duration: REVEAL.duration,
          ease: EASES.out,
          scrollTrigger: { trigger: el, start: REVEAL.start, once: true },
        })
      })

      // Reveals em grupo (stagger 0.05 nos filhos diretos)
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

      // Parallax (scrub). Quantidade via data-parallax (yPercent), default -10.
      gsap.utils.toArray<HTMLElement>('[data-anim="parallax"]').forEach((el) => {
        const amount = Number(el.dataset.parallax ?? '-10')
        gsap.to(el, {
          yPercent: amount,
          ease: EASES.none,
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })

      // Route-draw (scrub): path SVG desenhando conforme a seção entra.
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

      // Seção fixada (pinned). Container com [data-anim="pin"].
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

    // Micro-hover/press (fora do contexto para sobreviver a refresh)
    const pressEls = Array.from(
      document.querySelectorAll<HTMLElement>('[data-anim="press"]'),
    )
    const down = (e: Event) =>
      gsap.to(e.currentTarget as HTMLElement, { scale: 0.96, duration: DURATION.hover, ease: EASES.out })
    const up = (e: Event) =>
      gsap.to(e.currentTarget as HTMLElement, { scale: 1, duration: DURATION.hover, ease: EASES.out })
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
```

- [ ] **Step 2: Verificar build/lint**

Run: `npm run build && npm run lint`
Expected: compila e lint sem erros novos.

- [ ] **Step 3: Verificação visual**

Run: `npm run dev`, abrir `/agenda`.
Expected: reveals com `power2.out`; hero entra; floats do mock continuam; nenhuma regressão.

- [ ] **Step 4: Commit**

```bash
git add components/agenda/animations.tsx
git commit -m "feat(anim): orquestrador com reveal/parallax/route/pin/press e easings restritos"
```

---

### Task 6: Manifesto section (statement + rota animada + pilares)

**Files:**
- Create: `components/agenda/manifesto-section.tsx`
- Delete: `components/agenda/about-section.tsx`
- Modify: `app/agenda/page.tsx` (trocar `AboutSection` por `ManifestoSection`)

**Interfaces:**
- Consumes: `runningRoutePath` de `@/lib/route-path`; atributos `data-anim="route"`, `data-anim="reveal"`, `data-anim="reveal-stagger"` (Task 5).
- Produces: `export function ManifestoSection()`.

- [ ] **Step 1: Criar `components/agenda/manifesto-section.tsx`**

```tsx
import { HeartHandshake, MapPin, CalendarClock, Sparkles } from 'lucide-react'
import { runningRoutePath } from '@/lib/route-path'

const PILLARS = [
  {
    icon: HeartHandshake,
    title: 'Para todo mundo',
    text: 'Iniciante ou experiente, rápido ou no seu ritmo. Você não precisa ser atleta, não precisa já correr bem e não precisa fazer parte da assessoria. É só chegar.',
  },
  {
    icon: MapPin,
    title: 'Onde a gente corre',
    text: 'No Parque da Cidade Sarah Kubitschek, em Brasília. O ponto de encontro da maior comunidade de corrida do Distrito Federal.',
  },
  {
    icon: CalendarClock,
    title: 'Quando acontece',
    text: 'Encontros toda semana, com o treinão de sábado às 7h. Treinos, corridas pela cidade e eventos especiais entram na agenda o ano inteiro.',
  },
  {
    icon: Sparkles,
    title: 'Aberto e gratuito',
    text: 'Os encontros principais do Somma Club são gratuitos e abertos a todo mundo. Sem mensalidade pra correr com a gente. É só aparecer e fazer parte.',
  },
]

const ROUTE = runningRoutePath({ width: 1000, height: 320, points: 8, seed: 21 })

export function ManifestoSection() {
  return (
    <section id="sobre" className="relative scroll-mt-24 overflow-hidden px-5 py-16 sm:px-8 md:py-24">
      {/* Rota de corrida desenhando no scroll */}
      <svg
        viewBox="0 0 1000 320"
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-0 h-auto w-full -translate-y-1/2 opacity-[0.12]"
        fill="none"
        aria-hidden
      >
        <path
          data-anim="route"
          d={ROUTE}
          stroke="#ff2c03"
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="relative mx-auto max-w-6xl">
        <div data-anim="reveal" className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-[#ff2c03]">
            O que é o Somma Club
          </span>
          <h2
            className="mt-4 text-[clamp(2.5rem,7vw,5.5rem)] font-black uppercase leading-[0.9] tracking-tight text-black"
            style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
          >
            Correr junto
            <br />
            muda tudo
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base font-semibold text-black/60 sm:text-lg">
            O Somma Club é uma comunidade de corrida em Brasília, aberta a todo mundo. Mais
            que um grupo de corrida, é um movimento que une gente pelo esporte: do primeiro
            treino de quem tá começando agora ao último tiro de quem treina pra próxima
            prova. A gente corre junto, se apoia e comemora cada conquista. E o melhor:
            participar é de graça.
          </p>
        </div>

        <div
          data-anim="reveal-stagger"
          className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className="rounded-[1.75rem] border border-neutral-200 bg-[#F8F9FA] p-7 transition-colors hover:border-[#ff2c03]/40"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-[#ff6a52]">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-black uppercase leading-tight text-black">
                {p.title}
              </h3>
              <p className="mt-1.5 text-sm font-semibold text-black/55">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Trocar a seção em `app/agenda/page.tsx`**

Substituir o import:
```tsx
import { AboutSection } from '@/components/agenda/about-section'
```
por:
```tsx
import { ManifestoSection } from '@/components/agenda/manifesto-section'
```
E no JSX, trocar `<AboutSection />` por `<ManifestoSection />`.

- [ ] **Step 3: Apagar o componente antigo**

Run: `git rm components/agenda/about-section.tsx`
Expected: arquivo removido; nenhum outro import de `about-section` resta.
Run: `grep -rn "about-section" app components | grep -v "\._"` → sem resultados.

- [ ] **Step 4: Verificar build**

Run: `npm run build`
Expected: compila; `/agenda` gera sem referências quebradas.

- [ ] **Step 5: Verificação visual**

Run: `npm run dev`, abrir `/agenda`. Rolar até o manifesto.
Expected: título gigante, traçado laranja da rota desenhando conforme entra, pilares em stagger.

- [ ] **Step 6: Commit**

```bash
git add components/agenda/manifesto-section.tsx app/agenda/page.tsx
git commit -m "feat(agenda): manifesto com rota animada substitui about-section"
```

---

### Task 7: "Como funciona" como seção pinned

**Files:**
- Modify: `components/agenda/how-it-works.tsx`

**Interfaces:**
- Consumes: `data-anim="pin"` e `data-anim="reveal-stagger"` (Task 5).
- Produces: nenhuma nova; mesma export `HowItWorks`.

- [ ] **Step 1: Editar o wrapper para pinning**

Em `components/agenda/how-it-works.tsx`, no `<section id="como-funciona" ...>`, envolver o conteúdo interno num container com altura extra e marcar o miolo com `data-anim="pin"`. Trocar o bloco:

```tsx
    <section id="como-funciona" className="scroll-mt-24 px-5 py-14 sm:px-8 md:py-20">
      <div data-anim="reveal" className="mx-auto max-w-6xl">
```
por:
```tsx
    <section id="como-funciona" className="scroll-mt-24 px-5 sm:px-8">
      <div className="mx-auto max-w-6xl py-14 md:py-20" data-anim="pin">
        <div data-anim="reveal" className="mx-auto max-w-6xl">
```
E fechar a `div` extra: antes do `</section>` final, adicionar uma `</div>` a mais (para fechar o novo wrapper `data-anim="pin"`).

Marcar a grade dos passos para stagger: trocar
```tsx
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
```
por
```tsx
        <div data-anim="reveal-stagger" className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: compila; sem erro de JSX (tags balanceadas).

- [ ] **Step 3: Verificação visual**

Run: `npm run dev`, abrir `/agenda`, rolar até "Como funciona".
Expected: a seção fixa por ~80% de scroll enquanto os 3 passos entram em stagger; depois libera. Com `prefers-reduced-motion`, sem pin (conteúdo normal).

- [ ] **Step 4: Commit**

```bash
git add components/agenda/how-it-works.tsx
git commit -m "feat(agenda): 'como funciona' como seção pinned com passos em stagger"
```

---

### Task 8: Hero — deixa "Role e descubra"

**Files:**
- Modify: `components/agenda/hero.tsx`

**Interfaces:**
- Produces: indicador de scroll no rodapé do hero.

- [ ] **Step 1: Adicionar o indicador de scroll**

Em `components/agenda/hero.tsx`, importar `ArrowDown` já existe. Logo antes do fechamento da `</section>` do hero (após a `div` da coluna visual), adicionar:

```tsx
        {/* Deixa de scroll */}
        <a
          href="#sobre"
          data-anim="hero-item"
          className="col-span-full mx-auto mt-4 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-black/70 transition-colors hover:text-black lg:col-span-2"
        >
          Role e descubra
          <ArrowDown className="h-4 w-4 animate-bounce" />
        </a>
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: compila.

- [ ] **Step 3: Verificação visual**

Run: `npm run dev`, abrir `/agenda`.
Expected: "Role e descubra" com seta no fim do hero; clicar rola suave (Lenis) até o manifesto.

- [ ] **Step 4: Commit**

```bash
git add components/agenda/hero.tsx
git commit -m "feat(agenda): deixa de scroll 'Role e descubra' no hero"
```

---

### Task 9: Video section ("Somma em movimento")

**Files:**
- Create: `components/agenda/video-section.tsx`
- Modify: `app/agenda/page.tsx` (montar a seção)

**Interfaces:**
- Consumes: `data-anim="reveal"`.
- Produces: `export function VideoSection({ videoSrc, poster }: { videoSrc?: string; poster?: string })`.

Fallback (sem `videoSrc`): foto + CTA Instagram/Strava. A imagem padrão é `/SMEWNGS-1336.jpg` (já existe em `public/`).

- [ ] **Step 1: Criar `components/agenda/video-section.tsx`**

```tsx
'use client'

import { useRef, useState } from 'react'
import { Play, Instagram } from 'lucide-react'

export function VideoSection({
  videoSrc,
  poster = '/SMEWNGS-1336.jpg',
}: {
  videoSrc?: string
  poster?: string
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  function play() {
    const v = ref.current
    if (!v) return
    void v.play()
    setPlaying(true)
  }

  return (
    <section className="px-5 py-14 sm:px-8 md:py-20">
      <div data-anim="reveal" className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-[#ff2c03]">
            Somma em movimento
          </span>
          <h2
            className="mt-3 text-4xl font-black uppercase leading-[0.95] tracking-tight text-black sm:text-5xl"
            style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
          >
            A vibe de correr junto
          </h2>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-neutral-200 bg-black">
          {videoSrc ? (
            <>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                ref={ref}
                src={videoSrc}
                poster={poster}
                playsInline
                controls={playing}
                className="aspect-video w-full object-cover"
              />
              {!playing ? (
                <button
                  type="button"
                  onClick={play}
                  aria-label="Reproduzir vídeo"
                  data-anim="press"
                  className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/20"
                >
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#ff2c03] text-white shadow-2xl">
                    <Play className="ml-1 h-8 w-8" />
                  </span>
                </button>
              ) : null}
            </>
          ) : (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={poster} alt="Comunidade do Somma Club correndo junta" className="aspect-video w-full object-cover opacity-90" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/40 p-6 text-center">
                <p className="max-w-md text-lg font-bold text-white">
                  Acompanhe os bastidores e a galera correndo junto no nosso Instagram.
                </p>
                <a
                  href="https://www.instagram.com/somma.club/"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-anim="press"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-base font-bold text-black transition-transform hover:scale-[1.03] active:scale-95"
                >
                  <Instagram className="h-5 w-5" />
                  Ver no Instagram
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Montar em `app/agenda/page.tsx`**

Adicionar o import:
```tsx
import { VideoSection } from '@/components/agenda/video-section'
```
A posição exata é definida na Task 12 (reordenação). Por ora, adicionar `<VideoSection />` logo após o bloco de corridas (após o segundo `<SubscribeSection ... />` das corridas, antes do `<Faq />`).

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: compila.

- [ ] **Step 4: Verificação visual**

Run: `npm run dev`, abrir `/agenda`.
Expected: seção com foto + CTA Instagram (fallback, já que `videoSrc` não foi passado).

- [ ] **Step 5: Commit**

```bash
git add components/agenda/video-section.tsx app/agenda/page.tsx
git commit -m "feat(agenda): seção 'Somma em movimento' (vídeo com fallback de foto+Instagram)"
```

---

### Task 10: Partners section (mural)

**Files:**
- Create: `components/agenda/partners-section.tsx`
- Modify: `app/agenda/page.tsx` (montar a seção)

**Interfaces:**
- Consumes: `data-anim="reveal"`, `data-anim="reveal-stagger"`; ícones de `components/agenda/brand-icons.tsx` (`AppleCalendarIcon`, `GoogleCalendarIcon`, `OutlookIcon` — já existem).
- Produces: `export function PartnersSection()`.

Fallback (sem logos de parceiros): mural com as 3 plataformas de calendário + Strava + Instagram, com o título "Funciona em todo lugar".

- [ ] **Step 1: Criar `components/agenda/partners-section.tsx`**

```tsx
import { AppleCalendarIcon, GoogleCalendarIcon, OutlookIcon } from './brand-icons'

const PLATFORMS = [
  { label: 'Apple Calendar', Icon: AppleCalendarIcon },
  { label: 'Google Calendar', Icon: GoogleCalendarIcon },
  { label: 'Outlook', Icon: OutlookIcon },
]

export function PartnersSection() {
  return (
    <section className="px-5 py-14 sm:px-8 md:py-20">
      <div data-anim="reveal" className="mx-auto max-w-5xl text-center">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-[#ff2c03]">
          Funciona em todo lugar
        </span>
        <h2
          className="mt-3 text-4xl font-black uppercase leading-[0.95] tracking-tight text-black sm:text-5xl"
          style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
        >
          Pronto pra correr junto
        </h2>
        <p className="mx-auto mt-3 max-w-xl font-semibold text-black/55">
          A agenda do Somma Club entra no app que você já usa. Escolheu, adicionou, pronto:
          os encontros aparecem sozinhos.
        </p>

        <div
          data-anim="reveal-stagger"
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          {PLATFORMS.map(({ label, Icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-[#F8F9FA] px-5 py-4"
            >
              <Icon className="h-9 w-9" />
              <span className="font-black text-black">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Montar em `app/agenda/page.tsx`**

Adicionar import:
```tsx
import { PartnersSection } from '@/components/agenda/partners-section'
```
Posição definida na Task 12; por ora, `<PartnersSection />` logo após `<VideoSection />`.

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: compila.

- [ ] **Step 4: Verificação visual**

Run: `npm run dev`, abrir `/agenda`.
Expected: mural com Apple/Google/Outlook em stagger.

- [ ] **Step 5: Commit**

```bash
git add components/agenda/partners-section.tsx app/agenda/page.tsx
git commit -m "feat(agenda): mural 'funciona em todo lugar' (plataformas de calendário)"
```

---

### Task 11: FAQ com tipografia gigante + final-cta com parallax

**Files:**
- Modify: `components/agenda/faq.tsx`
- Modify: `components/agenda/final-cta.tsx`

**Interfaces:**
- Consumes: `data-anim="reveal"`, `data-anim="parallax"`.

- [ ] **Step 1: FAQ — título maior + reveal**

Em `components/agenda/faq.tsx`, no `<div className="mx-auto max-w-3xl">`, adicionar `data-anim="reveal"`. Aumentar o `<h2>` do bloco de cabeçalho do FAQ: trocar a classe
```tsx
            className="mt-3 text-4xl font-black uppercase leading-[0.95] tracking-tight text-black sm:text-5xl"
```
por
```tsx
            className="mt-3 text-[clamp(2.75rem,8vw,6rem)] font-black uppercase leading-[0.9] tracking-tight text-black"
```

- [ ] **Step 2: final-cta — parallax + reveal**

Em `components/agenda/final-cta.tsx`, adicionar uma foto de fundo com parallax. Trocar o `<section>` por:

```tsx
    <section className="relative overflow-hidden px-5 py-24 sm:px-8">
      <div
        data-anim="parallax"
        data-parallax="-15"
        className="pointer-events-none absolute inset-0 -z-10 bg-[url('/SMEWNGS-1336.jpg')] bg-cover bg-center opacity-10"
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-grid-ink opacity-50" aria-hidden />
```
(O restante do conteúdo — `<div data-anim="reveal" ...>` com o `<h2>`, `<p>` e o `<a>` — permanece. Garantir que o wrapper interno tenha `data-anim="reveal"`.)

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: compila.

- [ ] **Step 4: Verificação visual**

Run: `npm run dev`, abrir `/agenda`, rolar até FAQ e CTA final.
Expected: pergunta do FAQ em tipo gigante; foto do CTA final com leve parallax no scroll.

- [ ] **Step 5: Commit**

```bash
git add components/agenda/faq.tsx components/agenda/final-cta.tsx
git commit -m "feat(agenda): FAQ tipografia gigante + parallax no CTA final"
```

---

### Task 12: Reordenar o fluxo da landing `/agenda`

**Files:**
- Modify: `app/agenda/page.tsx`

**Interfaces:**
- Consumes: todas as seções já criadas/ajustadas.

Ordem final dentro do `<main>` (o container branco arredondado começa após o Marquee):

1. `<Hero events={events} />`
2. `<Marquee />`
3. container branco abre
4. `<ManifestoSection />`
5. `<HowItWorks />`
6. `<Benefits />`
7. `<EventsSection events={events} isSample={isSample} />`
8. `<SubscribeSection links={links} calendarSlug="somma" />`
9. `<QrSection url={...} />`
10. `<RacesSection races={races} />` + link "Ver todas as corridas" + `<SubscribeSection ...corridas />` (quando `races.length > 0`)
11. `<VideoSection />`
12. `<PartnersSection />`
13. `<Faq />`
14. container branco fecha
15. `<FinalCta />`

- [ ] **Step 1: Reordenar o JSX**

Ajustar o conteúdo do `<main>` em `app/agenda/page.tsx` para a ordem acima. O bloco branco (`<div className="relative z-10 rounded-t-[2.5rem] bg-white ...">`) envolve os itens 4–13. Mover `<VideoSection />` e `<PartnersSection />` para ficarem entre o bloco de corridas (item 10) e `<Faq />` (item 13). Mover `<Benefits />` para depois de `<HowItWorks />` (já está). Garantir que `<ManifestoSection />` seja o primeiro dentro do bloco branco.

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: compila; `/agenda` estática gerada.

- [ ] **Step 3: Verificação visual completa**

Run: `npm run dev`, abrir `/agenda` e rolar do topo ao fim.
Expected: a narrativa segue Hero → Marquee → Manifesto(rota) → Como funciona(pin) → Benefícios → Eventos → Assinar → QR → Corridas → Vídeo → Parceiros → FAQ → CTA final → Footer. Todas as funcionalidades (assinar, toggle de corridas, QR) operando.

- [ ] **Step 4: Commit**

```bash
git add app/agenda/page.tsx
git commit -m "feat(agenda): fluxo da landing na estrutura de scroll-storytelling"
```

---

### Task 13: Aplicar a linguagem nova em `/agenda/corridas`

**Files:**
- Modify: `app/agenda/corridas/page.tsx`

**Interfaces:**
- Consumes: `runningRoutePath` de `@/lib/route-path`; `data-anim="route"`, `data-anim="reveal"`. Os providers vêm do `app/agenda/layout.tsx` (Task 4) — nada a montar aqui.

- [ ] **Step 1: Hero com traçado de rota + reveals**

No topo do arquivo, adicionar:
```tsx
import { runningRoutePath } from '@/lib/route-path'

const CORRIDAS_ROUTE = runningRoutePath({ width: 1000, height: 280, points: 7, seed: 42 })
```

Na `<section className="bg-[#ff2c03] ...">` do hero, adicionar (como primeiro filho da section) o SVG da rota:
```tsx
          <svg
            viewBox="0 0 1000 280"
            className="pointer-events-none absolute inset-x-0 top-1/2 h-auto w-full -translate-y-1/2 opacity-20"
            fill="none"
            aria-hidden
          >
            <path data-anim="route" d={CORRIDAS_ROUTE} stroke="#000" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
```
e tornar a section `relative overflow-hidden` (adicionar essas classes ao className dela). Marcar o `<div className="mx-auto max-w-4xl">` interno com `data-anim="reveal"`.

Marcar as seções de conteúdo: o `<section className="px-5 py-12 ...">` (próximas corridas) e a grade de cards recebem `data-anim="reveal"` no wrapper `<div className="mx-auto max-w-4xl">`. A grade de cards recebe `data-anim="reveal-stagger"` no `<div className="mt-6 grid gap-4 sm:grid-cols-2">`.

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: compila; `/agenda/corridas` gerada.

- [ ] **Step 3: Verificação visual**

Run: `npm run dev`, abrir `/agenda/corridas`.
Expected: traçado de rota no hero desenhando no scroll; cards das corridas entram em stagger; smooth scroll ativo (via layout).

- [ ] **Step 4: Commit**

```bash
git add app/agenda/corridas/page.tsx
git commit -m "feat(corridas): hero com rota animada e reveals no scroll"
```

---

### Task 14: Aplicar a linguagem nova em `/agenda/[slug]`

**Files:**
- Modify: `app/agenda/[slug]/page.tsx`

**Interfaces:**
- Consumes: `data-anim="reveal"`, `data-anim="parallax"`. Providers via layout (Task 4).

- [ ] **Step 1: Hero do evento + reveals**

Na `<section className="relative overflow-hidden bg-[#ff2c03] ...">` do hero do evento, adicionar `data-anim="reveal"` no `<div className="mx-auto max-w-3xl">`. No `<article className="mx-auto max-w-3xl ...">`, marcar a `<dl className="grid ...">` com `data-anim="reveal-stagger"` e o bloco "Sobre o evento" (`<div className="mt-10">`) com `data-anim="reveal"`. Marcar a grade de relacionados (`<div className="mt-6 grid gap-4 sm:grid-cols-2">`) com `data-anim="reveal-stagger"`.

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: compila; rota dinâmica `/agenda/[slug]` ok.

- [ ] **Step 3: Verificação visual**

Run: `npm run dev`, abrir uma página de evento (ex.: a partir de um card em `/agenda`).
Expected: ficha do evento entra em stagger; smooth scroll ativo; CTA assinar e check-in funcionando.

- [ ] **Step 4: Commit**

```bash
git add app/agenda/[slug]/page.tsx
git commit -m "feat(evento): reveals no scroll na página de evento"
```

---

### Task 15: Verificação final — reduced-motion, build e deploy

**Files:** nenhum (verificação) — exceto eventuais ajustes.

- [ ] **Step 1: Conferir prefers-reduced-motion**

Em `npm run dev`, ativar "Reduzir movimento" no SO (ou DevTools → Rendering → Emulate prefers-reduced-motion: reduce) e recarregar `/agenda`.
Expected: sem smooth-scroll, sem pin, sem scrub; conteúdo todo visível e legível; barra de progresso pode ficar estática/oculta. Nenhum conteúdo "preso" invisível.

- [ ] **Step 2: Conferir ausência de travessões em texto novo**

Run: `grep -rn "—" components/agenda app/agenda lib/route-path.ts lib/anim.ts | grep -v "/\._" | grep -v 'text-black/30">—' | grep -v 'text-\[#c3c7cf\]">—'`
Expected: sem resultados em texto visível novo (placeholders de célula vazia permanecem).

- [ ] **Step 3: Build de produção**

Run: `npm run build`
Expected: `✓ Compiled successfully`; rotas `/agenda`, `/agenda/corridas`, `/agenda/[slug]` presentes.

- [ ] **Step 4: Testes e lint**

Run: `npx vitest run && npm run lint`
Expected: todos os testes passam; lint sem erros.

- [ ] **Step 5: Deploy de produção**

Run: `vercel --prod --yes`
Expected: deployment `READY`; alias `agenda.sommaclub.com.br` atualizado.

- [ ] **Step 6: Commit final (se houver ajustes)**

```bash
git add -A
git commit -m "chore: ajustes finais do redesign Wero + GSAP"
```

---

## Self-Review (preenchido)

**1. Cobertura do spec:**
- Estrutura de seções da landing → Tasks 6–12. ✓
- Manifesto + rota animada (substitui aviões) → Tasks 2, 6. ✓
- Como funciona pinned → Task 7. ✓
- Benefícios/eventos/assinar/QR/corridas costurados → Task 12 (ordem) + reveals via data-anim. ✓
- Vídeo (com fallback) → Task 9. ✓
- Parceiros (com fallback) → Task 10. ✓
- FAQ gigante + CTA final → Task 11. ✓
- Sistema GSAP/Lenis (reveal/parallax/progresso/route/pin/press, easings restritos, reduced-motion) → Tasks 1, 3, 5, 15. ✓
- Outras páginas (corridas, [slug]) → Tasks 13, 14. ✓
- DrawSVG fallback (stroke-dashoffset) → Task 5 (route). Lottie fora de escopo → coberto pela rota SVG. ✓
- Marca/copy/funcionalidade preservadas → constraints globais + edits cirúrgicos. ✓

**2. Placeholders:** nenhum TBD/TODO; todo passo de código tem código real.

**3. Consistência de tipos:** `data-anim` values (`reveal`, `reveal-stagger`, `parallax`, `route`, `pin`, `press`, `hero-item`, `float`, `float2`, `mockup-*`) definidos na Task 5 e consumidos consistentemente nas Tasks 6–14. `runningRoutePath`/`prefersReducedMotion`/`REVEAL`/`EASES`/`LENIS` com assinaturas idênticas onde usadas.
