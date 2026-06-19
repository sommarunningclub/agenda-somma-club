/* eslint-disable @next/next/no-img-element */
const SITE = 'https://sommaclub.com.br'
const WA = 'https://wa.me/5561995372477'

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black px-5 py-14 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Logo + descrição + social */}
          <div className="space-y-4">
            <img src="/somma-logo.svg" alt="Somma Club" className="h-8 w-auto" />
            <p className="max-w-xs text-sm text-white/55">
              O maior running club do Distrito Federal. Comunidade gratuita e democrática,
              com mais de 5 mil membros. Encontros todo sábado às 7h no Parque da Cidade,
              em Brasília.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/somma.club/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram do Somma Club"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-[#ff2c03] hover:text-[#ff6a52]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://www.strava.com/clubs/1608501"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Strava do Somma Club"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-[#ff2c03] hover:text-[#ff6a52]"
              >
                <svg width="18" height="18" viewBox="0 0 512 512" fill="currentColor" aria-hidden>
                  <polygon points="226.172,26.001 90.149,288.345 170.29,288.345 226.172,184.036 281.605,288.345 361.116,288.345" />
                  <polygon points="361.116,288.345 321.675,367.586 281.605,288.345 220.871,288.345 321.675,485.999 421.851,288.345" />
                </svg>
              </a>
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Contato</h3>
            <ul className="space-y-3 text-sm text-white/55">
              <li>
                <a href="mailto:contato@sommaclub.com.br" className="transition-colors hover:text-white">
                  contato@sommaclub.com.br
                </a>
              </li>
              <li>
                <a href={`${WA}?text=Ol%C3%A1%2C%20vim%20da%20Agenda%20Somma`} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
                  +55 (61) 99537-2477
                </a>
              </li>
              <li className="text-white/45">
                Plano Piloto, Brasília - DF · 70655-775
              </li>
            </ul>
          </div>

          {/* Mais do Somma */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Mais do Somma</h3>
            <ul className="space-y-2 text-sm text-white/55">
              <li><a href={`${SITE}/seja-parceiro`} className="transition-colors hover:text-white">Seja um Parceiro Somma Club</a></li>
              <li><a href={`${SITE}/evolve`} className="transition-colors hover:text-white">Somma &amp; Evolve</a></li>
              <li><a href={`${SITE}`} className="transition-colors hover:text-white">Site do Somma Club</a></li>
            </ul>
          </div>

          {/* Corporativo */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Corporativo</h3>
            <ul className="space-y-2 text-sm text-white/55">
              <li><a href={`${WA}?text=Quero%20saber%20sobre%20Somma%20Eventos`} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">Somma Eventos</a></li>
              <li><a href={`${WA}?text=Quero%20saber%20sobre%20Somma%20M%C3%ADdia`} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">Somma Mídia</a></li>
              <li><a href={`${WA}?text=Quero%20saber%20sobre%20a%20Assessoria%20Somma`} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">Assessoria Somma Club</a></li>
              <li><a href={`${SITE}/parceiro-somma-club`} className="transition-colors hover:text-white">Acesso Exclusivo Parceiro</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-1 border-t border-white/10 pt-8 text-xs text-white/40">
          <span>© {new Date().getFullYear()} Somma Running Club. Todos os direitos reservados.</span>
          <span>CNPJ 61.315.987/0001-28 · Agenda Somma Club</span>
        </div>
      </div>
    </footer>
  )
}
