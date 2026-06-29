'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function StepAccordion({ faqs }) {
  const [open, setOpen] = useState(-1)

  return (
    <div className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
      {faqs.map((f, i) => {
        const isOpen = open === i
        return (
          <div key={f.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="flex w-full items-center justify-between gap-3 py-3 text-left"
            >
              <span className="text-[13.5px] font-medium text-navy-800">
                {!isOpen && <span className="text-slate-400">{i + 1}. </span>}
                {f.q}
              </span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 shrink-0 text-slate-500" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
              )}
            </button>
            {isOpen && (
              <p className="pb-4 text-[13px] leading-relaxed text-slate-500">{f.a}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
