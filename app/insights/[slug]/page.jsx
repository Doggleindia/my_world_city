import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Navbar from '@/components/Navbar'
import SiteFooter from '@/components/property/SiteFooter'
import { insights } from '@/data'

export function generateStaticParams() {
  return insights.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const post = insights.find((p) => p.slug === slug)
  if (!post) return { title: 'Insight not found — My World City' }
  return {
    title: `${post.title} — My World City`,
    description: post.desc,
  }
}

export default async function InsightPage({ params }) {
  const { slug } = await params
  const post = insights.find((p) => p.slug === slug)
  if (!post) notFound()

  const related = insights.filter((p) => p.slug !== slug).slice(0, 3)

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Navbar cta="brand" />

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link
          href="/insights"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 transition hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" /> All insights
        </Link>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-[12.5px] font-semibold text-slate-500">
          <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-brand">{post.category}</span>
          <span>{post.date}</span>
          <span>·</span>
          <span>{post.readTime}</span>
        </div>

        <h1 className="mt-4 text-[30px] font-extrabold leading-tight tracking-tight text-navy-900 sm:text-[38px]">
          {post.title}
        </h1>

        <img
          src={post.img}
          alt=""
          className="mt-7 h-64 w-full rounded-2xl object-cover sm:h-80"
        />

        <div className="mt-8 space-y-5">
          {post.body.map((para, i) => (
            <p key={i} className="text-[16px] leading-relaxed text-slate-700">
              {para}
            </p>
          ))}
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-slate-100 bg-slate-50">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
            <h2 className="text-[20px] font-bold text-navy-800">More insights</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/insights/${p.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-card"
                >
                  <img src={p.img} alt="" className="h-32 w-full object-cover" />
                  <div className="flex flex-1 flex-col p-4">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-brand">
                      {p.category}
                    </span>
                    <h3 className="mt-1.5 text-[14px] font-bold leading-snug text-navy-800 group-hover:text-brand">
                      {p.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </main>
  )
}
