import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ExpertCard from './ExpertCard'
import { expertList } from '@/data'

export default function ProfileShowcase({ p }) {
  const others = expertList.filter((e) => e.slug !== p.slug).slice(-4)

  return (
    <section className="bg-indigo-50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        {/* Selected work */}
        <h2 className="text-[24px] font-extrabold text-navy-800 sm:text-[28px]">
          Selected work across Jaipur &amp; Rajasthan
        </h2>
        <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {p.projects.map((pr) => (
            <article key={pr.title} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="relative">
                <img src={pr.img} alt={pr.title} className="h-52 w-full object-cover sm:h-56" />
                <span className="absolute left-3 top-3 rounded-md bg-white/90 px-2.5 py-1 text-[11px] font-bold text-navy-800 backdrop-blur-sm">
                  {pr.year}
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-[16px] font-bold text-navy-800">{pr.title}</h3>
                <p className="mt-1 text-[12.5px] font-semibold text-emerald-600">{pr.meta}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-500">{pr.desc}</p>
              </div>
            </article>
          ))}
        </div>

        {/* Other experts */}
        <h2 className="mt-16 text-[24px] font-extrabold text-navy-800 sm:text-[28px]">
          Other architects in Jaipur
        </h2>
        <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {others.map((e) => (
            <ExpertCard key={e.slug} {...e} />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/experts"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-[14px] font-semibold text-navy-800 transition hover:border-brand hover:text-brand"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
