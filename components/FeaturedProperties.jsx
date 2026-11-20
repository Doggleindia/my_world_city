import Link from 'next/link'
import PropertyCard from '@/components/listing/PropertyCard'
import FeaturedRow from '@/components/FeaturedRow'
import { featured as staticFeatured } from '../data'
import { dbConnect } from '@/lib/db'
import Property from '@/lib/models/Property'
import { toPropertyCard } from '@/lib/serialize'

const COUNT = 6

// Always six cards: featured listings first, then the newest
// active listings to top the grid up when fewer than six are flagged.
async function getFeatured() {
  try {
    await dbConnect()
    const docs = await Property.find({ status: 'active', featured: true })
      .sort({ createdAt: -1 })
      .limit(COUNT)
      .lean()
    if (docs.length < COUNT) {
      const fill = await Property.find({ status: 'active', _id: { $nin: docs.map((d) => d._id) } })
        .sort({ createdAt: -1 })
        .limit(COUNT - docs.length)
        .lean()
      docs.push(...fill)
    }
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
    <section className="bg-[#f3f5f8]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        {/* heading and "View all" share one line on every screen size */}
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[clamp(32px,4.6vw,58px)] font-bold leading-[1.1] text-[#0A0A0A]">
            Properties
          </h2>
          <Link
            href="/find-property"
            className="shrink-0 whitespace-nowrap rounded-full border border-slate-300 bg-white px-7 py-2.5 text-[17px] font-semibold text-brand-800 transition hover:border-brand-800 hover:bg-brand-800 hover:text-white sm:px-8 sm:py-3 sm:text-[20px]"
          >
            View all
          </Link>
        </div>

        {/* one swipeable row: ~one card on phones, two on tablets, three on desktop */}
        <FeaturedRow>
          {featured.slice(0, 6).map((p, i) => (
            <PropertyCard
              key={p.id || i}
              {...p}
              className="w-[84%] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
            />
          ))}
        </FeaturedRow>
      </div>
    </section>
  )
}
