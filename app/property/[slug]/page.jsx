import { notFound } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import TopBar from '@/components/TopBar'
import Navbar from '@/components/Navbar'
import PropertyGallery from '@/components/property/PropertyGallery'
import PropertyDetails from '@/components/property/PropertyDetails'
import ContactCard from '@/components/property/ContactCard'
import OwnershipSteps from '@/components/property/OwnershipSteps'
import SiteFooter from '@/components/property/SiteFooter'
import { ownershipSteps, property as staticProperty } from '@/data'
import { dbConnect } from '@/lib/db'
import Property from '@/lib/models/Property'
import User from '@/lib/models/User' // registered for populate
import { serialize } from '@/lib/serialize'
import { getSession } from '@/lib/auth/session'

void User
export const dynamic = 'force-dynamic'

const DEFAULT_AGENT = {
  name: 'My World City',
  role: 'VERIFIED',
  responds: 'Usually responds in ~2 hrs',
  avatar: 'https://i.pravatar.cc/120?img=12',
}

// Build the "Key details" grid rows from the admin details subdoc (real data),
// falling back to basic top-level facts — never the static demo property.
function buildKeyDetails(doc) {
  const d = doc.details || {}
  const list = []
  const push = (l, v) => { if (v !== undefined && v !== null && v !== '') list.push({ l, v: String(v) }) }
  push('Type', doc.listingType === 'rent' ? 'For Rent' : 'For Sale')
  push('Bedrooms', d.bedrooms)
  push('Bathrooms', d.bathrooms)
  push('Balconies', d.balconies)
  push('Carpet Area', d.carpetArea)
  push('Built-up Area', d.builtUpArea)
  push('Super Area', d.superArea)
  if (d.floorNumber || d.totalFloors) push('Floor', `${d.floorNumber ?? '—'}${d.totalFloors ? ` of ${d.totalFloors}` : ''}`)
  push('Facing', d.facing)
  push('Furnishing', d.furnishing)
  push('Age', d.age)
  push('Possession', d.possession)
  push('Ownership', d.ownership)
  push('Parking', d.parking)
  if (d.priceSqft) push('Price / sq.ft', `₹${Number(d.priceSqft).toLocaleString('en-IN')}`)
  if (d.booking) push('Booking', `₹${Number(d.booking).toLocaleString('en-IN')}`)
  if (d.maintenance) push('Maintenance', `₹${Number(d.maintenance).toLocaleString('en-IN')}/mo`)
  if (d.negotiable !== undefined && d.negotiable !== null) push('Negotiable', d.negotiable ? 'Yes' : 'No')

  // Fall back to basics if the owner never filled the spec sheet.
  if (list.length <= 1) {
    if (doc.category) list.push({ l: 'Category', v: doc.category })
    if (doc.area) list.push({ l: 'Area', v: doc.area })
    if (doc.priceLabel) list.push({ l: 'Price', v: doc.priceLabel })
    if (doc.location?.locality) list.push({ l: 'Locality', v: doc.location.locality })
    if (doc.pincode) list.push({ l: 'Pincode', v: doc.pincode })
  }

  const rows = []
  for (let i = 0; i < list.length; i += 2) rows.push([list[i], list[i + 1] || { l: '', v: '' }])
  return rows
}

// Map a DB property document to the shape the detail components expect.
function toDetail(doc) {
  const locality = doc.location?.locality || ''
  const city = doc.location?.city || 'Jaipur'
  const owner = doc.ownerId && typeof doc.ownerId === 'object' ? doc.ownerId : null
  const agent = owner
    ? {
        name: owner.name || 'Owner',
        role: 'OWNER',
        avatar: owner.avatar || null,
        initials: (owner.name || 'O').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase(),
        phone: owner.phone || null,
        email: owner.email || null,
        responds: null,
      }
    : DEFAULT_AGENT

  return {
    id: doc.id || doc._id,
    category: doc.category,
    subType: doc.subType || null,
    title: doc.title,
    area: [doc.subType, doc.area].filter(Boolean).join(' · ') || doc.area || '',
    location: [doc.address, locality, city].filter(Boolean).join(', '),
    verified: !!doc.verified,
    rera: !!doc.rera,
    photoCount: doc.photoCount || (doc.gallery?.thumbs?.length || 0) + 1,
    breadcrumb: ['Home', doc.category, locality || city, doc.title],
    badges: doc.badges || [],
    gallery: { main: doc.gallery?.main, thumbs: doc.gallery?.thumbs || [] },
    keyDetails: buildKeyDetails(doc),
    amenities: doc.amenities || [],
    about: doc.description || `${doc.title} in ${locality || city}.`,
    distances: doc.distances || [],
    priceLabel: doc.priceLabel || null,
    negotiable: !!doc.details?.negotiable,
    agent,
  }
}

async function getProperty(slug) {
  try {
    await dbConnect()
    const doc = await Property.findOne({ slug }).populate('ownerId', 'name phone email avatar').lean()
    if (doc) {
      // Non-active listings are only visible to their owner or an admin.
      if (doc.status !== 'active') {
        const session = await getSession()
        const ownerId = String(doc.ownerId?._id || doc.ownerId || '')
        const isOwner = session && ownerId === session.uid
        const isAdmin = session && (session.roles || []).includes('admin')
        if (!isOwner && !isAdmin) return null
      }
      return toDetail(serialize(doc))
    }
  } catch {
    // DB not configured — fall back to the static showcase for the demo slug.
  }
  if (slug === 'modern-3bhk-villa-jagatpura') {
    return { ...staticProperty, agent: staticProperty.agent || DEFAULT_AGENT }
  }
  return null
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const p = await getProperty(slug)
  if (!p) return { title: 'Property — My World City' }
  return { title: `${p.title} — My World City`, description: p.about }
}

export default async function PropertyDetailPage({ params }) {
  const { slug } = await params
  const property = await getProperty(slug)
  if (!property) notFound()

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <TopBar />
      <Navbar cta="brand" />

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-5 sm:px-6">
        <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-[13px] text-slate-500">
          {property.breadcrumb.map((c, i) => {
            const last = i === property.breadcrumb.length - 1
            return (
              <span key={`${c}-${i}`} className="flex items-center gap-1.5">
                <span className={last ? 'font-semibold text-navy-800' : ''}>{c}</span>
                {!last && <ChevronRight className="h-3.5 w-3.5 text-slate-300" />}
              </span>
            )
          })}
        </nav>

        <PropertyGallery
          gallery={property.gallery}
          verified={property.verified}
          photoCount={property.photoCount}
          propertyId={property.id}
        />

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
          <PropertyDetails property={property} />
          <ContactCard property={property} />
        </div>
      </div>

      <OwnershipSteps steps={ownershipSteps} />
      <SiteFooter />
    </main>
  )
}
