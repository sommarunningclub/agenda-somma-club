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
  subtitle = 'Escolha o seu calendário e receba os encontros, treinos e corridas do Somma Club. A agenda passa a atualizar sozinha.',
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
          <span className="text-xs font-black uppercase tracking-[0.18em] text-[#ff2c03]">
            {eyebrow}
          </span>
          <h2
            className="mt-3 text-4xl font-black uppercase leading-[0.95] tracking-tight text-black sm:text-5xl"
            style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
          >
            {title}
          </h2>
          <p className="mx-auto mt-3 max-w-sm font-semibold text-black/55">{subtitle}</p>
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
                  ? 'border-[#ff2c03] bg-[#ff2c03]/[0.06]'
                  : 'border-neutral-200 bg-white hover:border-black'
              }`}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center">
                <Icon className="h-10 w-10" />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block font-black text-black">{label}</span>
                <span className="block text-xs font-semibold text-black/45">{hint}</span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-black/30 transition-transform group-hover:translate-x-0.5" />
            </a>
          ))}
        </div>

        <p className="mt-5 text-center text-xs font-medium text-black/45">
          No iPhone, confirme a assinatura que o sistema pedir. No Android, o Google abre no
          navegador para você tocar em “Adicionar” — depois a agenda aparece sozinha no app.
          No Outlook, confirme “Adicionar” na tela que abrir.
        </p>
      </div>
    </section>
  )
}
