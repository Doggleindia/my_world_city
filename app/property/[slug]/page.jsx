import { notFound } from 'next/navigation'
import { Check, Mail, MapPin, Phone, Ruler, ShieldCheck } from 'lucide-react'
import TopBar from '@/components/TopBar'
import Navbar from '@/components/Navbar'
import PhotoLightbox from '@/components/property/PhotoLightbox'
import PropertyHeroBar from '@/components/property/PropertyHeroBar'
import PropertyLocation from '@/components/property/PropertyLocation'
import EnquireForm from '@/components/property/EnquireForm'
import ShareButton from '@/components/ShareButton'
import ContactButton from '@/components/contact/ContactButton'
import OwnershipSteps from '@/components/property/OwnershipSteps'
import SiteFooter from '@/components/property/SiteFooter'
import { ownershipSteps } from '@/data'
import { dbConnect } from '@/lib/db'
import Property from '@/lib/models/Property'
import User from '@/lib/models/User' // registered for populate
import { getSession } from '@/lib/auth/session'
import { formatPrice } from '@/lib/formatPrice'

export const dynamic = 'force-dynamic'

const DEFAULT_AGENT = {
  name: 'My World City',
  role: 'Verified listing team',
  phone: null,
  email: null,
  avatar: null,
}

// The spec rows shown in the Availability table and the Features list.
function buildSpecs(doc) {
  const d = doc.details || {}
  const m = doc.meta || {}
  const rows = []
  const push = (l, v) => { if (v !== undefined && v !== null && v !== '') rows.push([l, String(v)]) }

  push('Listing type', doc.listingType === 'rent' ? 'For lease' : 'For sale')
  push('Category', doc.category)
  push('Configuration', Array.isArray(m.configuration) ? m.configuration.join(', ') : m.configuration)
  push('Bedrooms', d.bedrooms)
  push('Bathrooms', d.bathrooms)
  push('Built-up area', d.builtUpArea || doc.area)
  push('Carpet area', d.carpetArea)
  push('Floor', d.floorNumber ? `${d.floorNumber}${d.totalFloors ? ` of ${d.totalFloors}` : ''}` : null)
  push('Facing', d.facing)
  push('Furnishing', d.furnishing)
  push('Possession', d.possession || m.possessionDate)
  push('Parking', d.parking)
  push('Price', formatPrice(doc.priceLabel))
  if (d.negotiable !== undefined && d.negotiable !== null) push('Negotiable', d.negotiable ? 'Yes' : 'No')
  return rows
}

function toDetail(doc) {
  const locality = doc.location?.locality || ''
  const city = doc.location?.city || 'Jaipur'
  const m = doc.meta || {}
  const owner = doc.ownerId && typeof doc.ownerId === 'object' ? doc.ownerId : null

  // Whoever the buyer should actually speak to about this listing.
  const contacts = owner
    ? [{
        name: owner.name || 'Property owner',
        role: 'Property owner',
        phone: owner.phone || null,
        email: owner.email || null,
        avatar: owner.avatar || null,
      }]
    : [DEFAULT_AGENT]

  // "Nearby" comes from the listing wizard; older records use `distances`.
  const nearby = (Array.isArray(m.nearby) && m.nearby.length
    ? m.nearby.map((n) => ({
        label: n.name || n.type,
        value: n.distanceKm != null ? `${n.distanceKm} km away` : n.type,
      }))
    : doc.distances || []
  ).filter((n) => n.label)

  return {
    id: String(doc._id || doc.id || ''),
    title: doc.title,
    category: doc.category,
    listingType: doc.listingType,
    availability: doc.details?.possession || m.possessionDate || 'Available now',
    priceLabel: formatPrice(doc.priceLabel),
    area: doc.area || doc.details?.builtUpArea || '',
    address: [doc.address, locality, city, doc.pincode].filter(Boolean).join(', '),
    mapQuery: [doc.address, locality, city, 'Rajasthan'].filter(Boolean).join(', '),
    verified: !!doc.verified,
    rera: !!doc.rera,
    about: doc.description || '',
    amenities: (doc.amenities || []).map((a) => a?.label || a?.name || a).filter(Boolean),
    specs: buildSpecs(doc),
    features: doc.badges || [],
    photos: [doc.gallery?.main, ...(doc.gallery?.thumbs || [])].filter(Boolean),
    photoCount: doc.photoCount || (doc.gallery?.thumbs?.length || 0) + 1,
    nearby,
    contacts,
  }
}

async function getProperty(slug) {
  try {
    await dbConnect()
    const doc = await Property.findOne({ slug }).populate('ownerId', 'name phone email avatar').lean()
    if (doc) {
      if (doc.status !== 'active') {
        const session = await getSession()
        const ownerId = String(doc.ownerId?._id || doc.ownerId || '')
        const isOwner = session && ownerId === session.uid
        const isAdmin = session && (session.roles || []).includes('admin')
        if (!isOwner && !isAdmin) return null
      }
      return toDetail(doc)
    }
  } catch {
    // DB unavailable
  }
  return null
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const p = await getProperty(slug)
  return p
    ? { title: `${p.title} — My World City`, description: p.about?.slice(0, 150) || p.address }
    : { title: 'Property not found — My World City' }
}

export default async function PropertyDetailPage({ params }) {
  const { slug } = await params
  const p = await getProperty(slug)
  if (!p) notFound()

  // Count the visit once per render. getProperty() also runs inside
  // generateMetadata(), so counting in there charged every visit twice.
  if (p.id) Property.updateOne({ _id: p.id }, { $inc: { views: 1 } }).catch(() => {})

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <TopBar />
      <Navbar cta="brand" />

      {/* ---------- hero ---------- */}
      <div className="relative">
        <img
          src={p.photos[0]}
          alt={p.title}
          className="h-[260px] w-full object-cover sm:h-[360px] lg:h-[440px]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-900/35 to-transparent" />

        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-3 px-4 pb-4 sm:px-6 sm:pb-5">
            <PropertyHeroBar id={p.id} />
            {p.photos.length > 0 && (
              <PhotoLightbox images={p.photos} count={p.photoCount} trigger="chip" />
            )}
          </div>
        </div>
      </div>

      {/* ---------- headline + enquire rail ---------- */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <h1 className="text-[26px] font-bold leading-tight text-navy-900 sm:text-[32px]">{p.title}</h1>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <ShareButton
                url={`/property/${slug}`}
                title={p.title}
                label="Share"
                size={17}
                className="inline-flex items-center gap-2 rounded border border-brand-800 px-4 py-2.5 text-[13.5px] font-bold text-brand-800 transition hover:bg-brand-800 hover:text-white"
              />
              {p.verified && (
                <span className="inline-flex items-center gap-1.5 rounded bg-emerald-50 px-3 py-2 text-[12.5px] font-bold text-emerald-700">
                  <ShieldCheck className="h-4 w-4" /> Verified by My World City
                </span>
              )}
            </div>

            <p className="mt-7 text-[14.5px] font-bold text-navy-900">{p.address}</p>

            <p className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-[14px]">
              <span className="font-bold text-navy-900">{p.category}</span>
              <span className="text-slate-600">{p.availability}</span>
              {p.priceLabel && <span className="font-bold text-brand-800">{p.priceLabel}</span>}
            </p>

            {p.area && (
              <p className="mt-2.5 flex items-center gap-2 text-[14px] text-navy-900">
                <Ruler className="h-[18px] w-[18px] -rotate-45 text-navy-800" /> {p.area}
              </p>
            )}

            {p.mapQuery && (
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.mapQuery)}`}
                target="_blank" rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-brand-800 hover:text-brand">
                See map <MapPin className="h-4 w-4" />
              </a>
            )}

            {/* ---------- about ---------- */}
            {p.about && (
              <section className="mt-10">
                <h2 className="text-[18px] font-bold text-navy-900">About</h2>
                <p className="mt-3 max-w-2xl whitespace-pre-line text-[14px] leading-relaxed text-slate-600">
                  {p.about}
                </p>
              </section>
            )}

            {/* ---------- amenities ---------- */}
            {p.amenities.length > 0 && (
              <section className="mt-10">
                <h2 className="text-[18px] font-bold text-navy-900">Amenities</h2>
                <ul className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                  {p.amenities.map((a, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-[13.5px] text-slate-700">
                      <Check className="h-4 w-4 shrink-0 text-ember" /> {a}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* ---------- features ---------- */}
            {p.features.length > 0 && (
              <section className="mt-10">
                <h2 className="text-[18px] font-bold text-navy-900">Property details</h2>
                <h3 className="mt-3 text-[14px] font-bold text-navy-900">Features</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-[13.5px] text-slate-700 marker:text-slate-400">
                  {p.features.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </section>
            )}
          </div>

          {/* ---------- enquire rail ---------- */}
          <aside className="min-w-0">
            <div className="rounded bg-slate-100 p-5 lg:sticky lg:top-24">
              <h2 className="text-[17px] font-bold text-navy-900">Enquire about this property</h2>

              <div className="mt-5 space-y-5">
                {p.contacts.map((c, i) => <Contact key={i} c={c} />)}
              </div>

              <ContactButton
                topic={`Property — ${p.title}`}
                title="Enquire"
                subtitle="Leave your number and our team will call you back."
                className="mt-6 block w-full rounded bg-cyan py-3 text-center text-[14.5px] font-bold text-navy-900 transition hover:bg-cyan-600"
              >
                Enquire
              </ContactButton>
            </div>
          </aside>
        </div>
      </div>

      {/* ---------- location ---------- */}
      <PropertyLocation query={p.mapQuery} nearby={p.nearby} />

      {/* ---------- availability / specification ---------- */}
      {p.specs.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h2 className="text-[26px] font-bold text-navy-900 sm:text-[30px]">Availability</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-left">
              <thead>
                <tr className="bg-brand-800 text-white">
                  <th className="px-5 py-3.5 text-[13px] font-bold">Detail</th>
                  <th className="px-5 py-3.5 text-[13px] font-bold">Value</th>
                </tr>
              </thead>
              <tbody>
                {p.specs.map(([k, v]) => (
                  <tr key={k} className="border-b border-slate-200">
                    <td className="px-5 py-3.5 text-[13.5px] text-slate-600">{k}</td>
                    <td className="px-5 py-3.5 text-[13.5px] font-semibold text-navy-900">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ---------- contact + enquiry form ---------- */}
      <section className="bg-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h2 className="text-[26px] font-bold text-navy-900 sm:text-[30px]">Contact us</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {p.contacts.map((c, i) => <Contact key={i} c={c} />)}
          </div>

          <h2 className="mt-12 text-[26px] font-bold text-navy-900 sm:text-[30px]">Make an enquiry</h2>
          <div className="mt-6 max-w-4xl">
            <EnquireForm propertyId={p.id} propertyTitle={p.title} />
          </div>
        </div>
      </section>

      <OwnershipSteps steps={ownershipSteps} />
      <SiteFooter />
    </main>
  )
}

function Contact({ c }) {
  const initials = (c.name || 'MW').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className="flex items-start gap-3.5">
      {c.avatar ? (
        <img src={c.avatar} alt="" className="h-[74px] w-[64px] shrink-0 rounded object-cover" />
      ) : (
        <span className="grid h-[74px] w-[64px] shrink-0 place-items-center rounded bg-brand/10 text-[18px] font-bold text-brand">
          {initials}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-[14px] font-bold text-navy-900">{c.name}</p>
        <p className="text-[13px] text-slate-500">{c.role}</p>
        {c.phone && (
          <a href={`tel:+91${c.phone}`} className="mt-1.5 flex items-center gap-2 text-[12.5px] text-brand hover:underline">
            <Phone className="h-3.5 w-3.5 shrink-0" /> +91 {c.phone}
          </a>
        )}
        {c.email && (
          <a href={`mailto:${c.email}`} className="mt-1 flex items-center gap-2 text-[12.5px] text-brand hover:underline">
            <Mail className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{c.email}</span>
          </a>
        )}
      </div>
    </div>
  )
}
