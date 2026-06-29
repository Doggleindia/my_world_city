import { dbConnect } from '@/lib/db'
import Property from '@/lib/models/Property'
import { propertyQuerySchema, propertyCreateSchema } from '@/lib/validation'
import { handler, parseQuery, parseBody, ok, requireUser } from '@/lib/api'
import { toPropertyCard } from '@/lib/serialize'

function slugify(s) {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 60) +
    '-' +
    Math.random().toString(36).slice(2, 7)
  )
}

// GET /api/properties?category=&listingType=&locality=&q=&min/maxPrice=&verified=&rera=&featured=&sort=&page=&limit=
export const GET = handler(async (req) => {
  const qp = parseQuery(req, propertyQuerySchema)
  await dbConnect()

  const filter = { status: 'active' }
  if (qp.category && qp.category !== 'All') filter.category = qp.category
  if (qp.listingType) filter.listingType = qp.listingType
  if (qp.locality) filter['location.locality'] = qp.locality
  if (qp.verified) filter.verified = true
  if (qp.rera) filter.rera = true
  if (qp.featured) filter.featured = true
  if (qp.minPrice != null || qp.maxPrice != null) {
    filter.price = {}
    if (qp.minPrice != null) filter.price.$gte = qp.minPrice
    if (qp.maxPrice != null) filter.price.$lte = qp.maxPrice
  }
  if (qp.q) filter.$text = { $search: qp.q }

  const sort =
    qp.sort === 'price_asc'
      ? { price: 1 }
      : qp.sort === 'price_desc'
        ? { price: -1 }
        : qp.sort === 'popular'
          ? { views: -1 }
          : { createdAt: -1 }

  const skip = (qp.page - 1) * qp.limit
  const [docs, total] = await Promise.all([
    Property.find(filter).sort(sort).skip(skip).limit(qp.limit).lean(),
    Property.countDocuments(filter),
  ])

  return ok({
    items: docs.map(toPropertyCard),
    page: qp.page,
    limit: qp.limit,
    total,
    hasMore: skip + docs.length < total,
  })
})

// POST /api/properties — create a listing (owner). Starts as `pending` for moderation.
export const POST = handler(async (req) => {
  const session = await requireUser()
  const data = await parseBody(req, propertyCreateSchema)
  await dbConnect()

  const doc = await Property.create({
    ...data,
    ownerId: session.uid,
    slug: slugify(data.title),
    photoCount: 1 + (data.gallery?.thumbs?.length || 0),
    status: 'pending',
  })

  return ok({ property: toPropertyCard(doc.toObject()), id: String(doc._id) }, { status: 201 })
})
