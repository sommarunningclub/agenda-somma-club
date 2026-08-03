import type { ReactNode } from 'react'
import { ScrollProvider } from '@/components/agenda/scroll-provider'
import { Animations } from '@/components/agenda/animations'

export default function AgendaLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div
        id="scroll-progress"
        aria-hidden
        className="fixed left-0 top-0 z-[60] h-1 w-full origin-left scale-x-0 bg-[#ff2c03]"
      />
      <ScrollProvider />
      <Animations />
      {children}
    </>
  )
}
