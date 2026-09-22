import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3001'
  const staticPaths = ['', '/tipp', '/finn', '/leaderboard', '/vm-info', '/personvern']

  return staticPaths.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }))
}
