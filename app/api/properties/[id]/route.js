import { dbConnect } from '@/lib/db'
import Property from '@/lib/models/Property'
import { handler, ok, fail, requireUser, ApiError, assertObjectId, isObjectId, parseBody } from '@/lib/api'
import { getSession } from '@/lib/auth/session'
import { serialize } from '@/lib/serialize'
import { propertyUpdateSchema } from '@/lib/validation'

// GET /api/properties/:id  — id may be a Mongo id or a slug.
export const GET = handler(async (_req, { params }) => {
  const { id } = await params
  await dbConnect()

  const byId = isObjectId(id)
  const doc = await Property.findOne(byId ? { _id: id } : { slug: id }).lean()
  if (!doc) return fail('Property not found', 404)

  // Non-active listings (draft/pending/rejected/sold) are only visible to their
  // owner or an admin — the public must not read the moderation queue by id/slug.
  if (doc.status !== 'active') {
    const session = await getSession()
    const isOwner = session && String(doc.ownerId) === session.uid
    const isAdmin = session && (session.roles || []).includes('admin')
    if (!isOwner && !isAdmin) return fail('Property not found', 404)
  } else {
    // Best-effort view counter — only counts genuine public views.
    Property.updateOne({ _id: doc._id }, { $inc: { views: 1 } }).catch(() => {})
  }

  return ok({ property: serialize(doc, ['ownerId']) })
})

// PATCH — owner (or admin) edits their listing.
export const PATCH = handler(async (req, { params }) => {
  const session = await requireUser()
  const { id } = await params
  assertObjectId(id, 'Property')
  await dbConnect()

  const doc = await Property.findById(id)
  if (!doc) return fail('Property not found', 404)

  const isOwner = String(doc.ownerId) === session.uid
  const isAdmin = (session.roles || []).includes('admin')
  if (!isOwner && !isAdmin) throw new ApiError('Forbidden', 403)

  const body = await parseBody(req, propertyUpdateSchema)
  for (const [k, v] of Object.entries(body)) doc[k] = v
  // Edited listings go back to moderation unless an admin is editing.
  if (!isAdmin) doc.status = 'pending'
  await doc.save()

  return ok({ property: serialize(doc.toObject(), ['ownerId']) })
})

// DELETE — owner (or admin) removes their listing.
export const DELETE = handler(async (_req, { params }) => {
  const session = await requireUser()
  const { id } = await params
  assertObjectId(id, 'Property')
  await dbConnect()

  const doc = await Property.findById(id)
  if (!doc) return fail('Property not found', 404)
  const isOwner = String(doc.ownerId) === session.uid
  const isAdmin = (session.roles || []).includes('admin')
  if (!isOwner && !isAdmin) throw new ApiError('Forbidden', 403)

  await doc.deleteOne()
  return ok({ message: 'Deleted' })
})
