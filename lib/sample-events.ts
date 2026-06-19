import type { CalendarEventWithRelations } from './types'

/** Forma mínima usada pelos cards/mockups da landing. */
export interface EventCardData {
  id: string
  slug?: string | null
  title: string
  start_datetime: string
  end_datetime: string
  timezone?: string | null
  location_name?: string | null
  partner_name?: string | null
  category?: { name: string; color: string | null } | null
}

export function toCardData(e: CalendarEventWithRelations): EventCardData {
  return {
    id: e.id,
    slug: e.slug,
    title: e.title,
    start_datetime: e.start_datetime,
    end_datetime: e.end_datetime,
    timezone: e.timezone,
    location_name: e.location_name,
    partner_name: e.partner_name,
    category: e.category ?? null,
  }
}

function at(daysFromNow: number, hour: number, minute = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  // Define horário de parede aproximado em SP (-03): usamos UTC+3 do horário desejado.
  d.setUTCHours(hour + 3, minute, 0, 0)
  return d.toISOString()
}

function daysUntilNextSaturday(): number {
  const today = new Date().getDay() // 0=Dom ... 6=Sáb
  return (6 - today + 7) % 7
}

/** Eventos de exemplo para a landing renderizar bem mesmo sem Supabase. */
export function getSampleEvents(): EventCardData[] {
  const sat = daysUntilNextSaturday()
  return [
    {
      id: 'sample-1',
      title: 'Encontro oficial de sábado',
      start_datetime: at(sat, 7),
      end_datetime: at(sat, 9),
      location_name: 'Parque da Cidade · Est. 10',
      category: { name: 'Encontro oficial', color: '#ff2c03' },
    },
    {
      id: 'sample-2',
      title: 'Treino especial da comunidade',
      start_datetime: at(3, 19),
      end_datetime: at(3, 20),
      location_name: 'Brasília · DF',
      category: { name: 'Treino', color: '#2563eb' },
    },
    {
      id: 'sample-3',
      title: 'Corrida em Brasília',
      start_datetime: at(10, 6, 30),
      end_datetime: at(10, 9, 30),
      location_name: 'Brasília · DF',
      category: { name: 'Corrida em Brasília', color: '#16a34a' },
    },
    {
      id: 'sample-4',
      title: 'Ativação com parceiro',
      start_datetime: at(14, 7),
      end_datetime: at(14, 10),
      location_name: 'Parque da Cidade',
      partner_name: 'Evolve',
      category: { name: 'Ativação de parceiro', color: '#ea580c' },
    },
  ]
}
