'use client'

import { useRef, useState } from 'react'
import { Play, Instagram } from 'lucide-react'

export function VideoSection({
  videoSrc,
  poster = '/SMEWNGS-1336.jpg',
}: {
  videoSrc?: string
  poster?: string
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  function play() {
    const v = ref.current
    if (!v) return
    void v.play()
    setPlaying(true)
  }

  return (
    <section className="px-5 py-14 sm:px-8 md:py-20">
      <div data-anim="reveal" className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <span className="agenda-eyebrow">Somma em movimento</span>
          <h2
            className="agenda-title mt-3 text-4xl leading-[0.95] sm:text-5xl"
            style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
          >
            A vibe de correr junto
          </h2>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-somma-orange-muted/80 bg-somma-orange-soft/30 shadow-sm shadow-somma-orange/[0.06]">
          {videoSrc ? (
            <>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                ref={ref}
                src={videoSrc}
                poster={poster}
                playsInline
                controls={playing}
                className="aspect-video w-full object-cover"
              />
              {!playing ? (
                <button
                  type="button"
                  onClick={play}
                  aria-label="Reproduzir vídeo"
                  data-anim="press"
                  className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/20"
                >
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#ff2c03] text-white shadow-2xl">
                    <Play className="ml-1 h-8 w-8" />
                  </span>
                </button>
              ) : null}
            </>
          ) : (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={poster}
                alt="Comunidade do Somma Club correndo junta"
                className="aspect-video w-full object-cover opacity-90"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-somma-ink/25 p-6 text-center backdrop-blur-[2px]">
                <p className="max-w-md text-lg font-bold text-white">
                  Acompanhe os bastidores e a galera correndo junto no nosso Instagram.
                </p>
                <a
                  href="https://www.instagram.com/somma.club/"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-anim="press"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-base font-bold text-somma-orange transition-transform hover:scale-[1.03] active:scale-95"
                >
                  <Instagram className="h-5 w-5" />
                  Ver no Instagram
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
