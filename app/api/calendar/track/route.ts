import { createHash } from 'crypto'
import { NextResponse } from 'next/server'
import { clickSchema } from '@/lib/validations'
import { getReadClient, isSupabaseConfigured } from '@/lib/supabase'
import { deviceFromUa } from '@/lib/ua'

export const dynamic = 'force-dynamic'

/** Hash do IP com sal — nunca armazenamos o IP em aberto. */
function hashIp(ip: string | null): string | null {
  if (!ip) return null
  const salt = process.env.AGENDA_SESSION_SECRET || 'somma-agenda'
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32)
}

function decode(value: string | null): string | null {
  if (!value) return null
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/** Registra um clique nos botões de assinatura. Nunca quebra a UX. */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido.' }, { status: 400 })
  }

  const parsed = clickSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Dados inválidos.' }, { status: 422 })
  }

  // Modo demo: sem Supabase real, não registramos (a assinatura continua funcionando).
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, stored: false, demo: true })
  }

  try {
    const h = request.headers
    const ip =
      h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || null
    const ua = h.get('user-agent')?.slice(0, 400) || null
    const { os, device } = deviceFromUa(ua)

    // Colunas básicas (sempre existem)
    const base = {
      calendar_slug: parsed.data.calendar_slug,
      platform: parsed.data.platform,
      utm_source: parsed.data.utm_source ?? null,
      utm_medium: parsed.data.utm_medium ?? null,
      utm_campaign: parsed.data.utm_campaign ?? null,
      user_agent: ua,
      ip_hash: hashIp(ip),
    }

    // Colunas enriquecidas (após rodar a migration de tracking)
    const enriched = {
      ...base,
      utm_content: parsed.data.utm_content ?? null,
      utm_term: parsed.data.utm_term ?? null,
      referrer: parsed.data.referrer ?? null,
      country: h.get('x-vercel-ip-country') ?? null,
      region: h.get('x-vercel-ip-country-region') ?? null,
      city: decode(h.get('x-vercel-ip-city')),
      device,
      os,
    }

    const supabase = getReadClient()
    const { error } = await supabase.from('calendar_clicks').insert(enriched)
    if (error) {
      // Colunas enriquecidas ainda não existem → grava o básico (não perde o clique).
      await supabase.from('calendar_clicks').insert(base)
    }
  } catch (error) {
    console.error('[track] falha ao registrar clique:', error)
    return NextResponse.json({ ok: true, stored: false })
  }

  return NextResponse.json({ ok: true, stored: true })
}
