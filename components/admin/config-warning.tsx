import { AlertTriangle } from 'lucide-react'

export function ConfigWarning() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[#d97706]/25 bg-[#d97706]/[0.06] p-5 text-[#92400e]">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#d97706]" />
      <div className="text-sm">
        <p className="font-semibold">Supabase ainda não está configurado.</p>
        <p className="mt-1 text-[#a16207]">
          Defina{' '}
          <code className="rounded bg-[#d97706]/10 px-1 font-mono">SUPABASE_URL</code> e{' '}
          <code className="rounded bg-[#d97706]/10 px-1 font-mono">
            SUPABASE_SERVICE_ROLE_KEY
          </code>{' '}
          e rode as migrations (veja o README). Sem isso, o admin e o feed .ics ficam
          vazios.
        </p>
      </div>
    </div>
  )
}
