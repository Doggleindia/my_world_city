import { dbConnect } from '@/lib/db'
import Property from '@/lib/models/Property'
import User from '@/lib/models/User'
import { syncAdminRole } from '@/lib/auth/roles'
import { handler, ok, requireRole, ApiError } from '@/lib/api'

void User

export function propCode(id) {
  return `MWC-${String(id).slice(-4).toUpperCase()}`
}

function slugify(s) {
  return (
    String(s || 'property').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60) +
    '-' + Math.random().toString(36).slice(2, 7)
  )
}

const AMENITY_ICONS = {
  Clubhouse: 'Users', '24×7 Security': 'ShieldCheck', 'Power Backup': 'Zap', Gym: 'Dumbbell',
  'Swimming Pool': 'Droplet', Garden: 'Trees', 'Sports Courts': 'Trophy', 'Kids Play Area': 'Baby',
  'Visitor Parking': 'ParkingSquare', Security: 'ShieldCheck', 'Gated Community': 'Fence', Lift: 'ArrowUpDown',
}

// POST /api/admin/properties — admin creates a listing via the Add-Property wizard.
export const POST = handler(async (req) => {
  await requireRole('admin')
  const b = await req.json().catch(() => ({}))
  await dbConnect()

  if (!b.title || !String(b.title).trim()) throw new ApiError('Property title is required', 422)

  // Find or create the owner by phone.
  let ownerId
  if (b.owner?.phone && /^[6-9]\d{9}$/.test(b.owner.phone)) {
    let owner = await User.findOne({ phone: b.owner.phone })
    if (!owner) {
      owner = await User.create({
        phone: b.owner.phone,
        name: b.owner.name || 'Owner',
        email: b.owner.email || undefined,
        roles: ['owner'],
      })
      await syncAdminRole(owner)
    } else if (!owner.roles.includes('owner')) {
      owner.roles.push('owner')
      await owner.save()
    }
    ownerId = owner._id
  }

  const num = (v) => (v === '' || v == null ? undefined : Number(v))
  const status = ['draft', 'pending', 'active'].includes(b.status) ? b.status : 'pending'

  const doc = await Property.create({
    title: String(b.title).trim(),
    slug: slugify(b.title),
    category: b.category || 'Residential',
    subType: b.subType || undefined,
    listingType: b.listingType === 'rent' ? 'rent' : 'buy',
    status,
    verified: !!b.verified,
    featured: !!b.featured,
    rera: !!b.rera,
    reraNumber: b.reraNumber || undefined,
    listedDate: b.listedDate ? new Date(b.listedDate) : undefined,
    price: num(b.price),
    priceLabel: b.priceLabel || undefined,
    address: b.address || undefined,
    pincode: b.pincode || undefined,
    description: b.description || undefined,
    ownerId,
    location: {
      locality: b.location?.locality || '',
      city: b.location?.city || 'Jaipur',
      lat: num(b.location?.lat),
      lng: num(b.location?.lng),
    },
    amenities: (b.amenities || []).map((label) => ({ label, icon: AMENITY_ICONS[label] || 'Check' })),
    distances: (b.landmarks || []).filter((l) => l.name).map((l) => ({ label: l.name, value: `${l.distance || ''} ${l.unit || 'km'}`.trim() })),
    gallery: { main: b.gallery?.main || '', thumbs: b.gallery?.thumbs || [] },
    photoCount: 1 + (b.gallery?.thumbs?.length || 0),
    details: {
      bedrooms: num(b.details?.bedrooms),
      bathrooms: num(b.details?.bathrooms),
      balconies: num(b.details?.balconies),
      parking: b.details?.parking || undefined,
      totalFloors: num(b.details?.totalFloors),
      floorNumber: num(b.details?.floorNumber),
      facing: b.details?.facing || undefined,
      age: b.details?.age || undefined,
      possession: b.details?.possession || undefined,
      furnishing: b.details?.furnishing || undefined,
      ownership: b.details?.ownership || undefined,
      titleStatus: b.details?.titleStatus || undefined,
      carpetArea: b.details?.carpetArea || undefined,
      builtUpArea: b.details?.builtUpArea || undefined,
      superArea: b.details?.superArea || undefined,
      priceSqft: num(b.details?.priceSqft),
      booking: num(b.details?.booking),
      maintenance: num(b.details?.maintenance),
      negotiable: !!b.details?.negotiable,
    },
    meta: b.meta || undefined,
  })

  return ok({ id: String(doc._id), code: propCode(doc._id), slug: doc.slug, status: doc.status }, { status: 201 })
})

// GET /api/admin/properties?status=all|live|pending|rejected|flagged&type=&locality=&q=&verified=&featured=&sort=&page=&limit=
export const GET = handler(async (req) => {
  await requireRole('admin')
  await dbConnect()

  const p = new URL(req.url).searchParams
  const status = p.get('status') || 'all'
  const type = p.get('type') || ''
  const locality = p.get('locality') || ''
  const q = (p.get('q') || '').trim()
  const sort = p.get('sort') || 'newest'
  const page = Math.max(1, Number(p.get('page') || 1))
  const limit = Math.min(50, Math.max(1, Number(p.get('limit') || 12)))

  const filter = {}
  if (status === 'live') filter.status = 'active'
  else if (status === 'pending') filter.status = 'pending'
  else if (status === 'rejected') filter.status = 'rejected'
  else if (status === 'flagged') filter.flagged = true
  // status 'all' → no status constraint
  if (type) filter.category = type
  if (locality) filter['location.locality'] = locality
  if (p.get('verified') === 'true') filter.verified = true
  if (p.get('featured') === 'true') filter.featured = true
  const minPrice = Number(p.get('minPrice'))
  const maxPrice = Number(p.get('maxPrice'))
  if (minPrice > 0 || maxPrice > 0) {
    filter.price = {}
    if (minPrice > 0) filter.price.$gte = minPrice
    if (maxPrice > 0) filter.price.$lte = maxPrice
  }
  if (q) filter.$or = [{ title: new RegExp(escapeRe(q), 'i') }, { slug: new RegExp(escapeRe(q), 'i') }]

  const sortSpec = sort === 'price_asc' ? { price: 1 } : sort === 'price_desc' ? { price: -1 }
    : sort === 'popular' ? { views: -1 } : { createdAt: -1 }

  const skip = (page - 1) * limit
  const [docs, resultTotal, total, pending, flagged, localities] = await Promise.all([
    Property.find(filter).sort(sortSpec).skip(skip).limit(limit).populate('ownerId', 'name').lean(),
    Property.countDocuments(filter),
    Property.estimatedDocumentCount(),
    Property.countDocuments({ status: 'pending' }),
    Property.countDocuments({ flagged: true }),
    Property.distinct('location.locality'),
  ])

  const items = docs.map((d) => ({
    id: String(d._id),
    code: propCode(d._id),
    title: d.title,
    slug: d.slug,
    owner: d.ownerId?.name || 'Owner',
    category: d.category,
    locality: d.location?.locality || '—',
    price: d.price || null,
    priceLabel: d.priceLabel || null,
    status: d.status,
    flagged: !!d.flagged,
    verified: !!d.verified,
    featured: !!d.featured,
    views: d.views || 0,
    img: d.gallery?.main || (d.gallery?.thumbs && d.gallery.thumbs[0]) || '',
    createdAt: d.createdAt,
  }))

  return ok({
    items,
    page,
    limit,
    resultTotal,
    pageCount: Math.max(1, Math.ceil(resultTotal / limit)),
    counts: { total, pending, flagged },
    localities: localities.filter(Boolean).sort(),
  })
})

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
