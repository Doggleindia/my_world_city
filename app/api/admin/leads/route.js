import { dbConnect } from '@/lib/db'
import Lead from '@/lib/models/Lead'
import Property from '@/lib/models/Property' // registered so populate('propertyId') resolves
import Expert from '@/lib/models/Expert' // registered so populate('expertId') resolves
import { handler, ok, requireRole } from '@/lib/api'

void Property
void Expert

// Derive the business category shown in the admin enquiries table from the
// lead's type + whether it targets a property.
function categoryOf(l) {
  if (l.type === 'service') return 'service'
  if (l.type === 'expert') return 'expert'
  if (l.propertyId) return 'property'
  return 'solution'
}

// GET /api/admin/leads?status=new|contacted|site_visit|qualified|closed|all
export const GET = handler(async (req) => {
  await requireRole('admin')
  await dbConnect()

  const status = new URL(req.url).searchParams.get('status') || 'all'
  const filter = status === 'all' ? {} : { status }

  const [docs, total] = await Promise.all([
    Lead.find(filter)
      .sort({ createdAt: -1 })
      .limit(300)
      .populate('propertyId', 'title location.locality')
      .populate('expertId', 'cat role name')
      .lean(),
    Lead.countDocuments(filter),
  ])

  const items = docs.map((l) => ({
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
    about: {
      primary: l.propertyId?.title || l.serviceKey || 'General enquiry',
      secondary: l.message ? l.message.slice(0, 60) : l.refId,
    },
    locality: l.propertyId?.location?.locality || null,
    source: null, // not tracked yet
    status: l.status,
    // Service-routing extras
    preferredTime: l.preferredTime || l.timeSlot || 'Anytime',
    hasProperty: !!l.propertyId,
    // Expert-request extras
    expertType: l.serviceKey || l.expertId?.cat || null,
    propertyTitle: l.propertyId?.title || null,
    createdAt: l.createdAt,
    updatedAt: l.updatedAt,
  }))

  return ok({ items, total })
})
