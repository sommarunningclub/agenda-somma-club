import { DM_Sans, JetBrains_Mono } from 'next/font/google'

// Design system "Pulse": DM Sans (corpo) + JetBrains Mono (rótulos/dados), em todo o /admin.
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' })
const jetMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export default function AdminBaseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className={`${dmSans.variable} ${jetMono.variable} min-h-[100dvh]`}
      style={{ fontFamily: 'var(--font-dm-sans), system-ui, sans-serif' }}
    >
      {children}
    </div>
  )
}
