/* eslint-disable @next/next/no-img-element */
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <img src="/somma-logo.svg" alt="Somma Club" className="h-6 w-auto sm:h-7" />
      <span className="hidden h-5 w-px bg-white/20 sm:block" aria-hidden />
      <span className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-white/60 sm:block">
        Agenda
      </span>
    </span>
  )
}
