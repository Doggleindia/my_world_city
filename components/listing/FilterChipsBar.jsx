'use client'

import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'

export default function FilterChipsBar({ initial = [] }) {
  const [chips, setChips] = useState(initial)

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2.5 px-4 py-3 sm:px-6">
        {chips.map((c) => (
          <button
            key={c}
            onClick={() => setChips((prev) => prev.filter((x) => x !== c))}
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[12.5px] font-medium text-slate-700 transition hover:bg-slate-200"
          >
            {c} <X className="h-3.5 w-3.5 text-slate-400" />
          </button>
        ))}

        <div className="ml-auto">
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-1.5 text-[13px] font-medium text-slate-700 transition hover:border-slate-400">
            Sort by: Relevance <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>
        </div>
      </div>
    </div>
  )
}
