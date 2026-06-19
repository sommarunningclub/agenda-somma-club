'use client'

/* eslint-disable @next/next/no-img-element */
import { useActionState, useState } from 'react'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
} from 'lucide-react'
import { loginAction, type LoginState } from './actions'

const mono = { fontFamily: 'var(--font-jetbrains), ui-monospace, monospace' }

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  )
  const [show, setShow] = useState(false)

  return (
    <div className="relative min-h-[100dvh] overflow-hidden">
      {/* Imagem de fundo */}
      <img
        src="/SMEWNGS-1336.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Overlay para legibilidade + clima Somma */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/65 to-black/80" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 85% 15%, rgba(255,44,3,0.20) 0%, rgba(255,44,3,0) 60%)',
        }}
        aria-hidden
      />

      {/* Conteúdo */}
      <div
        className="relative grid min-h-[100dvh] lg:grid-cols-2"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Branding sobre a foto */}
        <section className="flex flex-col justify-between px-6 pt-8 sm:px-10 lg:px-14 lg:py-12">
          <div className="flex items-center gap-3">
            <img src="/somma-logo.svg" alt="Somma Club" className="h-7 w-auto sm:h-8" />
            <span className="hidden h-5 w-px bg-white/25 sm:block" aria-hidden />
            <span
              className="hidden rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/80 sm:block"
              style={mono}
            >
              Admin
            </span>
            <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-emerald-400 lg:hidden">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Operacional
            </span>
          </div>

          <div className="hidden max-w-md lg:block">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-emerald-400"
              style={mono}
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Sistema operacional
            </span>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-white">
              Console de operação da agenda
            </h1>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/70">
              Crie, publique e gerencie os eventos da comunidade. As mudanças
              sincronizam sozinhas no calendário de quem assinou.
            </p>
          </div>

          <p
            className="hidden text-xs text-white/45 lg:block"
            style={mono}
          >
            v1.0 · Somma Club · Brasília/DF
          </p>
        </section>

        {/* Card de login */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-sm">
            <div className="animate-fade-up rounded-2xl border border-white/10 bg-white p-7 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)] sm:p-8">
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-[#6b7280]"
                style={mono}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Acesso restrito
              </span>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#1f2937]">
                Entrar no painel
              </h2>
              <p className="mt-1.5 text-sm text-[#6b7280]">
                Informe a senha do administrador para continuar.
              </p>

              <form action={formAction} className="mt-7 space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="text-[11px] font-medium uppercase tracking-wider text-[#6b7280]"
                    style={mono}
                  >
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                    <input
                      id="password"
                      name="password"
                      type={show ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      style={mono}
                      className="h-12 w-full rounded-xl border border-[#e6e8ec] bg-[#f8f9fb] pl-10 pr-11 text-base tracking-wide text-[#1f2937] outline-none transition-colors placeholder:text-[#c3c7cf] focus:border-[#ff2c03] focus:bg-white focus:ring-4 focus:ring-[#ff2c03]/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => !s)}
                      aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
                      className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#9ca3af] transition-colors hover:bg-[#f3f4f7] hover:text-[#6b7280]"
                    >
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {state.error ? (
                  <div className="rounded-xl border border-[#ff2c03]/20 bg-[#ff2c03]/[0.06] px-3.5 py-2.5 text-sm font-medium text-[#cc2402]">
                    {state.error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={pending}
                  className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1f2329] text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#2b3038] active:scale-[0.99] disabled:opacity-60"
                >
                  {pending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Entrar
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <p className="mt-5 text-center text-xs text-white/50" style={mono}>
              Sessão protegida · expira em 12h
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
