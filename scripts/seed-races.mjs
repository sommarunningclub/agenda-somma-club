// Cria o calendário "Corridas DF", a categoria e as principais corridas do DF.
// Uso: node --env-file=.env.local scripts/seed-races.mjs
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local')
  process.exit(1)
}
const db = createClient(url, key, { auth: { persistSession: false } })

const iso = (d) => new Date(`${d}T00:00:00-03:00`).toISOString()

// title, desc, start, end, status, ctaLabel, ctaUrl, source
const RACES = [
  ['BSB Half Marathon Experience', 'Prova de rua com caminhada, 5 km, 10 km e 21 km. Boa para atletas que querem evoluir para meia maratona.', '2026-07-19', '2026-07-19', 'Inscrições abertas', 'Página da prova', 'https://centraldacorrida.com.br/evento/bsb-half-marathon---experiencie', 'Central da Corrida'],
  ['Desafio das Torres', 'Meia maratona entre pontos icônicos de Brasília, com 10 km e 21 km.', '2026-07-19', '2026-07-19', 'Inscrições abertas', 'Site oficial', 'https://desafiodastorres.com.br/', 'Desafio das Torres'],
  ['Corrida POUPEx 2026', 'Corrida tradicional em Brasília, com 5 km e 10 km, largada na Praça dos Cristais.', '2026-07-25', '2026-07-25', 'Inscrições encerradas no site oficial', 'Site oficial', 'https://corrida.poupex.com.br/', 'Corrida POUPEX'],
  ['ASICS Run Challenge Brasília', 'Etapa Brasília do circuito ASICS, com proposta de evolução de performance nos 4 km, 7 km e 15 km.', '2026-07-26', '2026-07-26', 'Inscrições abertas ou via Ticket Sports', 'Página da prova', 'https://correrbrasilia.com.br/events/asics-run-challenge-etapa-brasilia/', 'Correr Brasília'],
  ['LIVE!42K Brasília', 'Uma das maiores provas do semestre, com 5 km, 10 km, 21 km e 42 km na Esplanada dos Ministérios.', '2026-08-01', '2026-08-02', 'Inscrições abertas', 'Site oficial', 'https://www.liverun.com.br/etapa/live42k-brasilia', 'Live Run'],
  ['Corrida da Polícia Federal', 'Prova institucional com kids, 5 km, 10 km e 21 km, realizada na sede da PF.', '2026-08-09', '2026-08-09', 'Inscrições abertas', 'Página da prova', 'https://centraldacorrida.com.br/evento/corridapf2026', 'Central da Corrida'],
  ['Santander Track&Field Run Series Conjunto Nacional', 'Etapa do circuito Track&Field, com 5 km, 10 km e 15 km. Público forte para lifestyle e running.', '2026-08-16', '2026-08-16', 'Sold out no site da TF Sports', 'Site oficial', 'https://www.tfsports.com.br/run-series/conjunto-nacional-2026/', 'TFSports'],
  ['Quatro Poderes Run 2026', 'Corrida de 6 km no Parque da Cidade, com apelo institucional e percurso urbano.', '2026-08-22', '2026-08-22', 'Em calendário, confirmar inscrição', 'Calendário Correr Brasília', 'https://correrbrasilia.com.br/calendario/', 'Correr Brasília'],
  ['Nutrição Brasil Run 2026', 'Prova de 5 km e 10 km na Praça do Buriti, com tema ligado à saúde e performance.', '2026-08-30', '2026-08-30', 'Em calendário, confirmar inscrição', 'Calendário Correr Brasília', 'https://correrbrasilia.com.br/calendario/', 'Correr Brasília'],
  ['Copa Run 2026', 'Corrida no Parque da Cidade com 5 km, 10 km e 21 km. Boa prova para comunidade e assessoria.', '2026-09-12', '2026-09-12', 'Inscrições abertas até 01/09 ou limite de vagas', 'Página da prova', 'https://correrbrasilia.com.br/events/copa-run-2026/', 'Correr Brasília'],
  ['Night Run Brasília 2026', 'Corrida noturna na Praça do Buriti, com 4 km, 8 km e 12 km.', '2026-10-03', '2026-10-03', 'Em calendário, confirmar inscrição', 'Calendário Correr Brasília', 'https://correrbrasilia.com.br/calendario/', 'Correr Brasília'],
  ['City Cross Marathon 2026', 'Prova híbrida entre asfalto e trilha, com 10 km, 21 km e 42 km, incluindo categoria solo e quarteto.', '2026-10-25', '2026-10-25', 'Página ativa na Ticket Sports', 'Página da prova', 'https://www.ticketsports.com.br/e/city-cross-marathon-2026-74339', 'Ticket Sports'],
  ['Maratona Monumental de Brasília 2026', 'Principal maratona de Brasília, com 5 km, 10 km, 21 km e 42 km na Esplanada dos Ministérios.', '2026-11-21', '2026-11-22', 'Inscrições abertas até 31/10 ou até esgotar', 'Site oficial', 'https://maratonamonumentalbsb.com.br/', 'Maratona Monumental'],
  ['Circuito de Corridas CAIXA, Etapa Brasília', 'Etapa nacional do Circuito CAIXA/Brazil Run Series, com 5 km, 10 km e caminhada.', '2026-12-20', '2026-12-20', 'Confirmada, detalhes finais pelo site oficial', 'Página da etapa', 'https://correrbrasilia.com.br/events/circuito-de-corridas-caixa-etapa-brasilia-2026/', 'Correr Brasília'],
]

async function main() {
  // 1) calendário
  const { data: cal, error: calErr } = await db
    .from('calendars')
    .upsert(
      {
        name: 'Agenda Corridas DF',
        slug: 'corridas-df',
        description: 'Principais corridas de rua do Distrito Federal (eventos externos).',
        ics_path: '/api/calendar/corridas-df.ics',
        is_public: true,
        color: '#16a34a',
      },
      { onConflict: 'slug' },
    )
    .select('id')
    .single()
  if (calErr) throw calErr
  console.log('Calendário corridas-df:', cal.id)

  // 2) categoria
  const { data: cat, error: catErr } = await db
    .from('event_categories')
    .upsert(
      { name: 'Corrida externa', slug: 'corrida-externa', color: '#16a34a' },
      { onConflict: 'slug' },
    )
    .select('id')
    .single()
  if (catErr) throw catErr

  // 3) idempotência: títulos já existentes nesse calendário
  const { data: existing } = await db
    .from('calendar_events')
    .select('title')
    .eq('calendar_id', cal.id)
  const have = new Set((existing ?? []).map((e) => e.title))

  const rows = RACES.filter((r) => !have.has(r[0])).map(
    ([title, desc, start, end, status, ctaLabel, ctaUrl, source]) => ({
      calendar_id: cal.id,
      category_id: cat.id,
      title,
      description: desc,
      summary: status, // exibido como "Status" na landing
      partner_name: source,
      cta_label: ctaLabel,
      cta_url: ctaUrl,
      location_name: 'Brasília · DF',
      start_datetime: iso(start),
      end_datetime: iso(end),
      timezone: 'America/Sao_Paulo',
      is_all_day: true,
      status: 'published',
      visibility: 'public',
      reminder_24h: true,
      reminder_2h: false,
      reminder_30m: false,
      custom_reminders: [],
      published_at: new Date().toISOString(),
      created_by: 'seed',
      updated_by: 'seed',
    }),
  )

  if (rows.length === 0) {
    console.log('Nenhuma corrida nova (todas já existem).')
  } else {
    const { error: insErr } = await db.from('calendar_events').insert(rows)
    if (insErr) throw insErr
    console.log(`Inseridas ${rows.length} corridas.`)
  }

  const { count } = await db
    .from('calendar_events')
    .select('*', { count: 'exact', head: true })
    .eq('calendar_id', cal.id)
  console.log(`Total de corridas no calendário: ${count}`)
}

main().catch((e) => {
  console.error('ERRO:', e.message || e)
  process.exit(1)
})
