'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { FAQ_ITEMS } from '@/lib/faq'

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="px-5 py-14 sm:px-8 md:py-20">
      <div data-anim="reveal" className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <span className="agenda-eyebrow">Perguntas frequentes</span>
          <h2
            className="agenda-title mt-3 text-[clamp(2.75rem,8vw,6rem)] leading-[0.9]"
            style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
          >
            Tudo que importa
          </h2>
        </div>

        <div className="divide-y divide-somma-orange-muted/60 overflow-hidden rounded-[1.5rem] border border-somma-orange-muted/80 bg-white/60 shadow-sm shadow-somma-orange/[0.04] backdrop-blur-sm">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-somma-orange-soft/50"
                >
                  <span className="font-black text-somma-ink">{item.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-somma-orange transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="agenda-body px-5 pb-5 text-sm">{item.a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
