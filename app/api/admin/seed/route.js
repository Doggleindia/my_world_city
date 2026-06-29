import { dbConnect } from '@/lib/db'
import Property from '@/lib/models/Property'
import Expert from '@/lib/models/Expert'
import { getSession } from '@/lib/auth/session'
import { handler, ok, ApiError } from '@/lib/api'
import { featured, property as detail, expertList, expertContentByCat } from '@/data'

const CAT = {
  INDUSTRIAL: 'Industrial',
  RESIDENTIAL: 'Residential',
  COMMERCIAL: 'Commercial',
  AGRICULTURAL: 'Farm & Agri',
}

function slugify(s, i) {
  return (
    s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 50) + '-' + i
  )
}

// Rough price generator so filters/sorting have something to work with.
const PRICES = [4_000_000, 6_500_000, 9_000_000, 12_500_000, 18_000_000, 24_000_000]
function priceLabel(n) {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`
  return `₹${Math.round(n / 100_000)} L`
}

function buildProperties() {
  const out = []

  // 1) The fully-detailed showcase property.
  out.push({
    slug: 'modern-3bhk-villa-jagatpura',
    title: detail.title,
    category: 'Residential',
    listingType: 'buy',
    price: 12_500_000,
    priceLabel: '₹1.25 Cr',
    area: '2,400 sq ft',
    location: { locality: 'Jagatpura', city: 'Jaipur' },
    badges: detail.badges,
    amenities: detail.amenities,
    gallery: detail.gallery,
    photoCount: detail.photoCount,
    keyDetails: detail.keyDetails,
    distances: detail.distances,
    description: detail.about,
    status: 'active',
    verified: true,
    rera: true,
    featured: true,
    premium: true,
  })

  // 2) The featured cards become active listings.
  featured.forEach((f, i) => {
    const [locality, area] = (f.loc || '').split(' — ')
    const price = PRICES[i % PRICES.length]
    out.push({
      slug: slugify(`${f.title}-${locality || 'jaipur'}`, i),
      title: f.title,
      category: CAT[f.tag] || 'Residential',
      listingType: i % 4 === 0 ? 'rent' : 'buy',
      price,
      priceLabel: priceLabel(price),
      area: area || '',
      location: { locality: locality || 'Jaipur', city: 'Jaipur' },
      badges: ['Verified', 'Freehold'],
      amenities: detail.amenities.slice(0, 4),
      gallery: { main: f.img, thumbs: [f.img] },
      photoCount: 6,
      description: `${f.title} in ${locality || 'Jaipur'}. A verified opportunity listed on My World City.`,
      status: 'active',
      verified: true,
      rera: i % 2 === 0,
      featured: i < 3,
      premium: false,
    })
  })

  return out
}

function buildExperts() {
  return expertList.map((e) => {
    const content = expertContentByCat[e.cat] || expertContentByCat.Architecture
    return {
      slug: e.slug,
      name: e.name,
      initials: e.initials,
      role: e.role,
      cat: e.cat,
      tag: e.tag,
      specialty: e.specialty,
      ...content,
      verified: true,
      rating: 4.7,
    }
  })
}

export const POST = handler(async (req) => {
  // Auth: admin session OR a matching x-seed-secret header (for first-run bootstrap).
  const secret = process.env.SEED_SECRET
  const header = req.headers.get('x-seed-secret')
  const session = await getSession()
  const isAdmin = session && (session.roles || []).includes('admin')
  if (!isAdmin && !(secret && header && header === secret)) {
    throw new ApiError('Forbidden — admin session or x-seed-secret required', 403)
  }

  await dbConnect()

  const properties = buildProperties()
  const experts = buildExperts()

  await Promise.all([
    ...properties.map((p) =>
      Property.updateOne({ slug: p.slug }, { $set: p }, { upsert: true }),
    ),
    ...experts.map((e) => Expert.updateOne({ slug: e.slug }, { $set: e }, { upsert: true })),
  ])

  return ok({
    message: 'Seed complete',
    properties: properties.length,
    experts: experts.length,
  })
})
