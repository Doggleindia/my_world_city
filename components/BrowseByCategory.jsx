import Link from 'next/link'
import { categories } from '../data'

export default function BrowseByCategory() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-[30px] font-extrabold tracking-tight text-navy-900 sm:text-[34px]">
          Browse by Category
        </h2>

        <div className="mt-8 grid grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.title}
              href={`/find-property?category=${encodeURIComponent(c.title)}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-[22px]"
            >
              <img
                src={c.img}
                alt={c.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              {/* colour wash — photo stays visible through the middle */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `linear-gradient(180deg, ${c.tint[0]} 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 52%, ${c.tint[1]} 100%)`,
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="text-[26px] font-bold leading-tight text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.25)]">
                  {c.title}
                </h3>
                <p className="mt-1 text-[13px] font-semibold text-white/90">{c.listings}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
