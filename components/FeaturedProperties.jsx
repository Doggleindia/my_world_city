import Link from 'next/link'
import PropertyCard from '@/components/listing/PropertyCard'
import { featured as staticFeatured } from '../data'
import { dbConnect } from '@/lib/db'
import Property from '@/lib/models/Property'
import { toPropertyCard } from '@/lib/serialize'

async function getFeatured() {
  try {
    await dbConnect()
    const docs = await Property.find({ status: 'active', featured: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean()
    if (docs.length) return docs.map(toPropertyCard)
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
    <section className="bg-[#f6f7f9]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-[clamp(32px,4.6vw,58px)] font-bold leading-[1.1] text-[#0A0A0A]">
            Featured Properties
          </h2>
          <Link
            href="/find-property"
            className="shrink-0 whitespace-nowrap rounded-full border border-slate-300 bg-white px-7 py-2.5 text-[17px] font-semibold text-brand-800 transition hover:border-brand-800 hover:bg-brand-800 hover:text-white sm:px-8 sm:py-3 sm:text-[20px]"
          >
            View all
          </Link>
        </div>

        {/* three across on desktop, two rows of three */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-8">
          {featured.slice(0, 6).map((p, i) => (
            <PropertyCard key={p.id || i} {...p} />
          ))}
        </div>
      </div>
    </section>
  )
}
