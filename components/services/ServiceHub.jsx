'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, ShieldCheck } from 'lucide-react'
import ServiceCard from './ServiceCard'
import ServiceRequestModal from './ServiceRequestModal'
import { services } from '@/data'

export default function ServiceHub() {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(null)
  const searchParams = useSearchParams()

  // Deep link: /services?service=Legal opens that service's request modal.
  useEffect(() => {
    const wanted = searchParams.get('service')
    if (!wanted) return
    const match = services.find(
      (s) => s.title.toLowerCase() === wanted.trim().toLowerCase(),
    )
    if (match) setActive(match)
  }, [searchParams])

  const filtered = services.filter(
    (s) =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.desc.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <section className="bg-indigo-50">
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-[26px] font-extrabold text-navy-800 sm:text-[30px]">
              Verified Service Hub
            </h2>
            <p className="mt-1.5 text-[14px] text-slate-500">
              Professional assistance for every property need in Jaipur.
            </p>
          </div>

          <div className="flex w-full items-center gap-2.5 sm:w-auto">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 focus-within:border-brand sm:w-72">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search services..."
                className="w-full bg-transparent text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((s) => (
            <ServiceCard key={s.title} {...s} onSelect={() => setActive(s)} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-8 text-center text-[14px] text-slate-500">
            No services match &ldquo;{query}&rdquo;.
          </p>
        )}

        {/* Verified banner */}
        <div className="mt-8 flex items-center justify-center gap-2.5 rounded-2xl bg-brand px-6 py-5 text-center text-white shadow-card">
          <ShieldCheck className="h-5 w-5 shrink-0" />
          <span className="text-[14px] font-semibold sm:text-[15px]">
            Every partner is background-checked and verified by My World City
          </span>
        </div>
      </div>

      <ServiceRequestModal open={!!active} service={active} onClose={() => setActive(null)} />
    </section>
  )
}
