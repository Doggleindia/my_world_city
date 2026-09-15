import { dbConnect } from '@/lib/db'
import ArticleStat from '@/lib/models/ArticleStat'
import { insights } from '@/data'
import { handler, ok, ApiError } from '@/lib/api'
import { rateLimit, clientIp } from '@/lib/rateLimit'

// POST /api/insights/:slug/view
// Counts one read of an article. The page pings this once after it loads, so
// static article pages stay static and only the number lives in the database.
export const POST = handler(async (req, { params }) => {
  const { slug } = await params
  if (!insights.some((p) => p.slug === slug)) throw new ApiError('Not found', 404)

  // One count per visitor per article per hour — stops a stuck refresh (or a
  // script) inflating the number.
  const rl = rateLimit(`article:view:${clientIp(req)}:${slug}`, 1, 60 * 60 * 1000)
  if (!rl.ok) return ok({ counted: false })

  await dbConnect()
  const doc = await ArticleStat.findOneAndUpdate(
    { slug },
    { $inc: { views: 1 }, $setOnInsert: { slug } },
    { upsert: true, new: true },
  ).lean()
  return ok({ counted: true, views: doc.views })
})
