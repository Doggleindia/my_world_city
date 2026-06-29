'use client'

import { useState } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import ExpertCard from './ExpertCard'
import ExpertFilters from './ExpertFilters'
import { expertList, expertCategories } from '@/data'

export default function ExpertDirectory() {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('All')
  const [domains, setDomains] = useState([]) // applied from sidebar

  const q = query.trim().toLowerCase()
  const filtered = expertList.filter((e) => {
    const matchesChip = cat === 'All' || e.cat === cat
    const matchesDomain = domains.length === 0 || domains.includes(e.cat)
    const matchesQuery =
      !q ||
      e.name.toLowerCase().includes(q) ||
      e.role.toLowerCase().includes(q) ||
      e.specialty.toLowerCase().includes(q) ||
      e.cat.toLowerCase().includes(q)
    return matchesChip && matchesDomain && matchesQuery
  })

  return (
    <div className="mt-10">
      {/* Search */}
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <Search className="h-5 w-5 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, domain or designation"
          className="w-full bg-transparent text-[15px] text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      {/* Category chips */}
      <div className="mt-5 flex flex-wrap gap-2.5">
        {expertCategories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
              c === cat ? 'bg-navy-800 text-white' : 'bg-slate-200/70 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Sidebar + grid */}
      <div className="mt-7 flex flex-col gap-7 lg:flex-row">
        <aside className="lg:w-[280px] lg:shrink-0">
          <ExpertFilters onApply={setDomains} />
        </aside>

        <div className="min-w-0 flex-1">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((e) => (
                <ExpertCard key={e.name} {...e} />
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-[14px] text-slate-500">
              No experts match your filters.
            </p>
          )}

          {filtered.length > 0 && (
            <div className="mt-10 flex justify-center">
              <button className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-[14px] font-semibold text-navy-800 transition hover:border-brand hover:text-brand">
                Load More Properties <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
