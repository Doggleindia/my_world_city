import { dbConnect } from '@/lib/db'
import Property from '@/lib/models/Property'
import Lead from '@/lib/models/Lead'
import User from '@/lib/models/User' // registered for populate
import { handler, ok, fail, requireRole, assertObjectId } from '@/lib/api'
import { propCode } from '../route'

void User

// GET /api/admin/properties/:id — full property for the admin editor.
export const GET = handler(async (_req, { params }) => {
  await requireRole('admin')
  const { id } = await params
  assertObjectId(id, 'Property')
  await dbConnect()

  const d = await Property.findById(id).populate('ownerId', 'name phone email').lean()
  if (!d) return fail('Property not found', 404)

  const enquiries = await Lead.countDocuments({ propertyId: id })

  return ok({
    property: {
      id: String(d._id),
      code: propCode(d._id),
      title: d.title,
      slug: d.slug,
      category: d.category,
      subType: d.subType || '',
      listingType: d.listingType,
      status: d.status,
      flagged: !!d.flagged,
      verified: !!d.verified,
      featured: !!d.featured,
      premium: !!d.premium,
      rera: !!d.rera,
      price: d.price ?? '',
      priceLabel: d.priceLabel || '',
      address: d.address || '',
      pincode: d.pincode || '',
      location: { locality: d.location?.locality || '', city: d.location?.city || '', lat: d.location?.lat ?? '', lng: d.location?.lng ?? '' },
      description: d.description || '',
      badges: d.badges || [],
      amenities: (d.amenities || []).map((a) => a.label),
      gallery: { main: d.gallery?.main || '', thumbs: d.gallery?.thumbs || [] },
      details: {
        bedrooms: d.details?.bedrooms ?? '',
        bathrooms: d.details?.bathrooms ?? '',
        parking: d.details?.parking || '',
        facing: d.details?.facing || '',
        carpetArea: d.details?.carpetArea || '',
        builtUpArea: d.details?.builtUpArea || '',
        age: d.details?.age || '',
        possession: d.details?.possession || '',
        priceSqft: d.details?.priceSqft ?? '',
        booking: d.details?.booking ?? '',
        negotiable: !!d.details?.negotiable,
      },
      views: d.views || 0,
      enquiries,
      owner: d.ownerId ? { name: d.ownerId.name || 'Owner', phone: d.ownerId.phone || '', email: d.ownerId.email || '' } : null,
      createdAt: d.createdAt,
    },
  })
})

const AMENITY_ICONS = {
  Clubhouse: 'Users', Security: 'ShieldCheck', 'Gated Community': 'Fence', 'Swimming Pool': 'Droplet',
  Gym: 'Dumbbell', Lift: 'ArrowUpDown', 'Power Backup': 'Zap', 'Water 24×7': 'Droplet',
  'Landscaped Park': 'Trees', 'Solar Panels': 'Sun',
}

// PATCH /api/admin/properties/:id — moderation flags AND full editor save.
export const PATCH = handler(async (req, { params }) => {
  await requireRole('admin')
  const { id } = await params
  assertObjectId(id, 'Property')
  const body = await req.json().catch(() => ({}))
  await dbConnect()

  const doc = await Property.findById(id)
  if (!doc) return fail('Property not found', 404)

  // Moderation flags
  const flags = ['status', 'verified', 'featured', 'premium', 'rera', 'flagged', 'rejectionReason']
  for (const k of flags) if (k in body) doc[k] = body[k]
  if (body.status && body.status !== 'rejected') doc.rejectionReason = undefined

  // Editable content
  const scalars = ['title', 'category', 'subType', 'listingType', 'price', 'priceLabel', 'address', 'pincode', 'description']
  for (const k of scalars) if (k in body) doc[k] = body[k]

  if (body.location) {
    doc.location = {
      locality: body.location.locality ?? doc.location?.locality,
      city: body.location.city ?? doc.location?.city,
      lat: body.location.lat === '' ? undefined : body.location.lat ?? doc.location?.lat,
      lng: body.location.lng === '' ? undefined : body.location.lng ?? doc.location?.lng,
    }
  }
  if (Array.isArray(body.badges)) doc.badges = body.badges
  if (Array.isArray(body.amenities)) {
    doc.amenities = body.amenities.map((label) => ({ label, icon: AMENITY_ICONS[label] || 'Check' }))
  }
  if (body.gallery) {
    doc.gallery = { main: body.gallery.main ?? doc.gallery?.main, thumbs: body.gallery.thumbs ?? doc.gallery?.thumbs }
    doc.photoCount = 1 + (doc.gallery.thumbs?.length || 0)
  }
  if (body.details) {
    const num = (v) => (v === '' || v == null ? undefined : Number(v))
    doc.details = {
      bedrooms: num(body.details.bedrooms),
      bathrooms: num(body.details.bathrooms),
      parking: body.details.parking || undefined,
      facing: body.details.facing || undefined,
      carpetArea: body.details.carpetArea || undefined,
      builtUpArea: body.details.builtUpArea || undefined,
      age: body.details.age || undefined,
      possession: body.details.possession || undefined,
      priceSqft: num(body.details.priceSqft),
      booking: num(body.details.booking),
      negotiable: !!body.details.negotiable,
    }
  }

  await doc.save()
  return ok({ id: String(doc._id), status: doc.status })
})

// DELETE /api/admin/properties/:id
export const DELETE = handler(async (_req, { params }) => {
  await requireRole('admin')
  const { id } = await params
  assertObjectId(id, 'Property')
  await dbConnect()
  const doc = await Property.findByIdAndDelete(id)
  if (!doc) return fail('Property not found', 404)
  return ok({ deleted: true })
})
