/* eslint-disable @next/next/no-img-element */
/* Ícones oficiais das marcas de calendário (SVGs em /public). */
import { cn } from '@/lib/utils'

export function AppleCalendarIcon({ className }: { className?: string }) {
  return (
    <img
      src="/icon-apple-calendar.svg"
      alt=""
      aria-hidden
      className={cn('object-contain', className)}
    />
  )
}

export function GoogleCalendarIcon({ className }: { className?: string }) {
  return (
    <img
      src="/icon-google-calendar.svg"
      alt=""
      aria-hidden
      className={cn('object-contain', className)}
    />
  )
}

export function OutlookIcon({ className }: { className?: string }) {
  return (
    <img
      src="/icon-outlook.svg"
      alt=""
      aria-hidden
      className={cn('object-contain', className)}
    />
  )
}
