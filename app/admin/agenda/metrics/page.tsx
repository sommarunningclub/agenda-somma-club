import { Apple, Info, Mail, MousePointerClick, Rss, Smartphone, Users } from 'lucide-react'
import { getServiceClient } from '@/lib/supabase'
import { deviceFromUa } from '@/lib/ua'
import { PLATFORM_LABELS } from '@/lib/constants'
import { ConfigWarning } from '@/components/admin/config-warning'
import { MetricsFilters } from '@/components/admin/metrics-filters'
import { formatEventDateTime } from '@/lib/format'

export const dynamic = 'force-dynamic'

const mono = { fontFamily: 'var(--font-jetbrains), ui-monospace, monospace' }

type Click = Record<string, unknown> & {
  platform?: string | null
  calendar_slug?: string | null
  utm_source?: string | null
  user_agent?: string | null
  ip_hash?: string | null
  os?: string | null
  device?: string | null
  country?: string | null
  city?: string | null
  referrer?: string | null
  created_at: string
}

function countBy(items: Click[], pick: (c: Click) => string | null | undefined) {
  const map = new Map<string, number>()
  for (const it of items) {
    const k = (pick(it) || '—').toString()
    map.set(k, (map.get(k) || 0) + 1)
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
}

export default async function MetricsPage({
  searchParams,
}: {
  searchParams: Promise<{
    range?: string
    platform?: string
    device?: string
    region?: string
    source?: string
  }>
}) {
  const sp = await searchParams
  let allClicks: Click[] = []
  let leadsCount = 0
  let feedHits: Click[] | null = []
  try {
    const db = getServiceClient()
    const [{ data }, { count }, fh] = await Promise.all([
      db
        .from('calendar_clicks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5000),
      db.from('calendar_leads').select('*', { count: 'exact', head: true }),
      db
        .from('calendar_feed_hits')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20000),
    ])
    allClicks = (data as Click[]) ?? []
    leadsCount = count ?? 0
    feedHits = fh.error ? null : ((fh.data as Click[]) ?? [])
  } catch {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Métricas</h1>
        <ConfigWarning />
      </div>
    )
  }

  // Opções de filtro (da base completa, para não sumirem ao filtrar)
  const platformOptions = [
    ...new Set(allClicks.map((c) => c.platform).filter(Boolean)),
  ] as string[]
  const deviceOptions = [
    ...new Set(allClicks.map((c) => c.device || deviceFromUa(c.user_agent).device)),
  ] as string[]
  const regionOptions = [
    ...new Set(allClicks.map((c) => c.country).filter(Boolean)),
  ] as string[]
  const sourceOptions = [
    ...new Set(allClicks.map((c) => c.utm_source).filter(Boolean)),
  ] as string[]

  // Aplica filtros
  const days = sp.range === '7d' ? 7 : sp.range === '30d' ? 30 : sp.range === '90d' ? 90 : 0
  const cutoff = days ? Date.now() - days * 86400000 : 0
  const inRange = (isoStr: string) => cutoff === 0 || new Date(isoStr).getTime() >= cutoff

  const clicks = allClicks.filter(
    (c) =>
      inRange(c.created_at) &&
      (!sp.platform || c.platform === sp.platform) &&
      (!sp.device || (c.device || deviceFromUa(c.user_agent).device) === sp.device) &&
      (!sp.region || c.country === sp.region) &&
      (!sp.source || c.utm_source === sp.source),
  )
  const fh = (feedHits ?? []).filter((x) => inRange(x.created_at))

  const total = clicks.length
  const people = new Set(clicks.map((c) => c.ip_hash).filter(Boolean)).size
  const hasGeo = clicks.some((c) => c.country)

  const byPlatform = countBy(clicks, (c) =>
    PLATFORM_LABELS[(c.platform as keyof typeof PLATFORM_LABELS) ?? 'other']
      ? PLATFORM_LABELS[c.platform as keyof typeof PLATFORM_LABELS]
      : c.platform === 'cta_bar'
        ? 'Barra CTA'
        : c.platform || '—',
  )
  const byOs = countBy(clicks, (c) => c.os || deviceFromUa(c.user_agent).os)
  const byDevice = countBy(clicks, (c) => c.device || deviceFromUa(c.user_agent).device)
  const bySource = countBy(clicks, (c) => c.utm_source || 'Direto / sem UTM')
  const byCalendar = countBy(clicks, (c) => c.calendar_slug)
  const byCountry = countBy(clicks, (c) => c.country)
  const byCity = countBy(clicks, (c) => c.city)
  const topPlatform = byPlatform[0]?.label ?? '—'

  // ---- Dispositivos / Assinaturas (buscas do feed, já filtradas por período) ----
  const d7 = Date.now() - 7 * 86400000
  const apple = fh.filter((x) => x.client === 'apple')
  const appleDevices = new Set(apple.map((x) => x.ip_hash).filter(Boolean)).size
  const appleActive7 = new Set(
    apple
      .filter((x) => new Date(x.created_at).getTime() >= d7)
      .map((x) => x.ip_hash)
      .filter(Boolean),
  ).size
  const googleActive = fh.some(
    (x) => x.client === 'google' && new Date(x.created_at).getTime() >= d7,
  )
  const totalHits = fh.length
  const feedByClient = countBy(fh, (x) =>
    x.client === 'apple'
      ? 'Apple (iPhone/Mac)'
      : x.client === 'google'
        ? 'Google'
        : x.client === 'microsoft'
          ? 'Outlook/Microsoft'
          : 'Outro',
  )
  const feedByCalendar = countBy(fh, (x) => x.calendar_slug)
  const appleByCountry = countBy(apple, (x) => x.country)
  const appleByCity = countBy(apple, (x) => x.city)

  const deviceStats = [
    { label: 'Dispositivos Apple', value: appleDevices, icon: Apple },
    { label: 'Apple ativos (7d)', value: appleActive7, icon: Smartphone },
    {
      label: 'Google sincronizando',
      value: googleActive ? 'Sim' : 'Não',
      icon: Rss,
      text: true,
    },
    { label: 'Buscas no feed', value: totalHits, icon: Rss },
  ]

  const stats = [
    { label: 'Cliques p/ adicionar', value: total, icon: MousePointerClick },
    { label: 'Pessoas (únicas)', value: people, icon: Users },
    { label: 'Leads captados', value: leadsCount, icon: Mail },
    { label: 'Plataforma top', value: topPlatform, icon: Smartphone, text: true },
  ]

  return (
    <div className="space-y-8">
      <div>
        <span
          className="text-[11px] font-medium uppercase tracking-wider text-[#9ca3af]"
          style={mono}
        >
          Tracking
        </span>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Métricas</h1>
      </div>

      <MetricsFilters
        platforms={platformOptions}
        devices={deviceOptions}
        regions={regionOptions}
        sources={sourceOptions}
      />
      <p className="-mt-4 text-xs text-[#9ca3af]" style={mono}>
        Os filtros de plataforma, dispositivo, região e origem afetam os cliques. O período
        afeta tudo.
      </p>

      {/* ASSINATURAS / DISPOSITIVOS */}
      {feedHits === null ? (
        <div className="flex items-start gap-3 rounded-2xl border border-[#2563eb]/20 bg-[#2563eb]/[0.05] p-4 text-sm text-[#1e40af]">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Para medir <strong>quantos dispositivos adicionaram</strong> a agenda, rode a
            migration{' '}
            <code className="rounded bg-[#2563eb]/10 px-1 font-mono">
              supabase/migrations/2026_feed_hits.sql
            </code>{' '}
            no Supabase. Depois disso, cada busca de calendário é registrada aqui.
          </span>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <span
              className="text-[11px] font-medium uppercase tracking-wider text-[#9ca3af]"
              style={mono}
            >
              Assinaturas
            </span>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">
              Dispositivos com a agenda
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-[#6b7280]">
              Medido pelas buscas do feed. <strong>Apple conta por dispositivo</strong>;
              Google e Outlook buscam de forma centralizada (dá pra saber que estão ativos,
              não o número exato de pessoas).
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {deviceStats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-[#e6e8ec] bg-white p-5"
              >
                <s.icon className="h-5 w-5 text-[#9ca3af]" />
                <p
                  className={`mt-3 font-semibold tracking-tight ${
                    s.text ? 'text-xl' : 'text-3xl tabular-nums'
                  }`}
                >
                  {s.value}
                </p>
                <p
                  className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-[#6b7280]"
                  style={mono}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {totalHits > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <BarList title="Por app de calendário" items={feedByClient} />
              <BarList title="Por agenda" items={feedByCalendar} />
              {apple.length ? (
                <BarList title="Dispositivos Apple por país" items={appleByCountry} />
              ) : null}
              {apple.length ? (
                <BarList title="Dispositivos Apple por cidade" items={appleByCity} />
              ) : null}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-[#d6dae0] bg-white p-8 text-center text-sm text-[#6b7280]">
              Ainda sem buscas registradas. Os apps de calendário sincronizam no próprio
              ritmo (de minutos a horas) — os números aparecem conforme isso acontece.
            </p>
          )}
        </div>
      )}

      <div>
        <span
          className="text-[11px] font-medium uppercase tracking-wider text-[#9ca3af]"
          style={mono}
        >
          Engajamento
        </span>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">
          Cliques para adicionar
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-[#e6e8ec] bg-white p-5">
            <s.icon className="h-5 w-5 text-[#9ca3af]" />
            <p
              className={`mt-3 font-semibold tracking-tight ${
                s.text ? 'truncate text-xl' : 'text-3xl tabular-nums'
              }`}
            >
              {s.value}
            </p>
            <p
              className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-[#6b7280]"
              style={mono}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {total === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d6dae0] bg-white p-12 text-center text-sm text-[#6b7280]">
          Ainda não há cliques registrados. Os dados aparecem aqui conforme as pessoas
          clicam em “adicionar agenda”.
        </div>
      ) : (
        <>
          {!hasGeo ? (
            <div className="flex items-start gap-3 rounded-2xl border border-[#2563eb]/20 bg-[#2563eb]/[0.05] p-4 text-sm text-[#1e40af]">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Para capturar <strong>região (país/cidade)</strong>, <strong>referrer</strong>{' '}
                e UTMs completas, rode a migration{' '}
                <code className="rounded bg-[#2563eb]/10 px-1 font-mono">
                  supabase/migrations/2026_tracking_enrich.sql
                </code>{' '}
                no Supabase. Plataforma, dispositivo e origem já funcionam.
              </span>
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <BarList title="Plataforma escolhida" items={byPlatform} />
            <BarList title="Dispositivo" items={byDevice} />
            <BarList title="Sistema operacional" items={byOs} />
            <BarList title="Origem (UTM source)" items={bySource} />
            <BarList title="Calendário" items={byCalendar} />
            {hasGeo ? <BarList title="País" items={byCountry} /> : null}
            {hasGeo ? <BarList title="Cidade" items={byCity} /> : null}
          </div>

          {/* Atividade recente */}
          <div className="rounded-2xl border border-[#e6e8ec] bg-white">
            <div className="border-b border-[#e6e8ec] px-5 py-4">
              <h2 className="text-sm font-semibold">Cliques recentes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr
                    className="border-b border-[#e6e8ec] text-left text-[11px] uppercase tracking-wider text-[#9ca3af]"
                    style={mono}
                  >
                    <th className="px-5 py-3 font-medium">Quando</th>
                    <th className="px-5 py-3 font-medium">Plataforma</th>
                    <th className="px-5 py-3 font-medium">Dispositivo</th>
                    <th className="px-5 py-3 font-medium">Região</th>
                    <th className="px-5 py-3 font-medium">Origem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef0f3]">
                  {clicks.slice(0, 15).map((c, i) => {
                    const d = deviceFromUa(c.user_agent)
                    return (
                      <tr key={i} className="hover:bg-[#f8f9fb]">
                        <td className="whitespace-nowrap px-5 py-3 text-[#6b7280]" style={mono}>
                          {formatEventDateTime(c.created_at)}
                        </td>
                        <td className="px-5 py-3 text-[#1f2937]">
                          {c.platform === 'cta_bar'
                            ? 'Barra CTA'
                            : PLATFORM_LABELS[c.platform as keyof typeof PLATFORM_LABELS] ||
                              c.platform ||
                              '—'}
                        </td>
                        <td className="px-5 py-3 text-[#6b7280]">
                          {(c.device || d.device)} · {(c.os || d.os)}
                        </td>
                        <td className="px-5 py-3 text-[#6b7280]">
                          {c.city || c.country ? `${c.city ?? ''} ${c.country ?? ''}`.trim() : '—'}
                        </td>
                        <td className="px-5 py-3 text-[#6b7280]">
                          {c.utm_source || 'Direto'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function BarList({
  title,
  items,
}: {
  title: string
  items: { label: string; value: number }[]
}) {
  const max = Math.max(1, ...items.map((i) => i.value))
  return (
    <div className="rounded-2xl border border-[#e6e8ec] bg-white p-5">
      <h3
        className="mb-4 text-[11px] font-medium uppercase tracking-wider text-[#9ca3af]"
        style={mono}
      >
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-[#9ca3af]">—</p>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 8).map((i) => (
            <div key={i.label}>
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-[#4b5563]">{i.label}</span>
                <span className="shrink-0 font-semibold tabular-nums text-[#1f2937]">
                  {i.value}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#f3f4f7]">
                <div
                  className="h-full rounded-full bg-[#ff2c03]"
                  style={{ width: `${(i.value / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
