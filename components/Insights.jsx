import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import { insights } from '../data'

export default function Insights() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-navy-800 sm:text-3xl">Our Latest Insights</h2>
          <p className="mx-auto mt-2 max-w-2xl text-[14px] text-slate-500">
            Get the latest insights on cutting-edge projects, smart living solutions, and
            real-estate technology breakthroughs
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {insights.map((p, i) => (
            <article
              key={i}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-card"
            >
              <div className="relative h-36 w-full overflow-hidden">
                <img src={p.img} alt="" className="h-full w-full object-cover" />
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">
                  <MessageSquare className="h-3 w-3" /> 1 Comment
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-[13.5px] font-bold leading-snug text-navy-800">{p.title}</h3>
                <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-slate-500">
                  {p.desc}
                </p>
                <Link
                  href={`/insights#post-${i}`}
                  className="mt-4 self-start rounded-full border border-slate-300 px-4 py-1.5 text-[12px] font-semibold text-navy-800 transition hover:border-brand hover:text-brand"
                >
                  Read more
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/insights"
            className="rounded-full border border-slate-300 bg-white px-6 py-2.5 text-[13px] font-semibold text-navy-800 transition hover:border-brand hover:text-brand"
          >
            View all insights
          </Link>
        </div>
      </div>
    </section>
  )
}
