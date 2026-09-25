import Link from 'next/link'
import { Bookmark, ChevronRight, Ruler } from 'lucide-react'
import SaveButton from '@/components/SaveButton'
import { featured as staticFeatured } from '../data'
import { dbConnect } from '@/lib/db'
import Property from '@/lib/models/Property'

// Card copy, mapped from what a listing actually holds:
//   availability  — "Leasing now" / "For sale", from listingType
//   type          — the category (Residential, Commercial, …)
//   size          — the area the owner entered
const availabilityOf = (p) => (p.listingType === 'rent' ? 'Leasing now' : 'For sale')

const addressOf = (p) =>
  [p.location?.locality, p.location?.city].filter(Boolean).join(', ') || p.location?.city || ''

async function getFeatured() {
  try {
    await dbConnect()
    const docs = await Property.find({ status: 'active', featured: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean()
    if (docs.length) {
      return docs.map((p) => ({
        id: String(p._id),
        title: p.title,
        address: addressOf(p),
        availability: availabilityOf(p),
        type: p.category || '',
        size: p.area || '',
        img: p.gallery?.main || p.gallery?.thumbs?.[0] || '',
        href: `/property/${p.slug}`,
      }))
    }
  } catch {
    // DB unavailable — fall back to static content so the page still renders.
  }
  return staticFeatured.map((f) => {
    const [locality, size] = f.loc.split(' — ')
    return {
      id: null,
      title: f.title,
      address: `${locality}, Jaipur`,
      availability: 'For sale',
      type: f.tag.charAt(0) + f.tag.slice(1).toLowerCase(),
      size: size || '',
      img: f.img,
      href: '/find-property',
    }
  })
}

export default async function FeaturedProperties() {
  const featured = await getFeatured()

  return (
    <section className="bg-[#f2f4f7]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-[30px] font-bold tracking-tight text-navy-900 sm:text-[38px]">
            Featured Properties
          </h2>
          <Link
            href="/find-property"
            className="shrink-0 whitespace-nowrap rounded-full border border-navy-800/25 bg-white px-6 py-2.5 text-[15px] font-semibold text-navy-900 transition hover:border-navy-800 hover:bg-navy-900 hover:text-white"
          >
            View all
          </Link>
        </div>

        {/* three across on desktop, two rows of three */}
        <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.slice(0, 6).map((p, i) => (
            <article
              key={p.id || i}
              className="group flex flex-col overflow-hidden rounded-xl bg-white p-4 shadow-[0_2px_14px_-8px_rgba(8,26,51,0.22)] transition hover:shadow-card"
            >
              <div className="relative overflow-hidden rounded-lg">
                <Link href={p.href} className="block">
                  <img
                    src={p.img}
                    alt={p.title}
                    className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </Link>
                {/* save badge, tucked into the top-right corner of the photo.
                    The static fallback has no ids, so it shows a plain mark. */}
                <span className="absolute right-0 top-0 grid h-[52px] w-[52px] place-items-center bg-[#4fd1e0]">
                  {p.id ? (
                    <SaveButton id={p.id} size={20} className="text-navy-900 hover:text-navy-900/70" />
                  ) : (
                    <Bookmark className="h-5 w-5 text-navy-900" aria-hidden="true" />
                  )}
                </span>
              </div>

              <div className="flex flex-1 flex-col pt-4">
                <Link href={p.href}>
                  <h3 className="text-[19px] font-bold leading-snug text-navy-900 transition group-hover:text-brand">
                    {p.title}
                  </h3>
                </Link>

                {p.address && (
                  <p className="mt-2 text-[14px] leading-relaxed text-slate-500">{p.address}</p>
                )}

                <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px]">
                  <span className="font-bold text-navy-900">{p.availability}</span>
                  {p.type && <span className="text-slate-500">{p.type}</span>}
                </p>

                {p.size && (
                  <p className="mt-2.5 flex items-center gap-2 text-[14px] text-navy-900">
                    <Ruler className="h-[18px] w-[18px] shrink-0 -rotate-45 text-navy-800" />
                    {p.size}
                  </p>
                )}

                {/* mt-auto keeps every card's link on the same baseline */}
                <Link
                  href={p.href}
                  className="mt-auto inline-flex items-center gap-1 pt-4 text-[14px] font-bold text-brand-800 transition hover:gap-2 hover:text-brand"
                >
                  Read more <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
