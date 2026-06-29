import Link from 'next/link'
import { categories } from '../data'

export default function BrowseByCategory() {
  return (
    <section className="bg-[#0a0f17]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Browse by Category</h2>

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.title}
              href={`/find-property?category=${encodeURIComponent(c.title)}`}
              className="group relative h-44 overflow-hidden rounded-2xl"
            >
              <img
                src={c.img}
                alt={c.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <h3 className="text-lg font-bold text-white">{c.title}</h3>
                <p className="text-[12px] text-slate-200/90">{c.listings}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
