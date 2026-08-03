'use client'

import { useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { track } from '@/lib/tracking'
import {
  AppleCalendarIcon,
  GoogleCalendarIcon,
  OutlookIcon,
} from './brand-icons'
import type { SubscribeLinks } from '@/lib/subscribe-links'
import type { CalendarSlug, Platform } from '@/lib/constants'

type UTM = Partial<
  Record<'utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_content' | 'utm_term', string>
>

function readUtm(): UTM {
  if (typeof window === 'undefined') return {}
  const p = new URLSearchParams(window.location.search)
  const utm: UTM = {}
  for (const k of [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
  ] as const) {
    const v = p.get(k)
    if (v) utm[k] = v
  }
  return utm
}

const OPTIONS: {
  key: Platform
  label: string
  hint: string
  href: (l: SubscribeLinks) => string
  Icon: typeof AppleCalendarIcon
  newTab: boolean
}[] = [
  {
    key: 'apple',
    label: 'Agenda iPhone',
    hint: 'Apple Calendar',
    href: (l) => l.webcal,
    Icon: AppleCalendarIcon,
    newTab: false,
  },
  {
    key: 'google',
    label: 'Android',
    hint: 'Google Calendar',
    href: (l) => l.google,
    Icon: GoogleCalendarIcon,
    newTab: true,
  },
  {
    key: 'outlook',
    label: 'Outlook',
    hint: 'Microsoft 365',
    href: (l) => l.outlook,
    Icon: OutlookIcon,
    newTab: true,
  },
]

export function SubscribeSection({
  links,
  calendarSlug,
  id = 'assinar',
  eyebrow = 'É grátis',
  title = 'Adicione a agenda',
  subtitle = 'Escolha o seu calendário e receba os encontros, treinos e corridas do Somma Club. Daí pra frente, a agenda se atualiza sozinha.',
}: {
  links: SubscribeLinks
  calendarSlug: CalendarSlug
  id?: string
  eyebrow?: string
  title?: string
  subtitle?: string
}) {
  const [utm, setUtm] = useState<UTM>({})
  const [selected, setSelected] = useState<Platform | ''>('')

  useEffect(() => setUtm(readUtm()), [])

  function handleSubscribe(p: Platform) {
    setSelected(p)
    track('calendar_platform_select', { platform: p, calendar: calendarSlug })
    track('calendar_add_click', { platform: p, calendar: calendarSlug })
    void fetch('/api/calendar/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform: p,
        calendar_slug: calendarSlug,
        ...utm,
        referrer: document.referrer || undefined,
      }),
      keepalive: true,
    }).catch(() => {})
  }

  return (
    <section id={id} className="scroll-mt-24 px-5 py-14 sm:px-8 md:py-20">
      <div data-anim="reveal" className="mx-auto max-w-md">
        <div className="text-center">
          <span className="agenda-eyebrow">{eyebrow}</span>
          <h2
            className="agenda-title mt-3 text-4xl leading-[0.95] sm:text-5xl"
            style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
          >
            {title}
          </h2>
          <p className="agenda-body mx-auto mt-3 max-w-sm">{subtitle}</p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {OPTIONS.map(({ key, label, hint, href, Icon, newTab }) => (
            <a
              key={key}
              href={href(links)}
              target={newTab ? '_blank' : undefined}
              rel={newTab ? 'noopener noreferrer' : undefined}
              onClick={() => handleSubscribe(key)}
              className={`group flex items-center gap-4 rounded-2xl border-2 p-4 transition-all active:scale-[0.99] ${
                selected === key
                  ? 'border-somma-orange bg-somma-orange-soft'
                  : 'border-somma-orange-muted/80 bg-white/70 hover:border-somma-orange/40'
              }`}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center">
                <Icon className="h-10 w-10" />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block font-black text-somma-ink">{label}</span>
                <span className="block text-xs font-semibold text-somma-ink-muted">{hint}</span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-somma-orange/40 transition-transform group-hover:translate-x-0.5" />
            </a>
          ))}
        </div>

        <p className="mt-5 text-center text-xs font-medium text-somma-ink-muted">
          No iPhone, é só confirmar a assinatura que o sistema pedir. No Android, o Google
          abre no navegador pra você tocar em “Adicionar” e a agenda aparece sozinha no app.
          No Outlook, confirme o “Adicionar” na tela que abrir.
        </p>
      </div>
    </section>
  )
}
