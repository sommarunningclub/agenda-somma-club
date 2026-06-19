// Roda as migrations da Agenda Somma Club via pooler do Supabase.
// Uso: node --env-file=.env.local scripts/run-migrations.mjs
import { readFileSync } from 'node:fs'
import pg from 'pg'

const { Client } = pg

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const password = process.env.POSTGRES_PASSWORD
if (!url || !password) {
  console.error('Defina SUPABASE_URL e POSTGRES_PASSWORD no .env.local')
  process.exit(1)
}
const ref = new URL(url).hostname.split('.')[0]
// Informe a região/host exatos do dashboard (Settings → Database → Connection string).
// Ex.: SUPABASE_DB_HOST=aws-0-us-east-1.pooler.supabase.com  ou  SUPABASE_REGION=us-east-1
const host =
  process.env.SUPABASE_DB_HOST ||
  `aws-0-${process.env.SUPABASE_REGION || 'us-east-1'}.pooler.supabase.com`

const client = new Client({
  host,
  port: Number(process.env.SUPABASE_DB_PORT) || 5432, // session mode (DDL)
  user: `postgres.${ref}`,
  password,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
})

const files = [
  'supabase/migrations/create_calendar_tables.sql',
  'supabase/migrations/create_calendar_rls.sql',
  'supabase/seed.sql',
]

try {
  await client.connect()
  console.log(`Conectado ao projeto ${ref} (${region}).`)
  for (const f of files) {
    console.log(`\n→ Executando ${f} ...`)
    await client.query(readFileSync(f, 'utf8'))
    console.log(`✓ ${f}`)
  }

  const { rows: cals } = await client.query(
    `select c.slug, count(e.id) as eventos
       from calendars c
       left join calendar_events e on e.calendar_id = c.id and e.deleted_at is null
      group by c.slug order by c.slug`,
  )
  console.log('\nCalendários:', cals)

  const { rows: evs } = await client.query(
    `select title, status,
            to_char(start_datetime at time zone 'America/Sao_Paulo','YYYY-MM-DD HH24:MI') as inicio
       from calendar_events order by start_datetime`,
  )
  console.log('Eventos:')
  for (const e of evs) console.log(`  • [${e.status}] ${e.inicio}  ${e.title}`)
} catch (err) {
  console.error('ERRO:', err.message)
  process.exit(1)
} finally {
  await client.end()
}
