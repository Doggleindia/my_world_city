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
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-[32px] font-extrabold tracking-tight text-navy-900 sm:text-[40px]">
          Insights
        </h1>
        <p className="mt-2 text-[15px] text-slate-500">
          Cutting-edge projects, smart-living solutions and real-estate technology.
        </p>

        <div className="mt-10 space-y-12">
          {insights.map((p, i) => (
            <article key={i} id={`post-${i}`} className="scroll-mt-24">
              <img src={p.img} alt="" className="h-60 w-full rounded-2xl object-cover" />
              <h2 className="mt-5 text-[22px] font-bold leading-snug text-navy-800">{p.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{p.desc}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
                My World City keeps buyers, builders and investors ahead of the curve with verified
                listings and trusted professionals across Jaipur — so every decision is informed and
                every transaction is secure.
              </p>
            </article>
          ))}
        </div>
      </div>
      <SiteFooter />
    </main>
  )
}
