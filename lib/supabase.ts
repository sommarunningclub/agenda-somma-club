import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Clients Supabase. Espelha o padrão do site Somma:
 * - service client: somente no servidor (bypassa RLS) para gerar ICS e escritas do admin.
 * - browser/anon client: leituras públicas respeitando RLS.
 *
 * NUNCA importe getServiceClient em componentes client. O service role é server-only.
 */

let _service: SupabaseClient | null = null

export function getServiceClient(): SupabaseClient {
  if (_service) return _service
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'Supabase service client indisponível: configure SUPABASE_URL (ou NEXT_PUBLIC_SUPABASE_URL) e SUPABASE_SERVICE_ROLE_KEY.',
    )
  }
  _service = createClient(url, key, { auth: { persistSession: false } })
  return _service
}

export function getAnonClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error(
      'Supabase anon client indisponível: configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    )
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

/** Retorna service se disponível, senão anon (degrada com segurança). */
export function getReadClient(): SupabaseClient {
  try {
    return getServiceClient()
  } catch {
    return getAnonClient()
  }
}

export function hasSupabaseEnv(): boolean {
  return Boolean(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  )
}

/**
 * Diz se o Supabase está realmente configurado (env presente E não são os
 * valores de exemplo do .env.example). Usado para rodar em "modo demo" local
 * sem tentar chamadas de rede que falhariam.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''
  if (!url || !key) return false
  // Placeholders do .env.example
  if (url.includes('xxxxxxxxxxxx')) return false
  if (key.includes('...')) return false
  return true
}
