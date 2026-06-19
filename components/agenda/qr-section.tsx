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
        <div className="grid items-center gap-8 rounded-3xl border border-neutral-200 bg-[#F8F9FA] p-8 sm:grid-cols-[auto_1fr] sm:p-10">
          {/* QR */}
          <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm [&>svg]:h-full [&>svg]:w-full">
            {svg ? (
              <span
                aria-label={`QR Code para ${pretty}`}
                role="img"
                className="block h-full w-full"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            ) : (
              <QrCode className="h-20 w-20 text-black/30" />
            )}
          </div>

          {/* Texto */}
          <div className="text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.18em] text-[#ff2c03]">
              <QrCode className="h-4 w-4" />
              Acesse pelo celular
            </span>
            <h2
              className="mt-3 text-3xl font-black uppercase leading-[0.95] tracking-tight text-black sm:text-4xl"
              style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
            >
              Aponte a câmera e assine
            </h2>
            <p className="mt-3 font-semibold text-black/55">
              Escaneie o QR Code para abrir a Agenda Somma Club e adicionar ao seu
              calendário em segundos. Perfeito para compartilhar nos encontros e nas redes.
            </p>
            <p className="mt-4 inline-block rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-black/70 ring-1 ring-neutral-200">
              {pretty}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
