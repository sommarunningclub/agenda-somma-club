# Redesign: estrutura Wero + animações GSAP no Agenda Somma Club

**Data:** 2026-06-23
**Status:** Aprovado para planejamento

## Objetivo

Aplicar a **estrutura de seções (scroll-storytelling)** e a **camada de animação (GSAP + Lenis)** do site capturado `wero-wallet.eu/nl/ondernemer` ao site público do Agenda Somma Club, **mantendo a marca Somma** (laranja `#ff2c03`/preto, Arial Black, vibe esportiva), **toda a copy atual** e **todas as funcionalidades existentes**.

## Decisões travadas (com o usuário)

1. **Identidade:** marca Somma + estrutura/motion do Wero. NÃO adotar a paleta dark/azul/amarelo nem a fonte fintech do Wero.
2. **Escopo:** todas as páginas públicas — `/agenda` (landing), `/agenda/corridas`, `/agenda/[slug]` (evento). O admin (`/admin/*`) fica fora.
3. **Funcional:** manter as seções funcionais (assinar calendário, eventos do Supabase, calendário de corridas, QR) costuradas dentro do novo fluxo. Nada de funcionalidade se perde.

## Abordagem técnica

Reimplementar a estrutura do Wero como **componentes React/Tailwind no app Next.js atual**, adicionando uma **camada de animação GSAP/Lenis** via componentes client. NÃO portar o HTML estático Vue do Wero.

- A lógica dos componentes funcionais existentes (`subscribe-section`, `events-section`, `races-section`, `qr-section`, `event-card`, dados do Supabase, tracking, subscribe-links) é **preservada**. As mudanças são de **layout, ordem e animação**, não de lógica de dados.
- SSR/SEO/JSON-LD atuais são mantidos. As animações são progressivas (a página funciona sem JS e com `prefers-reduced-motion`).
- Alternativa descartada: port literal do HTML Wero (quebraria a funcionalidade, não é React, depende de fonte/JS proprietários).

## Referência: estrutura do Wero (capturada)

Página Vue/Nuxt, scroll-storytelling, com animações SVG dirigidas por scroll. Seções na ordem:

1. **Hero** — palavra empilhada gigante ("iDEAL WORDT WERO") + deixa de scroll ("Scroll en ontdek") + SVG animado.
2. **Airplanes** — frase-manifesto com traçados (rotas de avião) desenhando no scroll.
3. **Puzzle** — seção ilustrativa fixada (pinned) que monta no scroll (`PageTransitionSection.css`).
4. **Cards-block** — "O que isso significa para empreendedores" (grade de cards com imagens).
5. **FAQ** — perguntas com tipografia gigante animada.
6. **Vídeo** — série de Q&A (player Plyr).
7. **Partners** — mural de logos + "Pronto para um belo futuro".
8. **Fist-bump** — CTA final.

Paleta Wero (NÃO usada): dark `#1d1c1c`/`#23282f`, azul `#00b2ff`, amarelo `#fff48d`, magenta `#fd74fd`, fonte GT Walsheim. Mantida apenas como referência de *layout e motion*, não de estilo visual.

## Fluxo da landing `/agenda` (conteúdo Somma na estrutura Wero)

| # | Seção Wero | Vira no Somma | Componente | Animação |
|---|---|---|---|---|
| 1 | Hero empilhado + "scroll" | Hero "CORRIDA/SOMMA/CLUB" + deixa "Role e descubra" + mockup + CTA assinar | `hero.tsx` (ajuste) | reveal + parallax suave + deixa de scroll |
| 2 | Manifesto + rotas animadas | "O que é o Somma Club" como manifesto, com traçado de **rota de corrida (GPS)** desenhando no scroll | nova `manifesto-section.tsx` (reusa copy de `about-section`) | SVG stroke-draw com scrub |
| 3 | Marquee/ticker | Marquee atual (mantido) | `marquee.tsx` | loop GSAP existente |
| 4 | Puzzle (pinned) | "Como funciona" — 3 passos que montam numa seção fixada | `how-it-works.tsx` (ajuste para pinned) | pinned ScrollTrigger |
| 5 | Cards-block | "O que você recebe" (6 benefícios) | `benefits.tsx` | reveal com stagger |
| 6 | — (funcional) | Eventos ao vivo "Entram na agenda" | `events-section.tsx` | reveal stagger |
| 7 | — (funcional) | Assinar agenda (CTA-conversão principal) | `subscribe-section.tsx` | reveal |
| 8 | — (funcional) | QR | `qr-section.tsx` | reveal |
| 9 | — (funcional) | Calendário de corridas | `races-section.tsx` | reveal |
| 10 | Vídeo Q&A | "Somma em movimento" — vídeo/reel da comunidade | nova `video-section.tsx` | reveal + play |
| 11 | Mural de parceiros | Mural de parceiros/apoiadores | nova `partners-section.tsx` | logo wall com stagger |
| 12 | FAQ gigante | FAQ atual com pergunta em tipo gigante animado | `faq.tsx` (ajuste) | reveal |
| 13 | Fist-bump CTA | "Sua próxima corrida já tem data" + assinar | `final-cta.tsx` (ajuste) | reveal + parallax foto |

Header e footer atuais são mantidos (header sticky já existe).

## Outras páginas

- **`/agenda/corridas`**: mesma linguagem — hero empilhado + traçado de rota animado, calendário/lista de corridas, CTA assinar, footer. Animação mais leve.
- **`/agenda/[slug]`**: mesma linguagem — hero do evento animado, ficha do evento, CTA assinar, eventos relacionados. Animação mais leve.
- **Compartilhado:** header, footer, o provider de smooth-scroll/GSAP, e os utilitários de reveal/parallax/route-draw.

## Sistema de animação (conforme prompt do usuário)

**Provider client global** (`components/agenda/scroll-provider.tsx` ou similar), montado no layout das páginas públicas:

- **Lenis** (`@studio-freight/lenis` ou `lenis`) — smooth scroll, `duration: 2`, âncoras `{ duration: 1.2 }`, sincronizado com `ScrollTrigger.update()` e `gsap.ticker` (com `gsap.ticker.lagSmoothing(0)`).
- **GSAP + ScrollTrigger + Observer**, registrados uma vez com `gsap.registerPlugin()`.

**Utilitários por classe/atributo**, aplicados automaticamente a elementos marcados:

- `.reveal` / `[data-anim="reveal"]` — entrada `opacity` 0→1 + `y` leve, `duration` 0.25–0.6s, `ease: "power2.out"`, `stagger: 0.05` para grupos, `scrollTrigger: { start: "top 70%" }`, dispara **uma vez**.
- `.parallax` / `[data-anim="parallax"]` — deslocamento com `scrub: true`.
- barra de progresso — `scaleX` 0→1, `ease: "none"`, `scrub: true`, trigger no documento.
- micro-hover/press — `scale` no press (~0.95–0.97) e release (1), `duration` ~0.4, `power2.out`.
- traçado de rota SVG — `stroke-dashoffset` animado com `scrub` (fallback grátis ao DrawSVG pago).
- seção pinned ("Como funciona") — `ScrollTrigger` com `pin: true`.

**Restrições de consistência:** easings limitados a `none`, `expo`, `power4`, `power2.out`, `power2.in`, `power2.inOut`; `power2.out` como padrão de entrada; durações 0.2–0.6s; `scrub` só para parallax/progresso/draw, nunca para reveals; `stagger: 0.05` para grupos.

**Acessibilidade/performance:** respeitar `prefers-reduced-motion` (desliga/atenua e desabilita o pin/scrub); GSAP/Lenis importados só no client; `ScrollTrigger.refresh()` após carregamento de dados/imagens.

## Fora de escopo

- **DrawSVGPlugin** (pago) — substituído pelo fallback `stroke-dasharray`/`stroke-dashoffset`.
- **Lottie** — sem assets `.json` disponíveis; ilustrações feitas com SVG + GSAP. Plugável depois se houver JSONs.
- Painel admin (`/admin/*`).
- Reescrita da lógica de dados (Supabase, subscribe-links, tracking) — apenas consumida.

## Lacunas de asset (com fallback, não bloqueiam)

- **Vídeo** da seção "Somma em movimento": não existe no código. Fallback: foto da comunidade (`/SMEWNGS-1336.jpg`) + CTA Instagram/Strava até o usuário fornecer vídeo/reel.
- **Logos de parceiros:** se não houver, o mural usa as 3 plataformas de calendário (Apple/Google/Outlook) + Strava/Instagram como "funciona em todo lugar".

## Critérios de sucesso

1. As três páginas públicas seguem a estrutura de seções acima, com a copy atual preservada (e sem travessões, conforme já aplicado).
2. Smooth scroll (Lenis) + animações de scroll (GSAP) funcionando, com os padrões e restrições de easing/duração definidos.
3. Toda a funcionalidade atual continua operando: assinar calendário (webcal/Google/Outlook), eventos do Supabase, calendário de corridas, QR, tracking, links de âncora.
4. `prefers-reduced-motion` desliga/atenua as animações; a página é utilizável sem JS.
5. `next build` passa; deploy de produção na Vercel.
