import { dbConnect } from '@/lib/db'
import ArticleStat from '@/lib/models/ArticleStat'

// Never let a slow or unreachable database hold up a page render — or a build,
// where these pages are prerendered. Counts are decoration: if they can't be
// fetched quickly the page ships without them.
const BUDGET_MS = 3000

// { slug: views } for every article that has been opened at least once.
// Returns {} when the database is slow or unreachable so pages still render.
export async function getArticleViews() {
  try {
    const rows = await Promise.race([
      (async () => {
        await dbConnect()
        return ArticleStat.find({}).select('slug views').lean()
      })(),
      new Promise((resolve) => setTimeout(() => resolve(null), BUDGET_MS)),
    ])
    if (!rows) return {}
    return Object.fromEntries(rows.map((r) => [r.slug, r.views || 0]))
  } catch {
    return {}
  }
}

export { formatViews } from '@/lib/formatViews'
