'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import PropertyCard from './PropertyCard'

export default function ListingCarousel({ title, items }) {
  const scroller = useRef(null)

  const scrollBy = (dir) => {
    scroller.current?.scrollBy({ left: dir * 330, behavior: 'smooth' })
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-navy-800 sm:text-[26px]">{title}</h2>
        <div className="flex gap-3">
          <button
            onClick={() => scrollBy(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-brand/40 text-brand transition hover:bg-brand/5"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scrollBy(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-brand/40 text-brand transition hover:bg-brand/5"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div ref={scroller} className="no-scrollbar mt-6 flex gap-5 overflow-x-auto pb-2">
        {items.map((p) => (
          <PropertyCard key={p.id} {...p} />
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <button className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-5 py-2 text-[13px] font-semibold text-navy-800 transition hover:border-brand hover:text-brand">
          Load More <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  )
}
