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
import { serialize } from '@/lib/serialize'

export const dynamic = 'force-dynamic'

const DEFAULT_AGENT = {
  name: 'My World City',
  role: 'VERIFIED',
  responds: 'Usually responds in ~2 hrs',
  avatar: 'https://i.pravatar.cc/120?img=12',
}

// Map a DB property document to the shape the detail components expect.
function toDetail(doc) {
  const locality = doc.location?.locality || ''
  const city = doc.location?.city || 'Jaipur'
  return {
    id: doc.id || doc._id,
    category: doc.category,
    title: doc.title,
    area: doc.area || '',
    location: [locality, city].filter(Boolean).join(', '),
    verified: !!doc.verified,
    photoCount: doc.photoCount || (doc.gallery?.thumbs?.length || 0) + 1,
    breadcrumb: ['Home', doc.category, locality || city, doc.title],
    badges: doc.badges || [],
    gallery: {
      main: doc.gallery?.main,
      thumbs: doc.gallery?.thumbs?.length ? doc.gallery.thumbs : staticProperty.gallery.thumbs,
    },
    keyDetails: doc.keyDetails?.length ? doc.keyDetails : staticProperty.keyDetails,
    amenities: doc.amenities?.length ? doc.amenities : staticProperty.amenities,
    about: doc.description || '',
    distances: doc.distances?.length ? doc.distances : staticProperty.distances,
    priceLabel: doc.priceLabel || null,
    agent: DEFAULT_AGENT,
  }
}

async function getProperty(slug) {
  try {
    await dbConnect()
    const doc = await Property.findOne({ slug }).lean()
    if (doc) return toDetail(serialize(doc))
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
