/**
 * Gera um path SVG de "rota de corrida" (polilinha suavizada, estilo traçado de GPS).
 * Determinístico por seed — seguro para render no servidor e no cliente.
 */
export function runningRoutePath(opts?: {
  width?: number
  height?: number
  points?: number
  seed?: number
}): string {
  const width = opts?.width ?? 1000
  const height = opts?.height ?? 400
  const points = Math.max(2, opts?.points ?? 7)
  let seed = (opts?.seed ?? 1) >>> 0

  // LCG determinístico (sem Math.random, para render estável)
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }

  const step = width / (points - 1)
  const pts = Array.from({ length: points }, (_, i) => ({
    x: i * step,
    y: height * (0.2 + 0.6 * rand()),
  }))

  let d = `M ${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i]
    const p1 = pts[i + 1]
    const cx = ((p0.x + p1.x) / 2).toFixed(2)
    d += ` C ${cx},${p0.y.toFixed(2)} ${cx},${p1.y.toFixed(2)} ${p1.x.toFixed(2)},${p1.y.toFixed(2)}`
  }
  return d
}
