import { dbConnect } from '@/lib/db'
import Property from '@/lib/models/Property'
import { handler, ok, requireRole } from '@/lib/api'

// GET /api/admin/properties?status=pending|active|all
export const GET = handler(async (req) => {
  await requireRole('admin')
  await dbConnect()

  const status = new URL(req.url).searchParams.get('status') || 'pending'
  const filter = status === 'all' ? {} : { status }

  const docs = await Property.find(filter).sort({ createdAt: -1 }).limit(200).lean()
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
    createdAt: p.createdAt,
  }))

  return ok({ items })
})
