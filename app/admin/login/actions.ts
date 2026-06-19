'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  ADMIN_COOKIE,
  SESSION_COOKIE_OPTIONS,
  createAdminToken,
  getAdminPassword,
  safeCompare,
} from '@/lib/auth'

export interface LoginState {
  error?: string
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get('password') || '')
  const expected = getAdminPassword()

  if (!expected) {
    return {
      error:
        'AGENDA_ADMIN_PASSWORD não está configurada no servidor. Defina a variável de ambiente.',
    }
  }
  if (!password || !safeCompare(password, expected)) {
    return { error: 'Senha incorreta.' }
  }

  const store = await cookies()
  store.set(ADMIN_COOKIE, createAdminToken(), SESSION_COOKIE_OPTIONS)
  redirect('/admin/agenda')
}

export async function logoutAction(): Promise<void> {
  const store = await cookies()
  store.delete(ADMIN_COOKIE)
  redirect('/admin/login')
}
