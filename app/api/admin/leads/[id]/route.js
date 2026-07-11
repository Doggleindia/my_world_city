import { dbConnect } from '@/lib/db'
import Lead from '@/lib/models/Lead'
import Property from '@/lib/models/Property' // registered for populate
import User from '@/lib/models/User' // registered for populate
import { handler, ok, fail, requireRole, assertObjectId, isObjectId } from '@/lib/api'

void Property
void User

function categoryOf(l) {
  if (l.type === 'service') return 'service'
  if (l.type === 'expert') return 'expert'
  if (l.propertyId) return 'property'
  return 'solution'
}

// GET /api/admin/leads/:id — full enriched detail for the request drawer.
export const GET = handler(async (_req, { params }) => {
  await requireRole('admin')
  const { id } = await params
  assertObjectId(id, 'Lead')
  await dbConnect()

  const l = await Lead.findById(id)
    .populate('propertyId', 'title slug category location.locality gallery.main')
    .populate('userId', 'name createdAt verified roles email')
    .populate('expertId', 'cat role name')
    .lean()
  if (!l) return fail('Lead not found', 404)

  // Related enquiries from the same person (phone), excluding this one.
  const relatedRaw = await Lead.find({ _id: { $ne: l._id }, phone: l.phone })
    .sort({ createdAt: -1 }).limit(5).lean()
  const related = relatedRaw.map((r) => ({ id: String(r._id), refId: r.refId, type: r.type, createdAt: r.createdAt }))

  return ok({
    lead: {
      id: String(l._id),
      refId: l.refId,
      type: l.type,
      category: categoryOf(l),
      name: l.name,
      phone: l.phone,
      email: l.email || null,
      budget: l.budget || null,
      message: l.message || null,
      serviceKey: l.serviceKey || null,
      expertType: l.serviceKey || l.expertId?.cat || null,
      preferredTime: l.preferredTime || l.timeSlot || null,
      preferredDay: l.preferredDay || null,
      visitDate: l.visitDate || null,
      status: l.status,
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,
      locality: l.propertyId?.location?.locality || null,
      user: l.userId
        ? { name: l.userId.name || null, email: l.userId.email || null, memberSince: l.userId.createdAt, verified: !!l.userId.verified, roles: l.userId.roles || [] }
        : null,
      property: l.propertyId
        ? { title: l.propertyId.title, slug: l.propertyId.slug, category: l.propertyId.category, img: l.propertyId.gallery?.main || null }
        : null,
      related,
    },
  })
})

// PATCH /api/admin/leads/:id { status, assignedTo }
export const PATCH = handler(async (req, { params }) => {
  await requireRole('admin')
  const { id } = await params
  assertObjectId(id, 'Lead')
  const body = await req.json().catch(() => ({}))
  await dbConnect()

  const doc = await Lead.findById(id)
  if (!doc) return fail('Lead not found', 404)
  if (body.status) doc.status = body.status
  if ('assignedTo' in body) {
    doc.assignedTo = isObjectId(body.assignedTo) ? body.assignedTo : undefined
  }
  // Routing a service request to a partner also marks it contacted (routed).
  if (isObjectId(body.routedPartner)) {
    doc.routedPartner = body.routedPartner
    doc.routedAt = new Date()
    if (!body.status) doc.status = 'contacted'
  }
  // Assigning an expert to an expert request also marks it contacted (assigned).
  if (isObjectId(body.assignedExpert)) {
    doc.assignedExpert = body.assignedExpert
    doc.assignedAt = new Date()
    if (!body.status) doc.status = 'contacted'
  }
  await doc.save()

  return ok({ id: String(doc._id), status: doc.status })
})
