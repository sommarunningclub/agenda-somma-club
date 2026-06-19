import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE } from './auth-constants'

/**
 * Autenticação do admin via cookie assinado (HMAC SHA-256).
 * Reaproveita o padrão do site Somma (lib/auth/session-token).
 * O "primeiro usuário admin" é apenas a env AGENDA_ADMIN_PASSWORD.
 */

export { ADMIN_COOKIE }
const ADMIN_PURPOSE = 'agenda-admin'
const SESSION_MAX_AGE = 60 * 60 * 12 // 12h

function getAuthSecret(): string {
  const secret =
    process.env.AGENDA_SESSION_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) {
    throw new Error(
      'Configure AGENDA_SESSION_SECRET (ou AUTH_SECRET / SUPABASE_SERVICE_ROLE_KEY) para assinar a sessão do admin.',
    )
  }
  return secret
}

export function getAdminPassword(): string | null {
  return process.env.AGENDA_ADMIN_PASSWORD || null
}

function signPayload(encoded: string): string {
  return createHmac('sha256', getAuthSecret())
    .update(`${ADMIN_PURPOSE}:${encoded}`)
    .digest('base64url')
}

export function createAdminToken(): string {
  const body = { sub: 'admin', exp: Date.now() + SESSION_MAX_AGE * 1000 }
  const encoded = Buffer.from(JSON.stringify(body)).toString('base64url')
  return `${encoded}.${signPayload(encoded)}`
}

export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token) return false
  const [encoded, signature] = token.split('.')
  if (!encoded || !signature) return false

  const expected = signPayload(encoded)
  try {
    const sigBuf = Buffer.from(signature)
    const expBuf = Buffer.from(expected)
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return false
    }
  } catch {
    return false
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString()) as {
      exp?: number
    }
    if (!payload.exp || payload.exp < Date.now()) return false
    return true
  } catch {
    return false
  }
}

/** Comparação em tempo constante (login). */
export function safeCompare(a: string, b: string): boolean {
  try {
    const aBuf = Buffer.from(a)
    const bBuf = Buffer.from(b)
    if (aBuf.length !== bBuf.length) return false
    return timingSafeEqual(aBuf, bBuf)
  } catch {
    return false
  }
}

/** Lê o cookie de sessão e valida (uso em Server Components / Actions). */
export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies()
  return verifyAdminToken(store.get(ADMIN_COOKIE)?.value)
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_MAX_AGE,
}
