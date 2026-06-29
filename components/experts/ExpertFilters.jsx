'use client'

import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { expertDomains, expertExperience, expertLocations } from '@/data'

export default function ExpertFilters({ domains = ['Architecture'], onApply }) {
  const [selected, setSelected] = useState(new Set(domains))
  const [exp, setExp] = useState('Any')
  const [locs, setLocs] = useState(new Set())

  const toggle = (set, setSet, value) => {
    const next = new Set(set)
    next.has(value) ? next.delete(value) : next.add(value)
    setSet(next)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-[15px] font-bold text-navy-800">
        <SlidersHorizontal className="h-4 w-4 text-slate-500" /> Filters
      </div>

      <Group label="Domain">
        {expertDomains.map((d) => (
          <label key={d} className="flex items-center gap-2.5 text-[14px] text-slate-600">
            <input
              type="checkbox"
              checked={selected.has(d)}
              onChange={() => toggle(selected, setSelected, d)}
              className="h-4 w-4 rounded accent-brand"
            />
            {d}
          </label>
        ))}
      </Group>

      <Group label="Experience">
        {expertExperience.map((e) => (
          <label key={e} className="flex items-center gap-2.5 text-[14px] text-slate-600">
            <input
              type="radio"
              name="experience"
              checked={exp === e}
              onChange={() => setExp(e)}
              className="h-4 w-4 accent-brand"
            />
            {e}
          </label>
        ))}
      </Group>

      <Group label="Location">
        {expertLocations.map((l) => (
          <label key={l} className="flex items-center gap-2.5 text-[14px] text-slate-600">
            <input
              type="checkbox"
              checked={locs.has(l)}
              onChange={() => toggle(locs, setLocs, l)}
              className="h-4 w-4 rounded accent-brand"
            />
            {l}
          </label>
        ))}
      </Group>

      <button
        onClick={() => onApply?.([...selected])}
        className="mt-6 w-full rounded-lg bg-brand py-3 text-[14px] font-semibold text-white transition hover:bg-brand-700"
      >
        Apply Filters
      </button>
    </div>
  )
}

function Group({ label, children }) {
  return (
    <div className="mt-6">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  )
}
