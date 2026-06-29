'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, HeartOff } from 'lucide-react'
import SavedCard from './SavedCard'
import { savedProperties } from '@/data'

export default function SavedProperties() {
  const [items, setItems] = useState(savedProperties)

  const remove = (id) => setItems((prev) => prev.filter((p) => p.id !== id))

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-[34px] font-extrabold tracking-tight text-navy-900 sm:text-[40px]">
            Your saved properties
          </h1>
          <p className="mt-2 text-[15px] font-semibold text-brand">
            {items.length} {items.length === 1 ? 'property' : 'properties'} saved
          </p>
        </div>

        <button className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-[14px] font-medium text-slate-700 transition hover:border-slate-400">
          Sort by: Recent <ChevronDown className="h-4 w-4 text-slate-500" />
        </button>
      </div>

      {/* Grid / empty state */}
      {items.length > 0 ? (
        <div className="mt-9 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <SavedCard key={p.id} {...p} onUnsave={() => remove(p.id)} />
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 py-20 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-400">
            <HeartOff className="h-7 w-7" />
          </span>
          <h2 className="mt-4 text-[18px] font-bold text-navy-800">No saved properties yet</h2>
          <p className="mt-1.5 max-w-xs text-[14px] text-slate-500">
            Tap the heart on any listing to save it here for later.
          </p>
          <Link
            href="/find-property"
            className="mt-6 rounded-full bg-brand px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-brand-700"
          >
            Browse properties
          </Link>
        </div>
      )}
    </section>
  )
}
