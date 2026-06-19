// Cria/atualiza o "Somma Special Day" (1 ano do Somma Club c/ Track&Field) em 18/07/2026.
// Uso: node --env-file=.env.local scripts/seed-special-day.mjs
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const db = createClient(url, key, { auth: { persistSession: false } })

const iso = (d, h, m) => new Date(`${d}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00-03:00`).toISOString()
const DATE = '2026-07-18'

const fields = {
  title: 'Somma Club | Somma Special Day — 1 ano',
  summary: '1 ano do Somma Club, em parceria com a Track&Field.',
  description:
    'Somma Special Day — comemoração de 1 ano do Somma Club, em parceria com a Track&Field. Uma edição especial com muita corrida, ativações e celebração da maior comunidade de corrida do DF.',
  location_name: 'Parque da Cidade Sarah Kubitschek',
  location_address: 'Estacionamento 10, Brasília - DF',
  start_datetime: iso(DATE, 7, 0),
  end_datetime: iso(DATE, 12, 0),
  timezone: 'America/Sao_Paulo',
  partner_name: 'Track&Field',
  status: 'published',
  visibility: 'public',
  reminder_24h: true,
  reminder_2h: true,
  reminder_30m: true,
  updated_by: 'seed',
}

async function main() {
  const { data: cal } = await db.from('calendars').select('id').eq('slug', 'somma').single()
  const { data: cats } = await db.from('event_categories').select('id, slug')
  const categoryId = cats.find((c) => c.slug === 'evento-especial')?.id ?? null

  // procura evento somma no dia 18/07
  const { data: existing } = await db
    .from('calendar_events')
    .select('id, title, start_datetime')
    .eq('calendar_id', cal.id)
    .is('deleted_at', null)
    .gte('start_datetime', iso(DATE, 0, 0))
    .lt('start_datetime', iso('2026-07-19', 0, 0))

  const target =
    (existing ?? []).find((e) => /encontro de sábado/i.test(e.title)) ||
    (existing ?? [])[0]

  if (target) {
    const { error } = await db
      .from('calendar_events')
      .update({ ...fields, category_id: categoryId })
      .eq('id', target.id)
    if (error) throw error
    console.log(`Atualizado evento existente (${target.id}) → Somma Special Day.`)
  } else {
    const { data, error } = await db
      .from('calendar_events')
      .insert({
        ...fields,
        calendar_id: cal.id,
        category_id: categoryId,
        custom_reminders: [],
        published_at: new Date().toISOString(),
        created_by: 'seed',
      })
      .select('id')
      .single()
    if (error) throw error
    console.log(`Criado novo Somma Special Day (${data.id}).`)
  }
}

main().catch((e) => {
  console.error('ERRO:', e.message || e)
  process.exit(1)
})
