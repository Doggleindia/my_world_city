'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import SiteFooter from '@/components/property/SiteFooter'
import { useAuth } from '@/components/auth/AuthProvider'
import PromoteButton from '@/components/dashboard/PromoteButton'
import {
  Loader2, LogIn, Plus, Eye, Trash2, Home, BadgeCheck, Star, KeyRound, X, Check,
} from 'lucide-react'

const STATUS_STYLE = {
  active: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  draft: 'bg-slate-100 text-slate-600',
  sold: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function DashboardPage() {
  const { user, loading, openLogin, refresh } = useAuth()

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <Navbar cta="brand" />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {loading ? (
          <Center><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></Center>
        ) : !user ? (
          <Gate onLogin={openLogin} />
        ) : (
          <>
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-[28px] font-extrabold tracking-tight text-navy-900 sm:text-[32px]">
                  My properties
                </h1>
                <p className="mt-1 text-[14px] text-slate-500">
                  {user.name ? `Welcome, ${user.name.split(' ')[0]}` : `+91 ${user.phone}`}
                </p>
              </div>
              <Link
                href="/list-property"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-brand-700"
              >
                <Plus className="h-4 w-4" /> List a property
              </Link>
            </div>

            {user.mustChangePassword && <ChangePasswordCard onDone={refresh} />}

            <div className="mt-6">
              <Listings />
            </div>
          </>
        )}
      </div>
      <SiteFooter />
    </main>
  )
}

function ChangePasswordCard({ onDone }) {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not change password')
      setOk(true)
      await onDone?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (ok) return null

  return (
    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-400/30 text-amber-700">
          <KeyRound className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-bold text-amber-900">You’re using a temporary password</h3>
          <p className="mt-0.5 text-[12.5px] text-amber-700">
            Set your own password so you can log in securely next time.
          </p>

          {open && (
            <form onSubmit={submit} className="mt-3 grid gap-2.5 sm:max-w-md">
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-[12.5px] font-medium text-red-600">{error}</p>}
              <input
                type="password"
                required
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="Temporary password"
                className="rounded-lg border border-amber-200 bg-white px-3 py-2.5 text-[13.5px] focus:border-brand focus:outline-none"
              />
              <input
                type="password"
                required
                minLength={6}
                value={next}
                onChange={(e) => setNext(e.target.value)}
                placeholder="New password (min 6 chars)"
                className="rounded-lg border border-amber-200 bg-white px-3 py-2.5 text-[13.5px] focus:border-brand focus:outline-none"
              />
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-navy-800 px-4 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4" /> Save new password</>}
              </button>
            </form>
          )}
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="shrink-0 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold text-amber-800 transition hover:bg-amber-100"
        >
          {open ? <X className="h-4 w-4" /> : 'Change'}
        </button>
      </div>
    </div>
  )
}

function Listings() {
  const [items, setItems] = useState(null)
  const load = useCallback(async () => {
    const res = await fetch('/api/me/listings')
    const data = await res.json()
    setItems(res.ok ? data.items : [])
  }, [])
  useEffect(() => { load() }, [load])

  const remove = async (id) => {
    if (!confirm('Delete this listing?')) return
    setItems((prev) => prev.filter((p) => p.id !== id))
    await fetch(`/api/properties/${id}`, { method: 'DELETE' })
  }

  if (!items) return <Center><Loader2 className="h-7 w-7 animate-spin text-slate-400" /></Center>
  if (items.length === 0)
    return (
      <Empty icon={Home} title="No listings yet" body="Create your first listing to start getting leads.">
        <Link href="/list-property" className="mt-5 rounded-full bg-brand px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-brand-700">
          List a property
        </Link>
      </Empty>
    )

  return (
    <div className="space-y-4">
      {items.map((p) => (
        <div key={p.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <img src={p.img} alt={p.title} className="h-24 w-full rounded-xl object-cover sm:w-36" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[16px] font-bold text-navy-800">{p.title}</h3>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLE[p.status] || 'bg-slate-100 text-slate-600'}`}>
                {p.status}
              </span>
              {p.verified && <BadgeCheck className="h-4 w-4 text-emerald-500" />}
              {p.featured && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
            </div>
            <p className="mt-0.5 text-[13px] text-slate-500">
              {p.category} • {p.locality} {p.priceLabel ? `• ${p.priceLabel}` : ''}
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-[12.5px] text-slate-400">
              <Eye className="h-3.5 w-3.5" /> {p.views} views
            </p>
            {p.status === 'rejected' && p.rejectionReason && (
              <p className="mt-1 text-[12.5px] text-red-600">Reason: {p.rejectionReason}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PromoteButton id={p.id} premium={p.premium} featured={p.featured} onDone={load} />
            {p.status === 'active' && (
              <Link
                href={`/property/${p.slug}`}
                className="rounded-lg border border-slate-300 px-3 py-2 text-[13px] font-semibold text-slate-700 transition hover:border-slate-400"
              >
                View
              </Link>
            )}
            <button
              onClick={() => remove(p.id)}
              aria-label="Delete"
              className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-red-300 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ---- shared bits ---- */
function Center({ children }) {
  return <div className="flex justify-center py-24">{children}</div>
}
function Empty({ icon: Icon, title, body, children }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
      <Icon className="h-9 w-9 text-slate-300" />
      <h2 className="mt-3 text-[17px] font-bold text-navy-800">{title}</h2>
      <p className="mt-1.5 max-w-xs text-[13.5px] text-slate-500">{body}</p>
      {children}
    </div>
  )
}
function Gate({ onLogin }) {
  return (
    <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
      <LogIn className="h-9 w-9 text-slate-300" />
      <h2 className="mt-3 text-[18px] font-bold text-navy-800">Login to view your dashboard</h2>
      <button onClick={onLogin} className="mt-6 rounded-full bg-brand px-6 py-3 text-[14px] font-semibold text-white hover:bg-brand-700">
        Login
      </button>
    </div>
  )
}
