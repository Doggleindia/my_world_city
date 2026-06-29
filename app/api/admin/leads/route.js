import { dbConnect } from '@/lib/db'
import Lead from '@/lib/models/Lead'
import { handler, ok, requireRole } from '@/lib/api'

// GET /api/admin/leads?status=new|contacted|closed|all
export const GET = handler(async (req) => {
  await requireRole('admin')
  await dbConnect()

  const status = new URL(req.url).searchParams.get('status') || 'all'
  const filter = status === 'all' ? {} : { status }

  const docs = await Lead.find(filter).sort({ createdAt: -1 }).limit(300).lean()
  const items = docs.map((l) => ({
    id: String(l._id),
    refId: l.refId,
    type: l.type,
    name: l.name,
    phone: l.phone,
    email: l.email || null,
    message: l.message || null,
    serviceKey: l.serviceKey || null,
    status: l.status,
    createdAt: l.createdAt,
  }))

  return ok({ items })
})
