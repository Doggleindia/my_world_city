import { dbConnect } from '@/lib/db'
import Lead from '@/lib/models/Lead'
import { handler, ok, fail, requireRole } from '@/lib/api'

// PATCH /api/admin/leads/:id { status, assignedTo }
export const PATCH = handler(async (req, { params }) => {
  await requireRole('admin')
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  await dbConnect()

  const doc = await Lead.findById(id)
  if (!doc) return fail('Lead not found', 404)
  if (body.status) doc.status = body.status
  if ('assignedTo' in body) doc.assignedTo = body.assignedTo || undefined
  await doc.save()

  return ok({ id: String(doc._id), status: doc.status })
})
