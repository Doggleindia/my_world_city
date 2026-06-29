'use client'

import { X, ChevronDown } from 'lucide-react'

const SORTS = {
  recent: 'Newest',
  price_asc: 'Price: low to high',
  price_desc: 'Price: high to low',
  popular: 'Most viewed',
}

export default function FilterChipsBar({ initial = [], sort = 'recent', onSort }) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2.5 px-4 py-3 sm:px-6">
        {initial.length === 0 ? (
          <span className="text-[12.5px] text-slate-400">Showing all properties</span>
        ) : (
          initial.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1.5 text-[12.5px] font-semibold text-brand"
            >
              {c}
            </span>
          ))
        )}

        <div className="relative ml-auto">
          <select
            value={sort}
            onChange={(e) => onSort?.(e.target.value)}
            className="appearance-none rounded-lg border border-slate-300 bg-white py-1.5 pl-3.5 pr-9 text-[13px] font-medium text-slate-700 transition hover:border-slate-400 focus:border-brand focus:outline-none"
          >
            {Object.entries(SORTS).map(([v, label]) => (
              <option key={v} value={v}>
                Sort by: {label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-2 h-4 w-4 text-slate-500" />
        </div>
      </div>
    </div>
  )
}
