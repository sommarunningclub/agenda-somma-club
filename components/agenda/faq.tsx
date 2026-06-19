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
          <span className="text-xs font-black uppercase tracking-[0.18em] text-[#ff2c03]">
            Perguntas frequentes
          </span>
          <h2
            className="mt-3 text-4xl font-black uppercase leading-[0.95] tracking-tight text-black sm:text-5xl"
            style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
          >
            Tudo que importa
          </h2>
        </div>

        <div className="divide-y divide-neutral-200 overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-[#F8F9FA]">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-black/[0.02]"
                >
                  <span className="font-black text-black">{item.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[#ff2c03] transition-transform ${
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
                    <p className="px-5 pb-5 text-sm font-semibold text-black/60">
                      {item.a}
                    </p>
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
