'use client'

import { useEffect, useState } from 'react'
import { CalendarPlus } from 'lucide-react'
import { track } from '@/lib/tracking'

/**
 * Barra de ação fixa no rodapé (só mobile) — padrão de app de iPhone.
 * Aparece depois de rolar o hero e some perto do fim (para não cobrir o footer).
 */
export function MobileCtaBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const nearBottom =
        window.innerHeight + y >= document.documentElement.scrollHeight - 240
      setVisible(y > 520 && !nearBottom)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 sm:hidden ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-hidden={!visible}
    >
      <div className="border-t border-black/10 bg-white/90 px-4 py-3 backdrop-blur-md">
        <a
          href="#assinar"
          tabIndex={visible ? 0 : -1}
          onClick={() => track('calendar_add_click', { platform: 'cta_bar', calendar: 'somma' })}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#ff2c03] text-base font-bold text-white shadow-lg shadow-[#ff2c03]/30 active:scale-[0.98]"
        >
          <CalendarPlus className="h-5 w-5" />
          Adicionar agenda grátis
        </a>
      </div>
    </div>
  )
}
