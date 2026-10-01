'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import ExpertCard from './ExpertCard'
import { expertList, expertCategories } from '@/data'

export default function ExpertDirectory({ experts, categories, initialCat = 'All' }) {
  const source = experts?.length ? experts : expertList
  const cats = categories?.length ? categories : expertCategories
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState(initialCat)

  const q = query.trim().toLowerCase()
  const filtered = source.filter((e) => {
    const matchesChip = cat === 'All' || e.cat === cat
    const matchesQuery =
      !q ||
      e.name.toLowerCase().includes(q) ||
      e.role.toLowerCase().includes(q) ||
      e.specialty.toLowerCase().includes(q) ||
      e.cat.toLowerCase().includes(q)
    return matchesChip && matchesQuery
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
        {cats.map((c) => (
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

      {/* grid */}
      <div className="mt-7">
        <div className="min-w-0">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((e) => (
                <ExpertCard key={e.id || e.slug || e.name} {...e} />
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-[14px] text-slate-500">
              No experts match your search.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
