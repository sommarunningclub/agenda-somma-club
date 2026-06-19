import { CalendarPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

/* Setas desenhadas à mão (acentos decorativos). */

export function ArrowDoodle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn('h-full w-full overflow-visible stroke-current', className)}
      fill="none"
      strokeWidth={6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M10,85 C 10,40 40,20 60,48 C 70,62 80,72 92,66" />
      <path d="M78,52 L93,66 L83,82" />
    </svg>
  )
}

export function ArrowLoop({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn('h-full w-full overflow-visible stroke-current', className)}
      fill="none"
      strokeWidth={6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M88,12 C 80,58 60,80 40,60 C 22,42 40,22 58,32 C 78,44 70,72 50,80" />
      <path d="M64,74 L50,80 L54,64" />
    </svg>
  )
}

export function ArrowShort({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn('h-full w-full overflow-visible stroke-current', className)}
      fill="none"
      strokeWidth={6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15,78 Q 45,18 82,42" />
      <path d="M62,22 L82,42 L52,60" />
    </svg>
  )
}

/** Selo circular girando — CTA decorativo. */
export function SpinBadge({ className }: { className?: string }) {
  return (
    <a
      href="#assinar"
      aria-label="Adicionar agenda grátis"
      className={cn(
        'group relative flex h-28 w-28 items-center justify-center rounded-full bg-black shadow-2xl ring-4 ring-white/20 transition-transform hover:scale-105 md:h-36 md:w-36',
        className,
      )}
    >
      <div className="absolute inset-1.5 animate-[spin_14s_linear_infinite]">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <path
            id="somma-badge-path"
            d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
            fill="none"
          />
          <text className="fill-white text-[10px] font-bold uppercase tracking-[0.22em]">
            <textPath href="#somma-badge-path" startOffset="0%">
              ADICIONAR AGENDA • GRÁTIS •&nbsp;
            </textPath>
          </text>
        </svg>
      </div>
      <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#ff2c03] text-white transition-transform group-hover:scale-110 md:h-12 md:w-12">
        <CalendarPlus className="h-5 w-5" />
      </span>
    </a>
  )
}
