// Cria os encontros de sábado do Somma até nov/2026.
// Último sábado de cada mês = "Somma Day". Idempotente (pula datas já existentes).
// Uso: node --env-file=.env.local scripts/seed-saturdays.mjs
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const db = createClient(url, key, { auth: { persistSession: false } })

const pad = (n) => String(n).padStart(2, '0')
const iso = (dateStr, h, m) => new Date(`${dateStr}T${pad(h)}:${pad(m)}:00-03:00`).toISOString()
const spDate = (isoStr) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(isoStr))

function saturdays(startStr, endStr) {
  const out = []
  // 2026-06-20 é sábado; itera de 7 em 7 dias
  let d = new Date(`${startStr}T12:00:00Z`)
  const end = new Date(`${endStr}T12:00:00Z`)
  while (d <= end) {
    const y = d.getUTCFullYear()
    const m = d.getUTCMonth()
    const day = d.getUTCDate()
    const daysInMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate()
    const isLast = day + 7 > daysInMonth
    out.push({ date: `${y}-${pad(m + 1)}-${pad(day)}`, isLast })
    d = new Date(d.getTime() + 7 * 86400000)
  }
  return out
}

async function main() {
  const { data: cal } = await db
    .from('calendars')
    .select('id')
    .eq('slug', 'somma')
    .single()
  const { data: cats } = await db.from('event_categories').select('id, slug')
  const catBy = (slug) => cats.find((c) => c.slug === slug)?.id ?? null

  // datas de eventos somma já existentes (qualquer status, não deletados)
  const { data: existing } = await db
    .from('calendar_events')
    .select('start_datetime')
    .eq('calendar_id', cal.id)
    .is('deleted_at', null)
  const taken = new Set((existing ?? []).map((e) => spDate(e.start_datetime)))

  const sats = saturdays('2026-06-20', '2026-11-30')
  const rows = []
  for (const s of sats) {
    if (taken.has(s.date)) continue
    rows.push(
      s.isLast
        ? {
            calendar_id: cal.id,
            category_id: catBy('evento-especial'),
            title: 'Somma Club | Somma Day',
            summary: 'Edição especial do último sábado do mês.',
            description:
              'Somma Day — a edição especial do encontro no último sábado do mês. Programação ampliada, ativações e muita corrida com a comunidade.',
            location_name: 'Parque da Cidade Sarah Kubitschek',
            location_address: 'Estacionamento 10, Brasília - DF',
            start_datetime: iso(s.date, 7, 0),
            end_datetime: iso(s.date, 11, 0),
            timezone: 'America/Sao_Paulo',
            status: 'published',
            visibility: 'public',
            reminder_24h: true,
            reminder_2h: true,
            reminder_30m: true,
            custom_reminders: [],
            published_at: new Date().toISOString(),
            created_by: 'seed',
            updated_by: 'seed',
          }
        : {
            calendar_id: cal.id,
            category_id: catBy('encontro-oficial'),
            title: 'Somma Club | Encontro de sábado',
            summary: 'Encontro oficial de sábado no Parque da Cidade.',
            description:
              'Encontro oficial do Somma Club. Chegue com antecedência, faça seu check-in e participe da maior comunidade de corrida do DF.',
            location_name: 'Parque da Cidade Sarah Kubitschek',
            location_address: 'Estacionamento 10, Brasília - DF',
            start_datetime: iso(s.date, 7, 0),
            end_datetime: iso(s.date, 9, 0),
            timezone: 'America/Sao_Paulo',
            status: 'published',
            visibility: 'public',
            reminder_24h: true,
            reminder_2h: true,
            reminder_30m: true,
            custom_reminders: [],
            published_at: new Date().toISOString(),
            created_by: 'seed',
            updated_by: 'seed',
          },
    )
  }

  if (rows.length === 0) {
    console.log('Nada a criar (todas as datas já existem).')
    return
  }
  const { error } = await db.from('calendar_events').insert(rows)
  if (error) throw error
  console.log(`Criados ${rows.length} sábados.`)
  console.log(
    'Somma Day:',
    rows.filter((r) => r.title.includes('Somma Day')).map((r) => spDate(r.start_datetime)),
  )
}

main().catch((e) => {
  console.error('ERRO:', e.message || e)
  process.exit(1)
})
