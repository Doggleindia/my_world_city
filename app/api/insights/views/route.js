import { handler, ok } from '@/lib/api'
import { getArticleViews } from '@/lib/articleViews'

// GET /api/insights/views -> { views: { slug: number } }
// Public and cheap; the cards on the home page read it after they mount.
export const GET = handler(async () => ok({ views: await getArticleViews() }))
