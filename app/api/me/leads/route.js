import { dbConnect } from '@/lib/db'
import Property from '@/lib/models/Property'
import Lead from '@/lib/models/Lead'
import { handler, ok, requireUser } from '@/lib/api'

// GET /api/me/leads — leads received on my properties, and leads I submitted.
export const GET = handler(async () => {
  const session = await requireUser()
  await dbConnect()

  const myProps = await Property.find({ ownerId: session.uid }).select('_id title').lean()
  const propIds = myProps.map((p) => p._id)
  const titleById = new Map(myProps.map((p) => [String(p._id), p.title]))

  const [received, sent] = await Promise.all([
    propIds.length
      ? Lead.find({ propertyId: { $in: propIds } }).sort({ createdAt: -1 }).limit(100).lean()
      : [],
    Lead.find({ userId: session.uid }).sort({ createdAt: -1 }).limit(100).lean(),
  ])

  const map = (l) => ({
    id: String(l._id),
    refId: l.refId,
    type: l.type,
    name: l.name,
    phone: l.phone,
    email: l.email || null,
    message: l.message || null,
    status: l.status,
    propertyTitle: l.propertyId ? titleById.get(String(l.propertyId)) || null : null,
    serviceKey: l.serviceKey || null,
    createdAt: l.createdAt,
  })

  return ok({ received: received.map(map), sent: sent.map(map) })
})
