import { HeartHandshake, MapPin, CalendarClock, Sparkles } from 'lucide-react'
import { runningRoutePath } from '@/lib/route-path'

const PILLARS = [
  {
    icon: HeartHandshake,
    title: 'Para todo mundo',
    text: 'Iniciante ou experiente, rápido ou no seu ritmo. Você não precisa ser atleta, não precisa já correr bem e não precisa fazer parte da assessoria. É só chegar.',
  },
  {
    icon: MapPin,
    title: 'Onde a gente corre',
    text: 'No Parque da Cidade Sarah Kubitschek, em Brasília. O ponto de encontro da maior comunidade de corrida do Distrito Federal.',
  },
  {
    icon: CalendarClock,
    title: 'Quando acontece',
    text: 'Encontros toda semana, com o treinão de sábado às 7h. Treinos, corridas pela cidade e eventos especiais entram na agenda o ano inteiro.',
  },
  {
    icon: Sparkles,
    title: 'Aberto e gratuito',
    text: 'Os encontros principais do Somma Club são gratuitos e abertos a todo mundo. Sem mensalidade pra correr com a gente. É só aparecer e fazer parte.',
  },
]

const ROUTE = runningRoutePath({ width: 1000, height: 320, points: 8, seed: 21 })

export function ManifestoSection() {
  return (
    <section id="sobre" className="relative scroll-mt-24 overflow-hidden px-5 py-16 sm:px-8 md:py-24">
      <svg
        viewBox="0 0 1000 320"
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-0 h-auto w-full -translate-y-1/2 opacity-[0.18]"
        fill="none"
        aria-hidden
      >
        <path
          data-anim="route"
          d={ROUTE}
          stroke="#ff5a3d"
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="relative mx-auto max-w-6xl">
        <div data-anim="reveal" className="mx-auto max-w-3xl text-center">
          <span className="agenda-eyebrow">O que é o Somma Club</span>
          <h2
            className="agenda-title mt-4 text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.9]"
            style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
          >
            Correr junto
            <br />
            muda tudo
          </h2>
          <p className="agenda-body mx-auto mt-5 max-w-2xl text-base sm:text-lg">
            O Somma Club é uma comunidade de corrida em Brasília, aberta a todo mundo. Mais
            que um grupo de corrida, é um movimento que une gente pelo esporte: do primeiro
            treino de quem tá começando agora ao último tiro de quem treina pra próxima
            prova. A gente corre junto, se apoia e comemora cada conquista. E o melhor:
            participar é de graça.
          </p>
        </div>

        <div
          data-anim="reveal-stagger"
          className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {PILLARS.map((p) => (
            <div key={p.title} className="agenda-card">
              <div className="agenda-icon h-11 w-11">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="agenda-title mt-4 text-lg leading-tight">{p.title}</h3>
              <p className="agenda-body mt-1.5 text-sm">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
