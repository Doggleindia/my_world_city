'use client'

import {
  Building2, Compass, DraftingCompass, Factory, FileCheck, Hammer, HardHat, Home, Landmark,
  LayoutGrid, Scale, Sofa, Sprout, Sun,
} from 'lucide-react'

// One look for every category filter row on the site: each chip carries its
// own colour and icon, outlined when idle and filled when selected, so the
// row reads as a set of distinct choices rather than a line of grey pills.
const META = {
  All: [LayoutGrid, '#0b2547'],
  // property categories — the same palette as the icons under the hero
  Residential: [Home, '#17838c'],
  Commercial: [Building2, '#2b5fc9'],
  Industrial: [Factory, '#c0392b'],
  'Farm & Agri': [Sprout, '#2e9e5b'],
  // expert categories
  Legal: [Scale, '#4f46e5'],
  Architecture: [DraftingCompass, '#7c3aed'],
  Engineering: [HardHat, '#2b5fc9'],
  Construction: [Hammer, '#ea580c'],
  Interior: [Sofa, '#db2777'],
  Approvals: [FileCheck, '#059669'],
  Finance: [Landmark, '#b45309'],
  Vastu: [Compass, '#9333ea'],
  Solar: [Sun, '#ca8a04'],
}

export default function CategoryChips({ items, value, onChange, className = '' }) {
  return (
    <div data-chips className={`flex flex-wrap gap-2.5 ${className}`}>
      {items.map((c) => {
        const [Icon, color] = META[c] || [LayoutGrid, '#0b3f80']
        const on = c === value
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            aria-pressed={on}
            style={{ '--c': color }}
            className={`inline-flex items-center gap-2 rounded-full border-[1.5px] px-4 py-2 text-[13px] font-medium transition duration-200 ${
              on
                ? 'border-[color:var(--c)] bg-[color:var(--c)] text-white shadow-[0_8px_18px_-8px_var(--c)]'
                : 'border-[color:var(--c)]/35 bg-[color-mix(in_srgb,var(--c)_7%,white)] text-[color:var(--c)] hover:-translate-y-0.5 hover:border-[color:var(--c)] hover:bg-[color-mix(in_srgb,var(--c)_14%,white)] hover:shadow-md'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={2.25} />
            {c}
          </button>
        )
      })}
    </div>
  )
}
