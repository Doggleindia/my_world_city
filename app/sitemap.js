import { dbConnect } from '@/lib/db'
import Property from '@/lib/models/Property'
import Expert from '@/lib/models/Expert'
import { expertList } from '@/data'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default async function sitemap() {
  const staticRoutes = ['', '/find-property', '/develop', '/experts', '/services', '/saved'].map(
    (p) => ({ url: `${BASE}${p}`, changeFrequency: 'weekly', priority: p === '' ? 1 : 0.7 }),
  )

  let expertSlugs = expertList.map((e) => e.slug)
  let propertySlugs = []
  try {
    await dbConnect()
    const [experts, props] = await Promise.all([
      Expert.find().select('slug').lean(),
      Property.find({ status: 'active' }).select('slug').limit(1000).lean(),
    ])
    if (experts.length) expertSlugs = experts.map((e) => e.slug)
    propertySlugs = props.map((p) => p.slug)
  } catch {
    // DB unavailable at build — fall back to static expert slugs only.
  }

  return [
    ...staticRoutes,
    ...expertSlugs.map((s) => ({ url: `${BASE}/experts/${s}`, priority: 0.6 })),
    ...propertySlugs.map((s) => ({ url: `${BASE}/property/${s}`, priority: 0.6 })),
  ]
}
