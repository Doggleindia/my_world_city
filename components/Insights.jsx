import Link from 'next/link'
import { Building2, ChevronLeft, ChevronRight } from 'lucide-react'
import { insights } from '../data'

export default function Insights() {
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

        {/* Article cards */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {insights.map((p) => (
            <article
              key={p.slug}
              className="flex flex-col rounded-2xl bg-white p-3 shadow-[0_4px_18px_-6px_rgba(8,26,51,0.14)] transition hover:shadow-card"
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

        {/* Prev / next arrows */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/insights"
            aria-label="Previous insights"
            className="flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-navy-800 bg-white text-navy-800 transition hover:bg-navy-800 hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <Link
            href="/insights"
            aria-label="More insights"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-800 text-white transition hover:bg-navy-700"
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}