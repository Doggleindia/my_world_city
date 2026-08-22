'use client'

import { useState } from 'react'
import Link from 'next/link'
import FindSolutionWizard from './FindSolutionWizard'

export default function HeroTabs() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <div className="mx-auto flex w-full max-w-3xl gap-2 rounded-full bg-slate-100 p-1.5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex-1 rounded-full bg-brand-800 px-6 py-3 text-center text-[15px] font-semibold text-white shadow-sm transition hover:bg-navy-700"
        >
          Find Solution
        </button>
        <Link
          href="/list-property"
          className="flex-1 rounded-full border border-slate-200 bg-white px-6 py-3 text-center text-[15px] font-semibold text-navy-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          List Property
        </Link>
      </div>

      {open && <FindSolutionWizard onClose={() => setOpen(false)} />}
    </div>
  )
}
