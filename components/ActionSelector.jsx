'use client'

import { useState } from 'react'
import { Home, Building2, Users, TrendingUp } from 'lucide-react'
import { actionCards } from '../data'

const icons = { Home, Building2, Users, TrendingUp }

export default function ActionSelector() {
  const [tab, setTab] = useState('find')

  return (
    <section className="relative z-10 -mt-9">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Toggle pills */}
        <div className="flex w-full max-w-xl overflow-hidden rounded-full border border-slate-200 bg-white p-1 shadow-card">
          <button
            onClick={() => setTab('find')}
            className={`flex-1 rounded-full px-6 py-2.5 text-[14px] font-semibold transition ${
              tab === 'find' ? 'bg-brand text-white' : 'text-slate-600 hover:text-navy-800'
            }`}
          >
            Find Solution
          </button>
          <button
            onClick={() => setTab('post')}
            className={`flex-1 rounded-full px-6 py-2.5 text-[14px] font-semibold transition ${
              tab === 'post' ? 'bg-brand text-white' : 'text-slate-600 hover:text-navy-800'
            }`}
          >
            Post Requirement
          </button>
        </div>

        {/* Four action cards */}
        <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {actionCards.map((c) => {
            const Icon = icons[c.icon]
            return (
              <button
                key={c.key}
                className="group flex flex-col items-center rounded-xl border border-slate-100 bg-white px-4 py-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
              >
                <Icon className={`h-8 w-8 ${c.color}`} strokeWidth={1.75} />
                <span className={`mt-3 h-0.5 w-8 rounded-full ${c.bar}`} />
                <h3 className="mt-3 text-[15px] font-bold text-navy-800">{c.title}</h3>
                <p className={`mt-1.5 text-[12.5px] leading-snug ${c.color}`}>{c.desc}</p>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
