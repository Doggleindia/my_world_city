'use client'

import { useState } from 'react'
import { Check, Eye, EyeOff, KeyRound, Loader2, LogOut, Mail, Pencil, ShieldCheck, UserCircle2 } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { NameEditor, adminDisplayName, adminInitials, adminRoleLabel } from '@/components/admin/ProfileMenu'

const apiError = (data, fallback) => {
  if (data?.issues) {
    const detail = Object.values(data.issues).map((v) => [].concat(v)[0]).filter(Boolean)
    if (detail.length) return detail.join(' · ')
  }
  return data?.error || fallback
}

const input =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[14px] text-navy-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15'
const label = 'text-[11px] font-bold uppercase tracking-wider text-slate-500'

function fmtDate(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) } catch { return '—' }
}

// The signed-in admin's own account: who they are, how they sign in, and the
// two things they can change themselves — their name and their password.
export default function AccountPage() {
  const { user, logout } = useAuth()
  const [editingName, setEditingName] = useState(false)

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-[24px] font-extrabold tracking-tight text-navy-900">Account</h1>
      <p className="mt-1 text-[14px] text-slate-500">Your details and sign-in settings for the admin console.</p>

      {/* ---- identity card ---- */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-brand/10 text-[20px] font-extrabold text-brand">
            {adminInitials(user)}
          </span>
          <div className="min-w-0 flex-1">
            {editingName ? (
              <div className="max-w-sm">
                <NameEditor onSaved={() => setEditingName(false)} onCancel={() => setEditingName(false)} />
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[20px] font-bold text-navy-900">{adminDisplayName(user)}</h2>
                  <button
                    type="button" onClick={() => setEditingName(true)}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[12px] font-semibold text-slate-600 transition hover:border-brand hover:text-brand"
                  >
                    <Pencil className="h-3 w-3" /> {user?.name ? 'Edit name' : 'Add your name'}
                  </button>
                </div>
                <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11.5px] font-bold uppercase tracking-wider text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5" /> {adminRoleLabel(user)}
                </span>
              </>
            )}
          </div>
        </div>

        <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
          <Row icon={Mail} k="Email" v={user?.email} />
          <Row icon={UserCircle2} k="Account created" v={fmtDate(user?.createdAt)} />
          <Row icon={KeyRound} k="Sign-in method" v={user?.hasPassword ? 'Email + password' : 'Password not set'} />
          <Row icon={ShieldCheck} k="Access" v={(user?.roles || []).map((r) => r[0].toUpperCase() + r.slice(1)).join(', ')} />
        </dl>
      </section>

      {/* ---- password ---- */}
      <ChangePassword />

      {/* ---- sign out ---- */}
      <section className="mt-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h3 className="text-[15px] font-bold text-navy-900">Sign out</h3>
          <p className="mt-0.5 text-[13px] text-slate-500">Ends this session on this device.</p>
        </div>
        <button
          type="button"
          onClick={async () => { await logout(); window.location.assign('/') }}
          className="inline-flex items-center gap-2 rounded-full border border-red-200 px-5 py-2.5 text-[13.5px] font-semibold text-red-600 transition hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </section>
    </div>
  )
}

function Row({ icon: Icon, k, v }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <dt className={label}>{k}</dt>
        <dd className="mt-0.5 truncate text-[14px] font-medium text-navy-900">{v || '—'}</dd>
      </div>
    </div>
  )
}

function ChangePassword() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setDone(false)
    if (next.length < 8) return setError('Use at least 8 characters for the new password')
    if (next !== confirm) return setError('The two new passwords don’t match')
    setBusy(true)
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(apiError(data, 'Could not change the password'))
      setCurrent(''); setNext(''); setConfirm('')
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const type = show ? 'text' : 'password'

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-bold text-navy-900">Change password</h3>
          <p className="mt-0.5 text-[13px] text-slate-500">You’ll use the new password the next time you sign in.</p>
        </div>
        <button type="button" onClick={() => setShow((s) => !s)}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-500 transition hover:text-navy-800">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {show ? 'Hide' : 'Show'}
        </button>
      </div>

      <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <label className={label} htmlFor="pw-current">Current password</label>
          <input id="pw-current" type={type} autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} className={`${input} mt-2`} />
        </div>
        <div>
          <label className={label} htmlFor="pw-next">New password</label>
          <input id="pw-next" type={type} autoComplete="new-password" required value={next} onChange={(e) => setNext(e.target.value)} placeholder="At least 8 characters" className={`${input} mt-2`} />
        </div>
        <div>
          <label className={label} htmlFor="pw-confirm">Confirm new password</label>
          <input id="pw-confirm" type={type} autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className={`${input} mt-2`} />
        </div>

        <div className="sm:col-span-3">
          {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-[13px] font-medium text-red-600">{error}</p>}
          {done && (
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-[13px] font-medium text-emerald-700">
              <Check className="h-4 w-4" /> Password changed.
            </p>
          )}
          <button type="submit" disabled={busy || !current || !next || !confirm}
            className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-navy-700 disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Update password
          </button>
        </div>
      </form>
    </section>
  )
}
