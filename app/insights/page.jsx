import Link from 'next/link'
import Navbar from '@/components/Navbar'
import SiteFooter from '@/components/property/SiteFooter'
import { insights } from '@/data'

export const metadata = {
  title: 'Insights — My World City',
  description: 'Latest insights on real-estate technology, smart living and property trends in Jaipur.',
}

export default function InsightsPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Navbar cta="brand" />
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <h1 className="text-[32px] font-extrabold tracking-tight text-navy-900 sm:text-[40px]">
          Insights
        </h1>
        <p className="mt-2 text-[15px] text-slate-500">
          Cutting-edge projects, smart-living solutions and real-estate technology.
        </p>

        <div className="mt-10 grid gap-7 sm:grid-cols-2">
          {insights.map((p) => (
            <Link
              key={p.slug}
              href={`/insights/${p.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-card"
            >
              <img src={p.img} alt="" className="h-48 w-full object-cover" />
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-3 text-[12px] font-semibold text-slate-500">
                  <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-brand">{p.category}</span>
                  <span>{p.date}</span>
                  <span>·</span>
                  <span>{p.readTime}</span>
                </div>
                <h2 className="mt-3 text-[19px] font-bold leading-snug text-navy-800 group-hover:text-brand">
                  {p.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-slate-500">
                  {p.desc}
                </p>
                <span className="mt-4 text-[13px] font-semibold text-brand">Read more →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <SiteFooter />
    </main>
  )
}
