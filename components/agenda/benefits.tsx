import {
  Bell,
  CalendarHeart,
  Flag,
  MapPinned,
  RefreshCw,
  Users,
} from 'lucide-react'

const BENEFITS = [
  { icon: Users, title: 'O treinão de sábado', text: 'Sábado, 7h em ponto no Parque da Cidade. Sempre no seu calendário, nunca mais esquecido.' },
  { icon: CalendarHeart, title: 'Treinos da comunidade', text: 'Treinos coletivos e especiais, de graça e abertos pra todos os níveis.' },
  { icon: MapPinned, title: 'Corridas em Brasília', text: 'As principais corridas de rua de Brasília e do DF, sempre no seu radar.' },
  { icon: Flag, title: 'Eventos e ativações', text: 'Eventos, provas e ativações com os parceiros do Somma, fresquinhos pra você.' },
  { icon: Bell, title: 'A gente te lembra', text: 'Um aviso antes de cada encontro: 24h, 2h e 30 min antes. Perder a hora, nunca mais.' },
  { icon: RefreshCw, title: 'Tudo sempre atualizado', text: 'Mudou o horário ou o local? Seu calendário se atualiza sozinho, sem esforço.' },
]

export function Benefits() {
  return (
    <section className="px-5 py-14 sm:px-8 md:py-20">
      <div data-anim="reveal" className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-2xl">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-[#ff2c03]">
            O que você recebe
          </span>
          <h2
            className="mt-3 text-4xl font-black uppercase leading-[0.95] tracking-tight text-black sm:text-5xl"
            style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
          >
            Tudo que rola na comunidade
          </h2>
          <p className="mt-3 max-w-xl text-sm font-semibold text-black/55 sm:text-base">
            Assine a agenda do Somma Club e fique por dentro de cada treino, corrida e
            encontro da maior comunidade de corrida de Brasília. Sem depender de print no
            grupo, sem perder nenhuma data.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="rounded-[1.75rem] border border-neutral-200 bg-[#F8F9FA] p-7 transition-colors hover:border-[#ff2c03]/40"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-[#ff6a52]">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-black uppercase text-black">{b.title}</h3>
              <p className="mt-1.5 text-sm font-semibold text-black/55">{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
