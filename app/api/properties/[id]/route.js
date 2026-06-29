import { dbConnect } from '@/lib/db'
import Property from '@/lib/models/Property'
import { handler, ok, fail, requireUser, ApiError } from '@/lib/api'
import { serialize } from '@/lib/serialize'

// GET /api/properties/:id  — id may be a Mongo id or a slug.
export const GET = handler(async (_req, { params }) => {
  const { id } = await params
  await dbConnect()

  const byId = id.match(/^[0-9a-fA-F]{24}$/)
  const doc = await Property.findOne(byId ? { _id: id } : { slug: id }).lean()
  if (!doc) return fail('Property not found', 404)

  // Best-effort view counter.
  Property.updateOne({ _id: doc._id }, { $inc: { views: 1 } }).catch(() => {})

  return ok({ property: serialize(doc) })
})

// PATCH — owner (or admin) edits their listing.
export const PATCH = handler(async (req, { params }) => {
  const session = await requireUser()
  const { id } = await params
  await dbConnect()

  const doc = await Property.findById(id)
  if (!doc) return fail('Property not found', 404)

  const isOwner = String(doc.ownerId) === session.uid
  const isAdmin = (session.roles || []).includes('admin')
  if (!isOwner && !isAdmin) throw new ApiError('Forbidden', 403)

  const body = await req.json()
  const editable = ['title', 'price', 'priceLabel', 'area', 'badges', 'amenities', 'gallery', 'description', 'location']
  for (const k of editable) if (k in body) doc[k] = body[k]
  // Edited listings go back to moderation unless an admin is editing.
  if (!isAdmin) doc.status = 'pending'
  await doc.save()

  return ok({ property: serialize(doc.toObject()) })
})

// DELETE — owner (or admin) removes their listing.
export const DELETE = handler(async (_req, { params }) => {
  const session = await requireUser()
  const { id } = await params
  await dbConnect()

  const doc = await Property.findById(id)
  if (!doc) return fail('Property not found', 404)
  const isOwner = String(doc.ownerId) === session.uid
  const isAdmin = (session.roles || []).includes('admin')
  if (!isOwner && !isAdmin) throw new ApiError('Forbidden', 403)

  await doc.deleteOne()
  return ok({ message: 'Deleted' })
})
