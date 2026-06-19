/** Deriva sistema operacional e tipo de dispositivo a partir do user-agent. */
export function deviceFromUa(ua: string | null | undefined): {
  os: string
  device: string
} {
  const u = (ua || '').toLowerCase()
  let os = 'Outro'
  if (/iphone|ipad|ipod/.test(u)) os = 'iOS'
  else if (/android/.test(u)) os = 'Android'
  else if (/macintosh|mac os x/.test(u)) os = 'macOS'
  else if (/windows/.test(u)) os = 'Windows'
  else if (/linux/.test(u)) os = 'Linux'

  let device = 'Desktop'
  if (/ipad|tablet/.test(u)) device = 'Tablet'
  else if (/mobile|iphone|android/.test(u)) device = 'Mobile'

  return { os, device }
}

/**
 * Identifica qual app/serviço está BUSCANDO o feed .ics (assinatura).
 * Apple busca por dispositivo; Google/Microsoft buscam de forma centralizada.
 */
export function feedClientFromUa(ua: string | null | undefined): string {
  const u = (ua || '').toLowerCase()
  if (/google-calendar|google calendar|googlebot|feedfetcher-google/.test(u)) return 'google'
  if (/outlook|microsoft|office|exchange|windows-rss/.test(u)) return 'microsoft'
  if (/ios|iphone|ipad|mac os|macintosh|dataaccessd|calendaraccess|calendaragent|cfnetwork|darwin|webcal/.test(u))
    return 'apple'
  return 'other'
}

