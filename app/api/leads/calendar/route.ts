import { NextResponse } from 'next/server'
import { leadSchema } from '@/lib/validations'
import { getReadClient, isSupabaseConfigured } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/** Captura um lead da landing antes da assinatura. */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido.' }, { status: 400 })
  }

  const parsed = leadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' },
      { status: 422 },
    )
  }

  // Honeypot: se o campo "company" veio preenchido, é bot. Respondemos OK e ignoramos.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true })
  }

  // Modo demo: sem Supabase real configurado, não tentamos gravar (evita 500).
  if (!isSupabaseConfigured()) {
    console.warn('[leads] Supabase não configurado — lead não persistido (modo demo).')
    return NextResponse.json({ ok: true, demo: true })
  }

  try {
    const supabase = getReadClient()
    const { error } = await supabase.from('calendar_leads').insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone ?? null,
      platform: parsed.data.platform ?? null,
      calendar_slug: parsed.data.calendar_slug,
      utm_source: parsed.data.utm_source ?? null,
      utm_medium: parsed.data.utm_medium ?? null,
      utm_campaign: parsed.data.utm_campaign ?? null,
      utm_content: parsed.data.utm_content ?? null,
      utm_term: parsed.data.utm_term ?? null,
      lgpd_accepted: parsed.data.lgpd_accepted,
      lgpd_accepted_at: new Date().toISOString(),
    })
    if (error) throw error
  } catch (error) {
    console.error('[leads] falha ao salvar lead:', error)
    return NextResponse.json(
      { ok: false, error: 'Não foi possível registrar agora. Tente novamente.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
