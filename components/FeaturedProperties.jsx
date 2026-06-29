import Link from 'next/link'
import { Heart, Share2, MapPin, ArrowRight } from 'lucide-react'
import { featured } from '../data'

export default function FeaturedProperties() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-navy-800 sm:text-3xl">Featured Properties</h2>
            <p className="mt-2 text-[14px] text-slate-500">
              Curated premium listings with verified details and direct owner contact.
            </p>
          </div>
          <Link
            href="/find-property"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-300 bg-white px-4 py-2 text-[13px] font-semibold text-navy-800 transition hover:border-brand hover:text-brand"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => (
            <article
              key={i}
              className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-card"
            >
              <Link href="/property" className="block h-44 w-full overflow-hidden">
                <img
                  src={p.img}
                  alt={p.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </Link>
              <div className="p-4">
                <span className="text-[10.5px] font-bold tracking-wide text-brand">{p.tag}</span>
                <Link href="/property" className="mt-1 block">
                  <h3 className="text-[16px] font-bold text-navy-800 transition hover:text-brand">{p.title}</h3>
                </Link>
                <p className="mt-1 flex items-center gap-1 text-[12.5px] text-slate-500">
                  <MapPin className="h-3.5 w-3.5" /> {p.loc}
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-ember hover:text-ember">
                    <Heart className="h-4 w-4" />
                  </button>
                  <Link
                    href="/property"
                    className="flex-1 rounded-lg bg-navy-800 py-2 text-center text-[13px] font-semibold text-white transition hover:bg-navy-700"
                  >
                    Details
                  </Link>
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-brand hover:text-brand">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
