import { notFound } from 'next/navigation'
import { Building, LayoutGrid, Mail, MapPin, Phone } from 'lucide-react'
import TopBar from '@/components/TopBar'
import Navbar from '@/components/Navbar'
import PhotoLightbox from '@/components/property/PhotoLightbox'
import PropertyHeroBar from '@/components/property/PropertyHeroBar'
import PropertyLocation from '@/components/property/PropertyLocation'
import EnquireForm from '@/components/property/EnquireForm'
import ExportPdfButton from '@/components/property/ExportPdfButton'
import ShareButton from '@/components/ShareButton'
import ContactButton from '@/components/contact/ContactButton'
import OwnershipSteps from '@/components/property/OwnershipSteps'
import SiteFooter from '@/components/property/SiteFooter'
import { iconFor } from '@/components/property/icons'
import { ownershipSteps } from '@/data'
import { dbConnect } from '@/lib/db'
import Property from '@/lib/models/Property'
import User from '@/lib/models/User' // registered for populate
import { getSession } from '@/lib/auth/session'
import { formatPrice } from '@/lib/formatPrice'
import { withDefaults } from '@/lib/propertyDefaults'
import { getPublicExperts } from '@/lib/experts'

export const dynamic = 'force-dynamic'

// Key facts the owner entered, shown under the structural features.
function buildSpecs(doc) {
  const d = doc.details || {}
  const m = doc.meta || {}
  const rows = []
  const push = (l, v) => { if (v !== undefined && v !== null && v !== '') rows.push(`${l}: ${v}`) }

  push('Configuration', Array.isArray(m.configuration) ? m.configuration.join(', ') : m.configuration)
  push('Bedrooms', d.bedrooms)
  push('Bathrooms', d.bathrooms)
  push('Built-up area', d.builtUpArea)
  push('Carpet area', d.carpetArea)
  push('Floor', d.floorNumber ? `${d.floorNumber}${d.totalFloors ? ` of ${d.totalFloors}` : ''}` : null)
  push('Facing', d.facing)
  push('Furnishing', d.furnishing)
  push('Parking', d.parking)
  if (d.negotiable) push('Price', 'Negotiable')
  return rows
}

function toDetail(doc) {
  const locality = doc.location?.locality || ''
  const city = doc.location?.city || 'Jaipur'
  const m = doc.meta || {}
  const owner = doc.ownerId && typeof doc.ownerId === 'object' ? doc.ownerId : null

  // "Nearby" comes from the listing wizard; older records use `distances`.
  const nearby = (Array.isArray(m.nearby) && m.nearby.length
    ? m.nearby.map((n) => ({
        label: n.name || n.type,
        value: n.distanceKm != null ? `${n.distanceKm} km away` : n.type,
      }))
    : doc.distances || []
  ).filter((n) => n.label)

  return withDefaults({
    id: String(doc._id || doc.id || ''),
    slug: doc.slug,
    title: doc.title,
    category: doc.category,
    listingType: doc.listingType,
    availability: doc.details?.possession || m.possessionDate || 'Available now',
    priceLabel: formatPrice(doc.priceLabel),
    area: doc.area || doc.details?.builtUpArea || '',
    address: [doc.address, locality, city, doc.pincode].filter(Boolean).join(', '),
    mapQuery: [doc.address, locality, city, 'Rajasthan'].filter(Boolean).join(', '),
    verified: !!doc.verified,
    about: doc.description || '',
    amenities: (doc.amenities || []).filter((a) => a?.label),
    specs: buildSpecs(doc),
    photos: [doc.gallery?.main, ...(doc.gallery?.thumbs || [])].filter(Boolean),
    photoCount: doc.photoCount || (doc.gallery?.thumbs?.length || 0) + 1,
    nearby,
    owner: owner
      ? {
          name: owner.name || 'Property owner',
          role: 'Property owner',
          phone: owner.phone || null,
          email: owner.email || null,
          avatar: owner.avatar || null,
        }
      : null,
  })
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

const chip =
  'inline-flex min-w-[112px] items-center gap-1.5 border border-white bg-white px-2.5 py-1.5 text-[12px] font-bold text-brand-800 shadow-sm transition hover:bg-slate-50 sm:min-w-0 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-[15px]'
const outlined =
  'inline-flex items-center gap-2 border border-brand-800 bg-white px-5 py-3 text-[15px] font-bold text-brand-800 transition hover:bg-brand-800 hover:text-white'

export default async function PropertyDetailPage({ params }) {
  const { slug } = await params
  const p = await getProperty(slug)
  if (!p) notFound()
  const experts = await getPublicExperts()

  // Count the visit once per render. getProperty() also runs inside
  // generateMetadata(), so counting in there charged every visit twice.
  if (p.id) Property.updateOne({ _id: p.id }, { $inc: { views: 1 } }).catch(() => {})

  // Everything the downloadable brochure needs, kept serialisable.
  const pdf = {
    slug: p.slug,
    title: p.title,
    address: p.address,
    category: p.category,
    availability: p.availability,
    areaLine: p.areaLine,
    about: p.about,
    amenities: p.amenities.map((a) => a.label),
    sustainability: p.sustainability.map((a) => a.label),
    structural: [...p.structural, ...p.specs],
    units: p.units,
    nearby: p.nearby.map((n) => ({ label: n.label, value: n.value })),
    contacts: p.contacts.map((c) => ({ name: c.name, role: c.role, phone: c.phone, email: c.email })),
    photoUrl: p.photos[0] || null,
  }

  return (
    <main className="min-h-screen bg-white text-[#0A0A0A]">
      <TopBar />
      <Navbar cta="brand" />

      {/* ---------- hero ---------- */}
      {/* edge-to-edge photo; the buttons stay inside the page's content width */}
      <div className="relative">
        <img
          src={p.photos[0]}
          alt={p.title}
          className="h-[260px] w-full object-cover sm:h-[400px] lg:h-[520px]"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-navy-900/45 to-transparent" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto flex max-w-7xl items-end justify-between gap-2 p-3 sm:flex-wrap sm:gap-3 sm:px-6 sm:pb-7">
            <PropertyHeroBar id={p.id} />
            {/* on phones the chips stack in a column against the right edge */}
            <div className="ml-auto flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-4">
              {p.photos.length > 0 && (
                <PhotoLightbox images={p.photos} count={p.photoCount} trigger="chip" />
              )}
              <ExportPdfButton data={pdf} variant="brochure" icon="file" badge={1} className={chip}>
                Brochures
              </ExportPdfButton>
              <ExportPdfButton data={pdf} variant="siteplan" icon="map" badge={1} className={chip}>
                Plans
              </ExportPdfButton>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- headline + enquire rail ---------- */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
          <div className="min-w-0">
            <h1 className="text-[32px] text-navy-900 sm:text-[40px]">{p.title}</h1>

            <div className="mt-6 flex flex-wrap items-center gap-6">
              <ExportPdfButton data={pdf} variant="brochure" className={outlined}>
                Export pdf
              </ExportPdfButton>
              <ShareButton
                url={`/property/${slug}`}
                title={p.title}
                label="Share"
                size={18}
                className="inline-flex items-center text-[15px] font-bold text-brand-800 hover:text-brand"
              />
            </div>

            <p className="mt-9 text-[17px] font-bold text-navy-900">{p.address}</p>

            <p className="mt-3 flex flex-wrap items-center gap-2">
              <span className="border border-slate-200 bg-white px-3 py-1.5 text-[14px] font-medium text-navy-900">{p.category}</span>
              <span className="border border-slate-200 bg-white px-3 py-1.5 text-[14px] font-medium text-navy-900">{p.availability}</span>
            </p>

            <p className="mt-5 flex items-center gap-3 text-[17px] text-navy-900">
              <LayoutGrid className="h-5 w-5 shrink-0 text-navy-800" /> {p.areaLine}
            </p>

            <p className="mt-4 flex flex-wrap items-center gap-x-7 gap-y-2 text-[16px] font-bold text-brand-800">
              <a href="#location" className="inline-flex items-center gap-2 hover:text-brand">
                <MapPin className="h-[18px] w-[18px]" /> See map
              </a>
              <a href="#availability" className="inline-flex items-center gap-2 hover:text-brand">
                <Building className="h-[18px] w-[18px]" /> View available spaces
              </a>
            </p>

            {/* ---------- about ---------- */}
            <section className="mt-10 border-t border-slate-200 pt-10">
              <h2 className="text-[26px] text-navy-900">About this facility</h2>
              <p className="mt-5 whitespace-pre-line text-[18px] leading-[1.6] text-[#0A0A0A]">{p.about}</p>
              <p className="mt-5 text-[14px] italic text-[#0A0A0A]">*indicative distances and drive times</p>
            </section>

            {/* ---------- amenities ---------- */}
            <FeatureList title="Amenities" items={p.amenities} />

            {/* ---------- sustainability ---------- */}
            <FeatureList title="Sustainability features" items={p.sustainability} />

            {/* ---------- floorplans ---------- */}
            <section className="mt-10 border-t border-slate-200 pt-10">
              <h2 className="text-[26px] text-navy-900">Available Floorplans</h2>
              <div className="mt-6">
                <ExportPdfButton data={pdf} variant="siteplan" icon="map" badge={1} className={outlined}>
                  Download Site Plans
                </ExportPdfButton>
              </div>
            </section>

            {/* ---------- property details ---------- */}
            <section className="mt-10 border-t border-slate-200 pt-10">
              <h2 className="text-[26px] text-navy-900">Property details</h2>
              <h3 className="mt-5 text-[12px] font-bold uppercase tracking-wide text-navy-900">Structural features</h3>
              <Bullets items={p.structural} />
              {p.specs.length > 0 && (
                <>
                  <h3 className="mt-6 text-[12px] font-bold uppercase tracking-wide text-navy-900">Key details</h3>
                  <Bullets items={p.specs} />
                </>
              )}
            </section>
          </div>

          {/* ---------- enquire rail ---------- */}
          <aside className="min-w-0">
            <div className="border border-slate-200 bg-white p-7 shadow-[0_2px_16px_-10px_rgba(8,26,51,0.25)] lg:sticky lg:top-24">
              <h2 className="text-[26px] text-navy-900">Enquire about this property</h2>

              <div className="mt-7 space-y-7">
                {p.contacts.map((c, i) => <Contact key={i} c={c} />)}
              </div>

              <ContactButton
                topic={`Property — ${p.title}`}
                title="Enquire"
                subtitle="Leave your number and our team will call you back."
                className="mt-8 block w-full bg-brand-800 py-3.5 text-center text-[16px] font-bold text-white transition hover:bg-navy-700"
              >
                Enquire
              </ContactButton>
            </div>
          </aside>
        </div>
      </div>

      {/* ---------- location ---------- */}
      <div id="location">
        <PropertyLocation query={p.mapQuery} nearby={p.nearby} />
      </div>

      {/* ---------- availability ---------- */}
      <section id="availability" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h2 className="text-[30px] text-navy-900 sm:text-[34px]">Availability</h2>
        <div className="mt-7 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="bg-brand-800 text-white">
                <th className="px-5 py-4 text-[14px] font-bold">Unit Name</th>
                <th className="px-5 py-4 text-[14px] font-bold">Lettable Area (sq.m)</th>
                <th className="px-5 py-4 text-[14px] font-bold">Availability Status</th>
              </tr>
            </thead>
            <tbody>
              {p.units.map((u) => (
                <tr key={u.name} className="border-b border-slate-300">
                  <td className="px-5 py-5 text-[16px] font-bold text-navy-900">{u.name}</td>
                  <td className="px-5 py-5 text-[16px] text-[#0A0A0A]">{u.area}</td>
                  <td className="px-5 py-5 text-[16px] font-bold text-brand-800">{u.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------- contact + enquiry form ---------- */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="grid gap-10 border border-slate-200 bg-white px-6 py-10 shadow-[0_2px_16px_-10px_rgba(8,26,51,0.25)] sm:px-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-14">
          <div className="min-w-0">
            <h2 className="text-[30px] text-navy-900 sm:text-[34px]">Contact us</h2>
            <div className="mt-8 space-y-7">
              {p.contacts.map((c, i) => <Contact key={i} c={c} compact />)}
            </div>
          </div>
          <div className="min-w-0">
            <h2 className="text-[30px] text-navy-900 sm:text-[34px]">Make an enquiry</h2>
            <div className="mt-8">
              <EnquireForm propertyId={p.id} propertyTitle={p.title} />
            </div>
          </div>
        </div>
      </section>

      <OwnershipSteps steps={ownershipSteps} experts={experts} />
      <SiteFooter />
    </main>
  )
}

// Icon + label grid used for Amenities and Sustainability features.
function FeatureList({ title, items }) {
  if (!items?.length) return null
  return (
    <section className="mt-10 border-t border-slate-200 pt-10">
      <h2 className="text-[26px] text-navy-900">{title}</h2>
      <ul className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a, i) => {
          const Icon = iconFor(a.icon)
          return (
            <li key={i} className="flex items-center gap-3 text-[15px] text-navy-900">
              <Icon className="h-5 w-5 shrink-0 text-[#a3163c]" strokeWidth={2.25} /> {a.label}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Bullets({ items }) {
  return (
    <ul className="mt-3 space-y-2 text-[14px] leading-[1.5] text-[#0A0A0A]">
      {items.map((f, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" /> {f}
        </li>
      ))}
    </ul>
  )
}

function Contact({ c, compact = false }) {
  const initials = (c.name || 'MW').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  const size = compact ? 'h-[60px] w-[60px]' : 'h-[84px] w-[84px]'
  return (
    <div className="flex items-start gap-4">
      {c.avatar ? (
        <img src={c.avatar} alt="" className={`${size} shrink-0 object-cover`} />
      ) : (
        <span className={`grid ${size} shrink-0 place-items-center bg-brand/10 text-[20px] font-bold text-brand`}>
          {initials}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-[17px] font-bold text-navy-900">{c.name}</p>
        <p className="mt-0.5 text-[15px] text-[#0A0A0A]">{c.role}</p>
        {compact ? (
          <p className="mt-1.5 text-[14px] text-navy-900 [overflow-wrap:anywhere]">
            {c.phone && <a href={`tel:+91${c.phone}`} className="hover:underline">+91 {c.phone}</a>}
            {c.phone && c.email && ' • '}
            {c.email && <a href={`mailto:${c.email}`} className="hover:underline">{c.email}</a>}
          </p>
        ) : (
          <>
            {c.phone && (
              <a href={`tel:+91${c.phone}`} className="mt-2.5 flex items-center gap-2 text-[15px] text-navy-900 hover:underline">
                <Phone className="h-4 w-4 shrink-0 text-brand-800" /> +91 {c.phone}
              </a>
            )}
            {c.email && (
              <a href={`mailto:${c.email}`} className="mt-1.5 flex items-center gap-2 text-[15px] text-navy-900 hover:underline">
                <Mail className="h-4 w-4 shrink-0 text-brand-800" /> <span className="truncate">{c.email}</span>
              </a>
            )}
          </>
        )}
      </div>
    </div>
  )
}
