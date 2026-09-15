'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const RESEND_SECONDS = 30

const apiError = (data, fallback) => {
  if (data?.issues) {
    const detail = Object.values(data.issues).map((v) => [].concat(v)[0]).filter(Boolean)
    if (detail.length) return detail.join(' · ')
  }
  return data?.error || fallback
}

const input =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14.5px] text-navy-900 outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15'
const label = 'text-[11px] font-bold uppercase tracking-wider text-slate-500'
const primary =
  'mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-navy-900 py-3.5 text-[15px] font-semibold text-white transition hover:bg-navy-700 disabled:opacity-50'

function PasswordInput({ id, value, onChange, placeholder = '••••••••••••', autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative mt-2">
      <input
        id={id} name={id} type={show ? 'text' : 'password'} required autoComplete={autoComplete}
        value={value} onChange={onChange} placeholder={placeholder} className={`${input} pr-12`}
      />
      <button
        type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-navy-800"
      >
        {show ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
      </button>
    </div>
  )
}

// Email + password sign-in for the admin console, with a "forgot password"
// path that emails a code and lets the admin choose a new password. Shared by
// the Login dialog's Admin tab, /login and /admin/login.
export default function AdminLoginForm({ onDone }) {
  const [view, setView] = useState('signin') // signin | forgot | reset | done
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [devCode, setDevCode] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secondsLeft])

  const go = (v) => { setError(''); setView(v) }

  const signIn = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(apiError(data, 'Login failed'))
      await onDone?.(data.user)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  const sendReset = async (e) => {
    e?.preventDefault()
    setError('')
    const clean = email.trim().toLowerCase()
    if (!EMAIL_RE.test(clean)) return setError('Enter your admin email address')
    setBusy(true)
    try {
      const res = await fetch('/api/admin/password/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: clean }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(apiError(data, 'Could not send the code'))
      setDevCode(data.devCode || '')
      setSecondsLeft(RESEND_SECONDS)
      setCode('')
      setView('reset')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const resetPassword = async (e) => {
    e.preventDefault()
    setError('')
    if (code.length !== 6) return setError('Enter the 6-digit code from the email')
    if (newPassword.length < 8) return setError('Use at least 8 characters for the new password')
    setBusy(true)
    try {
      const res = await fetch('/api/admin/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(apiError(data, 'Could not reset the password'))
      setPassword('')
      setNewPassword('')
      setView('done')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const Err = error ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[13px] font-medium text-red-600">{error}</p> : null

  /* ---------------- forgot: ask for the email ---------------- */
  if (view === 'forgot') {
    return (
      <form onSubmit={sendReset}>
        <h2 className="text-[24px] font-extrabold tracking-tight text-navy-900">
          Forgot <span className="text-brand">password</span>
        </h2>
        <p className="mt-1.5 text-[14px] text-slate-500">
          Enter your admin email and we’ll send a code to set a new password.
        </p>
        <div className="mt-6">
          <label className={label} htmlFor="adm-email">Admin email</label>
          <input
            id="adm-email" name="email" type="email" required autoFocus autoComplete="username"
            value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com" className={`${input} mt-2`}
          />
        </div>
        {Err}
        <button type="submit" disabled={busy || !email.trim()} className={primary}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Send reset code <ArrowRight className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => go('signin')}
          className="mt-3 flex w-full items-center justify-center gap-1.5 text-[13px] font-semibold text-slate-500 transition hover:text-navy-800">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </button>
      </form>
    )
  }

  /* ---------------- reset: code + new password ---------------- */
  if (view === 'reset') {
    return (
      <form onSubmit={resetPassword}>
        <h2 className="text-[24px] font-extrabold tracking-tight text-navy-900">
          Set a new <span className="text-brand">password</span>
        </h2>
        <p className="mt-1.5 break-words text-[14px] text-slate-500">
          If <b className="text-navy-800">{email.trim().toLowerCase()}</b> is an admin account, a 6-digit code is on its way.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className={label} htmlFor="adm-code">Code from the email</label>
            <input
              id="adm-code" name="code" inputMode="numeric" autoComplete="one-time-code" autoFocus
              value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit code" className={`${input} mt-2 tracking-[0.35em]`}
            />
          </div>
          <div>
            <label className={label} htmlFor="adm-new-password">New password</label>
            <PasswordInput id="adm-new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters" autoComplete="new-password" />
          </div>
        </div>

        {devCode && (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12.5px] text-amber-800">
            <b>Development mode:</b> email sending isn’t configured, so your code is <b className="tracking-widest">{devCode}</b>.
          </p>
        )}

        <div className="mt-4 flex items-center justify-between text-[13px]">
          <span className="text-slate-500">Didn’t receive it?</span>
          {secondsLeft > 0 ? (
            <span className="font-semibold text-slate-400">Resend in 0:{String(secondsLeft).padStart(2, '0')}</span>
          ) : (
            <button type="button" onClick={() => sendReset()} disabled={busy} className="font-semibold text-brand hover:underline">
              Resend code
            </button>
          )}
        </div>

        {Err}
        <button type="submit" disabled={busy || code.length !== 6 || !newPassword} className={primary}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save new password <ArrowRight className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => go('forgot')}
          className="mt-3 flex w-full items-center justify-center gap-1.5 text-[13px] font-semibold text-slate-500 transition hover:text-navy-800">
          <ArrowLeft className="h-3.5 w-3.5" /> Change email
        </button>
      </form>
    )
  }

  /* ---------------- done ---------------- */
  if (view === 'done') {
    return (
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h2 className="mt-4 text-[22px] font-extrabold tracking-tight text-navy-900">Password updated</h2>
        <p className="mt-1.5 text-[14px] text-slate-500">Sign in with your new password to open the console.</p>
        <button type="button" onClick={() => go('signin')} className={primary}>
          Back to sign in <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    )
  }

  /* ---------------- sign in ---------------- */
  return (
    <form onSubmit={signIn}>
      <h2 className="text-[24px] font-extrabold tracking-tight text-navy-900">
        Admin <span className="text-brand">sign in</span>
      </h2>
      <p className="mt-1.5 text-[14px] text-slate-500">Use your admin email and password.</p>

      <div className="mt-6 space-y-4">
        <div>
          <label className={label} htmlFor="adm-email">Admin email</label>
          <input
            id="adm-email" name="email" type="email" required autoComplete="username"
            value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com" className={`${input} mt-2`}
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className={label} htmlFor="adm-password">Password</label>
            <button type="button" onClick={() => go('forgot')} className="text-[12.5px] font-semibold text-brand hover:underline">
              Forgot password?
            </button>
          </div>
          <PasswordInput id="adm-password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
      </div>

      <p className="mt-4 flex items-start gap-2.5 rounded-xl bg-brand/[0.06] px-3.5 py-3 text-[12.5px] leading-relaxed text-slate-600">
        <ShieldCheck className="mt-[1px] h-4 w-4 shrink-0 text-brand" />
        Only accounts with admin access can sign in here.
      </p>

      {Err}

      <button type="submit" disabled={busy || !email.trim() || !password} className={primary}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Sign in to admin <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  )
}

// The User / Admin switch shown above both sign-in forms.
export function AudienceSwitch({ value, onChange }) {
  return (
    <div className="mx-auto grid w-full max-w-[260px] grid-cols-2 rounded-full bg-slate-100 p-1" role="tablist" aria-label="Sign in as">
      {[['user', 'User'], ['admin', 'Admin']].map(([k, l]) => {
        const on = value === k
        return (
          <button
            key={k} type="button" role="tab" aria-selected={on} onClick={() => onChange(k)}
            className={`rounded-full py-2 text-[13px] font-semibold transition ${
              on ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500 hover:text-navy-800'
            }`}
          >
            {l}
          </button>
        )
      })}
    </div>
  )
}
