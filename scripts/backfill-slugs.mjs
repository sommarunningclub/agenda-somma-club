// Gera slugs amigáveis (SEO) para eventos publicados que estão sem slug.
// Não altera slugs já existentes (para não quebrar URLs indexadas). Idempotente.
// Uso: node --env-file=.env.local scripts/backfill-slugs.mjs
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const db = createClient(url, key, { auth: { persistSession: false } })

function slugify(input) {
  return String(input || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

const spDate = (isoStr) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(isoStr))

const { data: events, error } = await db
  .from('calendar_events')
  .select('id, title, slug, start_datetime')
  .is('deleted_at', null)
  .order('start_datetime', { ascending: true })

if (error) {
  console.error('Erro ao buscar eventos:', error.message)
  process.exit(1)
}

const taken = new Set(events.filter((e) => e.slug).map((e) => e.slug))
let updated = 0

for (const e of events) {
  if (e.slug) continue
  const base = slugify(e.title) || 'evento'
  const dated = `${base}-${spDate(e.start_datetime)}`
  let candidate = taken.has(base) ? dated : base
  let n = 2
  while (taken.has(candidate)) candidate = `${dated}-${n++}`
  taken.add(candidate)

  const { error: upErr } = await db
    .from('calendar_events')
    .update({ slug: candidate })
    .eq('id', e.id)
  if (upErr) {
    console.error(`✗ ${e.title}: ${upErr.message}`)
  } else {
    console.log(`✓ ${e.title} → ${candidate}`)
    updated++
  }
}

console.log(`\nConcluído. ${updated} slug(s) gerado(s).`)
