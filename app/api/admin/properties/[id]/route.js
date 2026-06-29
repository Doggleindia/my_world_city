import { dbConnect } from '@/lib/db'
import Property from '@/lib/models/Property'
import { handler, ok, fail, requireRole } from '@/lib/api'

// PATCH /api/admin/properties/:id { status, verified, featured, premium, rejectionReason }
export const PATCH = handler(async (req, { params }) => {
  await requireRole('admin')
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  await dbConnect()

  const doc = await Property.findById(id)
  if (!doc) return fail('Property not found', 404)

  const fields = ['status', 'verified', 'featured', 'premium', 'rejectionReason']
  for (const k of fields) if (k in body) doc[k] = body[k]
  if (body.status && body.status !== 'rejected') doc.rejectionReason = undefined
  await doc.save()

  return ok({ id: String(doc._id), status: doc.status })
})
