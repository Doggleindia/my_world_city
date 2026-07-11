import { dbConnect } from '@/lib/db'
import Property from '@/lib/models/Property'
import Expert from '@/lib/models/Expert'
import Lead from '@/lib/models/Lead'
import { handler, ok, requireRole } from '@/lib/api'

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// GET /api/admin/search?q= — global admin search across properties, experts, leads.
export const GET = handler(async (req) => {
  await requireRole('admin')
  const q = (new URL(req.url).searchParams.get('q') || '').trim()
  if (q.length < 2) return ok({ properties: [], experts: [], leads: [] })
  await dbConnect()

  const rx = new RegExp(esc(q), 'i')
  const [props, experts, leads] = await Promise.all([
    Property.find({ $or: [{ title: rx }, { slug: rx }, { 'location.locality': rx }] }).select('title slug location.locality status').limit(5).lean(),
    Expert.find({ $or: [{ name: rx }, { cat: rx }, { location: rx }] }).select('name slug cat location').limit(5).lean(),
    Lead.find({ $or: [{ name: rx }, { phone: rx }, { refId: rx }] }).sort({ createdAt: -1 }).select('name phone type refId').limit(5).lean(),
  ])

  return ok({
    properties: props.map((p) => ({ id: String(p._id), title: p.title, locality: p.location?.locality || '', status: p.status, href: `/admin/properties/${p._id}` })),
    experts: experts.map((e) => ({ id: String(e._id), name: e.name, cat: e.cat, href: `/admin/directory/${e._id}` })),
    leads: leads.map((l) => ({ id: String(l._id), name: l.name, phone: l.phone, type: l.type, href: `/admin/enquiries` })),
  })
})
