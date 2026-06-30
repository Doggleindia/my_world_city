import Link from 'next/link'
import { Home, Building2, Users, TrendingUp } from 'lucide-react'
import { actionCards } from '../data'

const icons = { Home, Building2, Users, TrendingUp }
const hrefs = {
  buy: '/find-property',
  build: '/develop',
  manage: '/services',
  invest: '/find-property?category=Commercial',
}

export default function ActionSelector() {
  return (
    <section className="relative z-10">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {/* Four action cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {actionCards.map((c) => {
            const Icon = icons[c.icon]
            return (
              <Link
                key={c.key}
                href={hrefs[c.key] || '/find-property'}
                className="group flex flex-col items-center rounded-xl border border-slate-100 bg-white px-4 py-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
              >
                <Icon className={`h-8 w-8 ${c.color}`} strokeWidth={1.75} />
                <span className={`mt-3 h-0.5 w-8 rounded-full ${c.bar}`} />
                <h3 className="mt-3 text-[15px] font-bold text-navy-800">{c.title}</h3>
                <p className={`mt-1.5 text-[12.5px] leading-snug ${c.color}`}>{c.desc}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
