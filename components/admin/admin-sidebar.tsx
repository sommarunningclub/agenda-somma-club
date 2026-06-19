'use client'

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logoutAction } from '@/app/admin/login/actions'

const mono = { fontFamily: 'var(--font-jetbrains), ui-monospace, monospace' }

const NAV = [
  { href: '/admin/agenda', label: 'Painel', icon: LayoutDashboard, exact: true },
  { href: '/admin/agenda/calendar', label: 'Calendário', icon: CalendarRange, exact: false },
  { href: '/admin/agenda/events', label: 'Eventos', icon: CalendarDays, exact: false },
  { href: '/admin/agenda/metrics', label: 'Métricas', icon: BarChart3, exact: false },
]

function isActive(pathname: string, href: string, exact: boolean) {
  return exact ? pathname === href : pathname.startsWith(href)
}

function Brand() {
  return (
    <Link href="/admin/agenda" className="flex items-center gap-2.5">
      <img src="/number-1.png" alt="Agenda Somma" className="h-9 w-9 object-contain" />
      <span className="text-[15px] font-semibold tracking-tight text-[#1f2937]">
        Agenda Somma
      </span>
      <span
        className="rounded-md bg-[#f3f4f7] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#6b7280]"
        style={mono}
      >
        Admin
      </span>
    </Link>
  )
}

/* ------------------------------- Desktop ------------------------------- */

function NavList() {
  const pathname = usePathname()
  return (
    <nav className="space-y-1">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href, item.exact)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all',
              active
                ? 'bg-[#1f2329] font-medium text-white shadow-sm'
                : 'text-[#4b5563] hover:bg-[#f3f4f7] hover:text-[#1f2937]',
            )}
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function DesktopFooter() {
  return (
    <div className="space-y-1 border-t border-[#e6e8ec] pt-3">
      <Link
        href="/agenda"
        target="_blank"
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#4b5563] transition-colors hover:bg-[#f3f4f7] hover:text-[#1f2937]"
      >
        <ExternalLink className="h-[18px] w-[18px] shrink-0" />
        Ver site
      </Link>
      <form action={logoutAction}>
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#4b5563] transition-colors hover:bg-[#ff2c03]/[0.06] hover:text-[#cc2402]"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          Sair
        </button>
      </form>
    </div>
  )
}

/* ------------------------------- Mobile -------------------------------- */
/* Estilo "app nativo": app bar fixa no topo + tab bar fixa embaixo.       */

function MobileTopBar() {
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between border-b border-[#e6e8ec] bg-white/90 px-4 backdrop-blur lg:hidden"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex h-14 items-center">
        <Brand />
      </div>
      <div className="flex items-center gap-1">
        <Link
          href="/agenda"
          target="_blank"
          aria-label="Ver site"
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#4b5563] transition-colors active:bg-[#f3f4f7]"
        >
          <ExternalLink className="h-5 w-5" />
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            aria-label="Sair"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#4b5563] transition-colors active:bg-[#ff2c03]/[0.08] active:text-[#cc2402]"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </form>
      </div>
    </header>
  )
}

function MobileTabBar() {
  const pathname = usePathname()
  // Divide o NAV em dois lados, com o botão "+" central elevado.
  const left = NAV.slice(0, 2)
  const right = NAV.slice(2)

  const Tab = ({ item }: { item: (typeof NAV)[number] }) => {
    const active = isActive(pathname, item.href, item.exact)
    return (
      <Link
        href={item.href}
        className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5"
      >
        <item.icon
          className={cn(
            'h-[22px] w-[22px] transition-colors',
            active ? 'text-[#ff2c03]' : 'text-[#9ca3af]',
          )}
        />
        <span
          className={cn(
            'text-[10px] font-medium transition-colors',
            active ? 'text-[#ff2c03]' : 'text-[#9ca3af]',
          )}
        >
          {item.label}
        </span>
      </Link>
    )
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e6e8ec] bg-white/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="relative mx-auto flex h-16 max-w-md items-stretch px-2">
        {left.map((item) => (
          <Tab key={item.href} item={item} />
        ))}

        {/* Botão central elevado: novo evento */}
        <div className="flex w-16 shrink-0 items-start justify-center">
          <Link
            href="/admin/agenda/events/new"
            aria-label="Novo evento"
            className="-mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#ff2c03] text-white shadow-lg shadow-[#ff2c03]/30 ring-4 ring-white transition-transform active:scale-95"
          >
            <Plus className="h-6 w-6" />
          </Link>
        </div>

        {right.map((item) => (
          <Tab key={item.href} item={item} />
        ))}
      </div>
    </nav>
  )
}

/* ------------------------------- Export -------------------------------- */

export function AdminSidebar() {
  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[#e6e8ec] bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-[#e6e8ec] px-5">
          <Brand />
        </div>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Link
            href="/admin/agenda/events/new"
            className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#ff2c03] text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Novo evento
          </Link>
          <NavList />
          <div className="mt-auto">
            <DesktopFooter />
          </div>
        </div>
      </aside>

      {/* App mobile: top bar + bottom tab bar */}
      <MobileTopBar />
      <MobileTabBar />
    </>
  )
}
