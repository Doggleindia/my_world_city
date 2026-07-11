import { dbConnect } from '@/lib/db'
import SavedProperty from '@/lib/models/SavedProperty'
import Property from '@/lib/models/Property'
import { handler, ok, fail, requireUser, isObjectId } from '@/lib/api'
import { toPropertyCard } from '@/lib/serialize'

// GET /api/saved — the current user's saved properties (full cards + id list).
export const GET = handler(async () => {
  const session = await requireUser()
  await dbConnect()

  const saved = await SavedProperty.find({ userId: session.uid }).sort({ createdAt: -1 }).lean()
  const ids = saved.map((s) => s.propertyId)
  const props = await Property.find({ _id: { $in: ids } }).lean()
  const byId = new Map(props.map((p) => [String(p._id), p]))

  const items = ids
    .map((id) => byId.get(String(id)))
    .filter(Boolean)
    .map(toPropertyCard)

  return ok({ items, ids: ids.map(String) })
})

// POST /api/saved { propertyId } — save a property (idempotent).
export const POST = handler(async (req) => {
  const session = await requireUser()
  const { propertyId } = await req.json().catch(() => ({}))
  if (!isObjectId(propertyId)) return fail('Valid propertyId required', 400)
  await dbConnect()

  await SavedProperty.updateOne(
    { userId: session.uid, propertyId },
    { $setOnInsert: { userId: session.uid, propertyId } },
    { upsert: true },
  )
  return ok({ saved: true })
})

// DELETE /api/saved?propertyId=... — unsave.
export const DELETE = handler(async (req) => {
  const session = await requireUser()
  const propertyId = new URL(req.url).searchParams.get('propertyId')
  if (!isObjectId(propertyId)) return fail('Valid propertyId required', 400)
  await dbConnect()

  await SavedProperty.deleteOne({ userId: session.uid, propertyId })
  return ok({ saved: false })
})
