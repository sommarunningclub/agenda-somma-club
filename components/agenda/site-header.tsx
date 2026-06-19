import Link from 'next/link'
import { Logo } from './logo'

export function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
        style={{
          paddingLeft: 'max(1rem, env(safe-area-inset-left))',
          paddingRight: 'max(1rem, env(safe-area-inset-right))',
        }}
      >
        <Link href="/agenda" aria-label="Agenda Somma Club">
          <Logo />
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/agenda/corridas"
            className="hidden text-sm font-medium text-white/70 transition-colors hover:text-white sm:block"
          >
            Corridas em Brasília
          </Link>
          <a
            href="#como-funciona"
            className="hidden text-sm font-medium text-white/70 transition-colors hover:text-white md:block"
          >
            Como funciona
          </a>
          <a
            href="#assinar"
            className="inline-flex h-11 items-center rounded-full bg-[#ff2c03] px-4 text-sm font-semibold text-white shadow-lg shadow-[#ff2c03]/20 transition-transform hover:scale-[1.03] active:scale-95 sm:h-9"
          >
            Adicionar agenda
          </a>
        </div>
      </div>
    </header>
  )
}
