import { HeartHandshake, MapPin, CalendarClock, Sparkles } from 'lucide-react'

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
    text: 'Os encontros principais do Somma Club são gratuitos e abertos ao público. Sem mensalidade para correr com a gente — é só aparecer e fazer parte.',
  },
]

export function AboutSection() {
  return (
    <section id="sobre" className="scroll-mt-24 px-5 py-14 sm:px-8 md:py-20">
      <div data-anim="reveal" className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-3xl">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-[#ff2c03]">
            O que é o Somma Club
          </span>
          <h2
            className="mt-3 text-4xl font-black uppercase leading-[0.95] tracking-tight text-black sm:text-5xl"
            style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
          >
            O maior running club de Brasília
          </h2>
          <p className="mt-4 text-base font-semibold text-black/60 sm:text-lg">
            O Somma Club é uma comunidade de corrida em Brasília, aberta a todos. Mais que
            um grupo de corrida, é um movimento que conecta pessoas através do esporte — de
            quem está dando os primeiros passos a quem treina para a próxima prova. A gente
            corre junto, se apoia e celebra cada conquista. E o melhor: participar é de
            graça.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className="rounded-[1.75rem] border border-neutral-200 bg-[#F8F9FA] p-7 transition-colors hover:border-[#ff2c03]/40"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-[#ff6a52]">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-black uppercase leading-tight text-black">
                {p.title}
              </h3>
              <p className="mt-1.5 text-sm font-semibold text-black/55">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
