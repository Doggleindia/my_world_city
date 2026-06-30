'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, SearchX, SlidersHorizontal } from 'lucide-react'
import FilterChipsBar from './FilterChipsBar'
import FilterSidebar from './FilterSidebar'
import PropertyCard from './PropertyCard'

const CATEGORIES = ['All', 'Residential', 'Commercial', 'Industrial', 'Farm & Agri']

export default function FindProperty() {
  const searchParams = useSearchParams()
  const initialCat = CATEGORIES.includes(searchParams.get('category'))
    ? searchParams.get('category')
    : 'All'
  const [filters, setFilters] = useState({})
  const [showFilters, setShowFilters] = useState(false)
  const [cat, setCat] = useState(initialCat)
  const [sort, setSort] = useState('recent')
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      const merged = { ...filters, sort }
      if (cat !== 'All') merged.category = cat
      Object.entries(merged).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== false) params.set(k, String(v))
      })
      params.set('limit', '24')
      const res = await fetch(`/api/properties?${params.toString()}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load properties')
      setItems(data.items)
      setTotal(data.total)
    } catch (e) {
      setError(e.message)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [filters, cat, sort])

  useEffect(() => {
    load()
  }, [load])

  const activeChips = [
    cat !== 'All' && cat,
    filters.locality,
    filters.verified && 'Verified',
    filters.rera && 'RERA',
  ].filter(Boolean)

  return (
    <>
      <FilterChipsBar initial={activeChips} sort={sort} onSort={setSort} />

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="mb-4 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-[14px] font-semibold text-navy-800 transition hover:border-slate-400 lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" /> {showFilters ? 'Hide filters' : 'Filters'}
        </button>

        <div className="flex flex-col gap-7 lg:flex-row">
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block lg:w-[280px] lg:shrink-0`}>
            <FilterSidebar onApply={(f) => { setFilters(f); setShowFilters(false) }} />
          </aside>

          <div className="min-w-0 flex-1">
            {/* Category tabs */}
            <div className="mb-5 flex flex-wrap gap-2.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                    c === cat
                      ? 'bg-navy-800 text-white'
                      : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-navy-800">
                {loading ? 'Loading…' : `${total} ${total === 1 ? 'property' : 'properties'} found`}
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-24 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 py-16 text-center text-[14px] text-red-600">
                {error}
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
                <SearchX className="h-9 w-9 text-slate-300" />
                <p className="mt-3 text-[15px] font-semibold text-navy-800">No properties match</p>
                <p className="mt-1 text-[13.5px] text-slate-500">
                  Try widening your filters or clearing the budget range.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((p) => (
                  <PropertyCard key={p.id} {...p} className="w-full" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
