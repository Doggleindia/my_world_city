import Link from 'next/link'
import { Heart, MapPin, ArrowRight } from 'lucide-react'
import SaveButton from '@/components/SaveButton'
import ShareButton from '@/components/ShareButton'
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
    if (docs.length) {
      return docs.map((d) => {
        const c = toPropertyCard(d)
        return { id: c.id, tag: c.tag, title: c.title, loc: c.loc, img: c.img, href: c.href }
      })
    }
  } catch {
    // DB unavailable — fall back to static content.
  }
  return staticFeatured.map((f) => ({ ...f, href: '/find-property' }))
}

export default async function FeaturedProperties() {
  const featured = await getFeatured()
  return (
    <section className="bg-[#f5f6f8]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[30px] font-extrabold tracking-tight text-navy-900 sm:text-[34px]">
              Featured Properties
            </h2>
            <p className="mt-1.5 text-[14.5px] text-slate-500">
              Curated premium listings with verified details and direct owner contact.
            </p>
          </div>
          <Link
            href="/find-property"
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[14px] font-semibold text-brand shadow-sm transition hover:border-brand"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* four across on desktop keeps each card ~290px wide */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.slice(0, 4).map((p, i) => (
            <article
              key={i}
              className="group flex flex-col rounded-2xl bg-white p-3 shadow-[0_4px_18px_-6px_rgba(8,26,51,0.14)] transition hover:shadow-card"
            >
              {/* image is inset in the card, not bled to the edges */}
              <Link href={p.href} className="block overflow-hidden rounded-xl">
                <img
                  src={p.img}
                  alt={p.title}
                  className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </Link>

              <div className="flex flex-1 flex-col px-2 pb-1 pt-4">
                <span className="self-start rounded-md bg-brand/10 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-brand">
                  {p.tag}
                </span>
                <Link href={p.href} className="mt-2.5 block">
                  <h3 className="text-[17px] font-bold text-navy-900 transition group-hover:text-brand">
                    {p.title}
                  </h3>
                </Link>
                <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-slate-500">
                  <MapPin className="h-4 w-4 shrink-0" /> {p.loc}
                </p>

                <div className="mt-5 flex items-center gap-2.5">
                  {p.id ? (
                    <SaveButton
                      id={p.id}
                      size={17}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 hover:bg-slate-200"
                    />
                  ) : (
                    <button
                      aria-label="Save"
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-400 transition hover:bg-slate-200 hover:text-ember"
                    >
                      <Heart className="h-[17px] w-[17px]" />
                    </button>
                  )}
                  <Link
                    href={p.href}
                    className="flex-1 rounded-full bg-brand-800 py-2.5 text-center text-[13.5px] font-semibold text-white transition hover:bg-navy-700"
                  >
                    Details
                  </Link>
                  <ShareButton
                    url={p.href}
                    title={p.title}
                    size={17}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-brand"
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
