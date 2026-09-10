'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Building2, ChevronLeft, ChevronRight } from 'lucide-react'
import { insights } from '../data'

export default function Insights() {
  const rail = useRef(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)
  const [active, setActive] = useState(0)
  // How many distinct positions the rail actually has at this width — 4 on a
  // phone (one card per view), 2 on a desktop showing three at a time.
  const [pages, setPages] = useState(insights.length)

  // Works out where we are in the rail so the arrows can disable themselves and
  // the dots can show which article is in view.
  const measure = useCallback(() => {
    const el = rail.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setAtStart(el.scrollLeft <= 4)
    setAtEnd(el.scrollLeft >= max - 4)
    const card = el.firstElementChild
    const step = card ? card.getBoundingClientRect().width + 24 : 1
    const perView = Math.max(1, Math.round(el.clientWidth / step))
    const count = Math.max(1, insights.length - perView + 1)
    setPages(count)
    setActive(Math.min(count - 1, Math.round(el.scrollLeft / step)))
  }, [])

  useEffect(() => {
    const el = rail.current
    if (!el) return
    measure()
    el.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      el.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [measure])

  // One card per press, so you can step from one article to the previous one.
  const page = (dir) => {
    const el = rail.current
    if (!el) return
    const card = el.firstElementChild
    const step = card ? card.getBoundingClientRect().width + 24 : el.clientWidth
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  const goTo = (i) => {
    const el = rail.current
    if (!el) return
    const card = el.firstElementChild
    const step = card ? card.getBoundingClientRect().width + 24 : el.clientWidth
    el.scrollTo({ left: i * step, behavior: 'smooth' })
  }

  const arrow =
    'grid h-12 w-12 place-items-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-35'

  return (
    <section className="bg-[#f5f6f8]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-[34px] font-extrabold tracking-tight text-navy-900 sm:text-[40px]">
            Our Latest Insights
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[17px] leading-relaxed text-slate-500">
            Get the latest insights on cutting-edge projects, smart living solutions, and
            real-estate technology breakthroughs
          </p>
        </div>

        {/* Article rail — one card per step, snapping so it always lands square */}
        <div
          ref={rail}
          className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2"
        >
          {insights.map((p) => (
            <article
              key={p.slug}
              className="flex w-[86%] shrink-0 snap-start flex-col rounded-2xl bg-white p-3 shadow-[0_4px_18px_-6px_rgba(8,26,51,0.14)] transition hover:shadow-card sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
            >
              {/* image is inset inside the card, not full-bleed */}
              <div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl">
                <img src={p.img} alt="" className="h-full w-full object-cover" />
                <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm">
                  <Building2 className="h-3.5 w-3.5" /> Company
                </span>
              </div>

              <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
                <h3 className="text-[17px] font-bold leading-snug text-navy-900">{p.title}</h3>
                <p className="mb-6 mt-3 line-clamp-4 text-[14px] leading-relaxed text-slate-500">
                  {p.desc}
                </p>
                {/* mt-auto keeps every card's button on the same baseline */}
                <Link
                  href={`/insights/${p.slug}`}
                  className="mt-auto self-start rounded-full border-[1.5px] border-navy-900 px-5 py-2 text-[13px] font-semibold text-navy-900 transition hover:bg-navy-900 hover:text-white"
                >
                  Read more
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Position dots — makes it obvious there is more to see, and where you are */}
        <div className="mt-7 flex items-center justify-center gap-2">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to position ${i + 1}`}
              aria-current={i === active ? 'true' : undefined}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === active ? 'w-7 bg-navy-800' : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>

        {/* Prev / next — these now move the rail one article at a time */}
        <div className="mt-5 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => page(-1)}
            disabled={atStart}
            aria-label="Previous article"
            className={`${arrow} border-[1.5px] border-navy-800 bg-white text-navy-800 enabled:hover:bg-navy-800 enabled:hover:text-white`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => page(1)}
            disabled={atEnd}
            aria-label="Next article"
            className={`${arrow} bg-navy-800 text-white enabled:hover:bg-navy-700`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/insights"
            className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand transition hover:underline"
          >
            View all insights <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
