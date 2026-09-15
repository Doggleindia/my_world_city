import { dbConnect } from '@/lib/db'
import ArticleStat from '@/lib/models/ArticleStat'

// { slug: views } for every article that has been opened at least once.
// Returns {} when the database is unreachable so the pages still render.
export async function getArticleViews() {
  try {
    await dbConnect()
    const rows = await ArticleStat.find({}).select('slug views').lean()
    return Object.fromEntries(rows.map((r) => [r.slug, r.views || 0]))
  } catch {
    return {}
  }
}

export { formatViews } from '@/lib/formatViews'
