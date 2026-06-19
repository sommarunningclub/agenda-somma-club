import { NextResponse, type NextRequest } from 'next/server'
import { ADMIN_COOKIE } from '@/lib/auth-constants'

/**
 * Redirecionamento rápido (UX) para o login quando não há cookie de sessão.
 * A verificação CRIPTOGRÁFICA real acontece no layout do admin e nas server
 * actions (lib/auth). Aqui só checamos presença para não rodar crypto no edge.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname === '/admin/login') return NextResponse.next()

  const hasCookie = request.cookies.has(ADMIN_COOKIE)
  if (!hasCookie) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/agenda/:path*'],
}
