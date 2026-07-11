import { dbConnect } from '@/lib/db'
import Expert from '@/lib/models/Expert'
import Lead from '@/lib/models/Lead'
import { handler, ok, fail, requireRole, assertObjectId } from '@/lib/api'

function expCode(id) {
  return `EXP-${String(parseInt(String(id).slice(-6), 16) % 100000).padStart(5, '0')}`
}
function parseYears(v) {
  const m = String(v ?? '').match(/\d+/)
  return m ? Number(m[0]) : null
}

// GET /api/admin/directory/:id — full expert for the admin detail/edit page.
export const GET = handler(async (_req, { params }) => {
  await requireRole('admin')
  const { id } = await params
  assertObjectId(id, 'Expert')
  await dbConnect()

  const d = await Expert.findById(id).lean()
  if (!d) return fail('Expert not found', 404)
  const assigned = await Lead.countDocuments({ assignedExpert: id })

  return ok({
    expert: {
      id: String(d._id),
      code: expCode(d._id),
      slug: d.slug,
      name: d.name,
      initials: d.initials || '',
      role: d.role || '',
      cat: d.cat || '',
      specialty: d.specialty || '',
      photo: d.photo || null,
      location: d.location || '',
      experienceYears: parseYears(d.experience) ?? d.meta?.experienceYears ?? '',
      intro: d.intro || '',
      phone: d.phone || '',
      email: d.email || '',
      serviceAreas: d.serviceAreas || [],
      specialties: d.specialties || [],
      portfolio: d.portfolio || [],
      status: d.status || (d.verified ? 'verified' : 'pending'),
      featured: !!d.featured,
      verified: !!d.verified,
      rating: d.rating || 0,
      ratingCount: d.ratingCount || 0,
      cases: d.cases || 0,
      avgResponseHours: d.avgResponseHours || 4,
      assigned,
      meta: d.meta || {},
      createdAt: d.createdAt,
    },
  })
})

// PATCH /api/admin/directory/:id — update status/featured/editable fields.
export const PATCH = handler(async (req, { params }) => {
  await requireRole('admin')
  const { id } = await params
  assertObjectId(id, 'Expert')
  const b = await req.json().catch(() => ({}))
  await dbConnect()

  const doc = await Expert.findById(id)
  if (!doc) return fail('Expert not found', 404)

  if (b.status && ['draft', 'pending', 'verified', 'suspended'].includes(b.status)) {
    doc.status = b.status
    doc.verified = b.status === 'verified'
  }
  if ('featured' in b) doc.featured = !!b.featured
  const scalars = ['name', 'role', 'cat', 'specialty', 'location', 'intro', 'phone', 'email']
  for (const k of scalars) if (k in b) doc[k] = b[k]
  if ('experienceYears' in b && b.experienceYears !== '') doc.experience = `${b.experienceYears} years exp`
  if (Array.isArray(b.serviceAreas)) doc.serviceAreas = b.serviceAreas
  if (Array.isArray(b.specialties)) doc.specialties = b.specialties
  if (b.rating != null && b.rating !== '') doc.rating = Number(b.rating)
  if (b.cases != null && b.cases !== '') doc.cases = Number(b.cases)

  await doc.save()
  return ok({ id: String(doc._id), status: doc.status })
})

// DELETE /api/admin/directory/:id
export const DELETE = handler(async (_req, { params }) => {
  await requireRole('admin')
  const { id } = await params
  assertObjectId(id, 'Expert')
  await dbConnect()
  const doc = await Expert.findByIdAndDelete(id)
  if (!doc) return fail('Expert not found', 404)
  return ok({ deleted: true })
})
