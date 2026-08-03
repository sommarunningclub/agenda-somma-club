import QRCode from 'qrcode'
import { QrCode } from 'lucide-react'

/** Seção com QR Code (gerado no servidor) apontando para a página. */
export async function QrSection({ url }: { url: string }) {
  let svg = ''
  try {
    svg = await QRCode.toString(url, {
      type: 'svg',
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#0a0a0a', light: '#ffffff' },
    })
  } catch {
    svg = ''
  }

  const pretty = url.replace(/^https?:\/\//, '')

  return (
    <section className="px-5 py-14 sm:px-8 md:py-20">
      <div data-anim="reveal" className="mx-auto max-w-3xl">
        <div className="grid items-center gap-8 rounded-3xl border border-somma-orange-muted/80 bg-white/60 p-8 shadow-sm shadow-somma-orange/[0.04] backdrop-blur-sm sm:grid-cols-[auto_1fr] sm:p-10">
          <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-2xl border border-somma-orange-muted/80 bg-white p-3 shadow-sm [&>svg]:h-full [&>svg]:w-full">
            {svg ? (
              <span
                aria-label={`QR Code para ${pretty}`}
                role="img"
                className="block h-full w-full"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            ) : (
              <QrCode className="h-20 w-20 text-somma-orange/30" />
            )}
          </div>

          {/* Texto */}
          <div className="text-center sm:text-left">
            <span className="agenda-eyebrow inline-flex items-center gap-1.5">
              <QrCode className="h-4 w-4" />
              Acesse pelo celular
            </span>
            <h2
              className="agenda-title mt-3 text-3xl leading-[0.95] sm:text-4xl"
              style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
            >
              Aponte a câmera e assine
            </h2>
            <p className="agenda-body mt-3">
              Aponte a câmera no QR Code, abra a Agenda Somma Club e adicione ao seu
              calendário em segundos. Perfeito pra compartilhar nos encontros e nas redes.
            </p>
            <p className="mt-4 inline-block rounded-lg bg-somma-orange-soft/50 px-3 py-1.5 text-sm font-semibold text-somma-ink ring-1 ring-somma-orange-muted/80">
              {pretty}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
