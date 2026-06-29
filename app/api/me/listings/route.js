import { dbConnect } from '@/lib/db'
import Property from '@/lib/models/Property'
import { handler, ok, requireUser } from '@/lib/api'

// GET /api/me/listings — the current user's own listings (all statuses).
export const GET = handler(async () => {
  const session = await requireUser()
  await dbConnect()

  const docs = await Property.find({ ownerId: session.uid }).sort({ createdAt: -1 }).lean()

  const items = docs.map((p) => ({
    id: String(p._id),
    slug: p.slug,
    title: p.title,
    category: p.category,
    locality: p.location?.locality || '',
    priceLabel: p.priceLabel || null,
    img: p.gallery?.main || '',
    status: p.status,
    verified: !!p.verified,
    featured: !!p.featured,
    premium: !!p.premium,
    views: p.views || 0,
    rejectionReason: p.rejectionReason || null,
    createdAt: p.createdAt,
  }))

  return ok({ items })
})
