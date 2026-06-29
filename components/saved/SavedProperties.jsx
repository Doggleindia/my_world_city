'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, HeartOff, Loader2, LogIn } from 'lucide-react'
import SavedCard from './SavedCard'
import { useAuth } from '@/components/auth/AuthProvider'
import { useSaved } from '@/components/saved/SavedProvider'

export default function SavedProperties() {
  const { user, loading: authLoading, openLogin } = useAuth()
  const { ids, refresh } = useSaved()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('recent')

  const sorted = [...items].sort((a, b) => {
    if (sort === 'az') return a.title.localeCompare(b.title)
    if (sort === 'za') return b.title.localeCompare(a.title)
    return 0 // recent = API order
  })

  useEffect(() => {
    let active = true
    async function load() {
      if (!user) {
        setItems([])
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const res = await fetch('/api/saved')
        const data = await res.json()
        if (active && res.ok) setItems(data.items)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
    // Re-fetch when the saved id set changes (e.g. after an unsave elsewhere).
  }, [user, ids.size])

  const handleUnsave = async (id) => {
    setItems((prev) => prev.filter((p) => p.id !== id))
    await fetch(`/api/saved?propertyId=${id}`, { method: 'DELETE' })
    refresh()
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-[34px] font-extrabold tracking-tight text-navy-900 sm:text-[40px]">
            Your saved properties
          </h1>
          <p className="mt-2 text-[15px] font-semibold text-brand">
            {items.length} {items.length === 1 ? 'property' : 'properties'} saved
          </p>
        </div>

        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="appearance-none rounded-full border border-slate-300 bg-white py-2.5 pl-4 pr-10 text-[14px] font-medium text-slate-700 transition hover:border-slate-400 focus:border-brand focus:outline-none"
          >
            <option value="recent">Sort by: Recent</option>
            <option value="az">Sort by: Name (A–Z)</option>
            <option value="za">Sort by: Name (Z–A)</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-3 h-4 w-4 text-slate-500" />
        </div>
      </div>

      {authLoading || loading ? (
        <div className="flex justify-center py-24 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : !user ? (
        <EmptyState
          icon={LogIn}
          title="Log in to see your saved list"
          body="Your shortlisted properties are tied to your account."
          action={
            <button
              onClick={openLogin}
              className="mt-6 rounded-full bg-brand px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-brand-700"
            >
              Login
            </button>
          }
        />
      ) : items.length > 0 ? (
        <div className="mt-9 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((p) => (
            <SavedCard key={p.id} {...p} onUnsave={() => handleUnsave(p.id)} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={HeartOff}
          title="No saved properties yet"
          body="Tap the heart on any listing to save it here for later."
          action={
            <Link
              href="/find-property"
              className="mt-6 rounded-full bg-brand px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-brand-700"
            >
              Browse properties
            </Link>
          }
        />
      )}
    </section>
  )
}

function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 py-20 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-400">
        <Icon className="h-7 w-7" />
      </span>
      <h2 className="mt-4 text-[18px] font-bold text-navy-800">{title}</h2>
      <p className="mt-1.5 max-w-xs text-[14px] text-slate-500">{body}</p>
      {action}
    </div>
  )
}
