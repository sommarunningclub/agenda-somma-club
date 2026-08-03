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
          <span className="agenda-eyebrow">O que você recebe</span>
          <h2
            className="agenda-title mt-3 text-4xl leading-[0.95] sm:text-5xl"
            style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
          >
            Tudo que rola na comunidade
          </h2>
          <p className="agenda-body mt-3 max-w-xl text-sm sm:text-base">
            Assine a agenda do Somma Club e fique por dentro de cada treino, corrida e
            encontro da maior comunidade de corrida de Brasília. Sem depender de print no
            grupo, sem perder nenhuma data.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b) => (
            <div key={b.title} className="agenda-card">
              <div className="agenda-icon h-11 w-11">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="agenda-title mt-4 text-lg">{b.title}</h3>
              <p className="agenda-body mt-1.5 text-sm">{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
