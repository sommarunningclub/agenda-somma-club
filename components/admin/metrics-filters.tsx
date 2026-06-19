'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const selectClass =
  'h-9 rounded-xl border border-[#e6e8ec] bg-white px-3 text-sm text-[#4b5563] outline-none transition-colors focus:border-[#ff2c03] focus:ring-4 focus:ring-[#ff2c03]/10'

const PLATFORM_LABEL: Record<string, string> = {
  apple: 'iPhone / Mac',
  google: 'Google / Android',
  outlook: 'Outlook',
  cta_bar: 'Barra CTA',
  other: 'Outro',
}

export function MetricsFilters({
  platforms,
  devices,
  regions,
  sources,
}: {
  platforms: string[]
  devices: string[]
  regions: string[]
  sources: string[]
}) {
  const router = useRouter()
  const params = useSearchParams()

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    router.push(`/admin/agenda/metrics?${next.toString()}`)
  }

  const hasFilters = ['range', 'platform', 'device', 'region', 'source'].some((k) =>
    params.get(k),
  )

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className={selectClass}
        value={params.get('range') ?? ''}
        onChange={(e) => update('range', e.target.value)}
        aria-label="Período"
      >
        <option value="">Todo o período</option>
        <option value="7d">Últimos 7 dias</option>
        <option value="30d">Últimos 30 dias</option>
        <option value="90d">Últimos 90 dias</option>
      </select>

      <select
        className={selectClass}
        value={params.get('platform') ?? ''}
        onChange={(e) => update('platform', e.target.value)}
        aria-label="Plataforma"
      >
        <option value="">Todas as plataformas</option>
        {platforms.map((p) => (
          <option key={p} value={p}>
            {PLATFORM_LABEL[p] ?? p}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={params.get('device') ?? ''}
        onChange={(e) => update('device', e.target.value)}
        aria-label="Dispositivo"
      >
        <option value="">Todos os dispositivos</option>
        {devices.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={params.get('region') ?? ''}
        onChange={(e) => update('region', e.target.value)}
        aria-label="Região"
      >
        <option value="">Todas as regiões</option>
        {regions.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={params.get('source') ?? ''}
        onChange={(e) => update('source', e.target.value)}
        aria-label="Origem"
      >
        <option value="">Todas as origens</option>
        {sources.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      {hasFilters ? (
        <button
          type="button"
          onClick={() => router.push('/admin/agenda/metrics')}
          className="h-9 rounded-xl px-3 text-sm font-medium text-[#cc2402] transition-colors hover:bg-[#ff2c03]/[0.06]"
        >
          Limpar
        </button>
      ) : null}
    </div>
  )
}
