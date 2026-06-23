import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics as VercelAnalytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { Analytics } from '@/components/analytics'
import { getSiteUrl } from '@/lib/constants'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'Somma Club: Running Club e Comunidade de Corrida em Brasília',
    template: '%s | Somma Club',
  },
  description:
    'O maior running club de Brasília: comunidade de corrida aberta e gratuita, com encontros todo sábado no Parque da Cidade, para iniciantes e experientes. Assine a agenda grátis.',
  applicationName: 'Somma Club',
  authors: [{ name: 'Somma Club' }],
  creator: 'Somma Club',
  publisher: 'Somma Club',
  category: 'sports',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ff2c03',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <Analytics />
        {children}
        <Toaster position="top-center" richColors />
        <VercelAnalytics />
      </body>
    </html>
  )
}
