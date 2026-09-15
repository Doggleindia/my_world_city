'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Check, ChevronDown, Loader2, LogOut, Pencil, UserCircle2, X } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'

// What the console calls the signed-in admin. Never the email address — if no
// name is on the account yet we say "Admin" and ask for one.
export function adminDisplayName(user) {
  return (user?.name || '').trim() || 'Admin'
}

export function adminInitials(user) {
  const n = (user?.name || '').trim()
  if (!n) return 'AD'
  return n.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

export function adminRoleLabel(user) {
  const r = user?.roles || []
  if (r.includes('admin')) return 'Super Admin'
  if (r.includes('owner')) return 'Property Owner'
  return 'Team Member'
}

/* ---------------- name editor (shared by the menu and the first-run prompt) ---------------- */
export function NameEditor({ onSaved, onCancel, autoFocus = true }) {
  const { user, refresh } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const save = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        const detail = data.issues ? Object.values(data.issues).map((v) => [].concat(v)[0]).filter(Boolean).join(' · ') : ''
        throw new Error(detail || data.error || 'Could not save')
      }
      await refresh()
      onSaved?.(data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={save}>
      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500" htmlFor="adm-name">Your full name</label>
      <input
        id="adm-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus={autoFocus}
        placeholder="e.g. Rahul Sharma" maxLength={60} autoComplete="name"
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[14px] text-navy-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
      />
      {error && <p className="mt-2 rounded-lg bg-red-50 px-3 py-1.5 text-[12.5px] font-medium text-red-600">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button type="submit" disabled={busy || name.trim().length < 2}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Save
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="rounded-full border border-slate-200 px-4 py-2.5 text-[13.5px] font-semibold text-slate-600 transition hover:border-slate-300">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

/* ---------------- header avatar + dropdown ---------------- */
export default function ProfileMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setEditing(false) } }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const name = adminDisplayName(user)

  return (
    <div className="relative" ref={ref}>
      <button
        type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}
        className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition hover:bg-slate-100"
      >
        <div className="hidden text-right sm:block">
          <p className="max-w-[160px] truncate text-[13px] font-bold text-navy-800">{name}</p>
          <p className="text-[11px] text-slate-400">{adminRoleLabel(user)}</p>
        </div>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-brand/10 text-[12px] font-bold text-brand">
          {adminInitials(user)}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
          <div className="border-b border-slate-100 px-4 py-3.5">
            {editing ? (
              <NameEditor onSaved={() => setEditing(false)} onCancel={() => setEditing(false)} />
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-bold text-navy-900">{name}</p>
                  <p className="truncate text-[12px] text-slate-400">{user?.email}</p>
                </div>
                <button type="button" onClick={() => setEditing(true)} title="Edit name"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-navy-800">
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          <Link
            href="/admin/account"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-[13.5px] font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <UserCircle2 className="h-4 w-4 text-slate-400" /> Account details
          </Link>
          <button
            type="button"
            onClick={async () => { setOpen(false); await logout(); window.location.assign('/') }}
            className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-[13.5px] font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      )}
    </div>
  )
}

/* ---------------- first-run prompt: shown until the admin has a name ---------------- */
export function NamePrompt() {
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(false)
  if (dismissed || (user?.name || '').trim()) return null

  return (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[15px] font-bold text-navy-900">Welcome! What should we call you?</p>
          <p className="mt-1 text-[13px] text-slate-600">
            Your name appears in the console header and on actions you take. Takes five seconds.
          </p>
        </div>
        <button type="button" onClick={() => setDismissed(true)} aria-label="Dismiss"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-amber-100 hover:text-navy-800">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-4 max-w-sm">
        <NameEditor autoFocus={false} onSaved={() => setDismissed(true)} />
      </div>
    </div>
  )
}
