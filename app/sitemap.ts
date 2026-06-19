import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/constants'
import { listIndexablePublicEvents, eventPath } from '@/lib/calendar-data'

// Regenera o sitemap periodicamente conforme novos eventos são publicados.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/agenda`, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/agenda/corridas`, changeFrequency: 'daily', priority: 0.9 },
  ]

  let eventRoutes: MetadataRoute.Sitemap = []
  try {
    const events = await listIndexablePublicEvents(500)
    eventRoutes = events.map((e) => ({
      url: `${base}${eventPath(e)}`,
      lastModified: e.updated_at ? new Date(e.updated_at) : undefined,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))
  } catch {
    /* sem banco: publica só as rotas estáticas */
  }

  return [...staticRoutes, ...eventRoutes]
}
