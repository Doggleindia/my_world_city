'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { X, Lock, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react'

const EMPTY = { phone: '', password: '' }

export default function LoginModal({ open, onClose, onAuthed }) {
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(EMPTY)
      setError('')
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  const login = async (e) => {
    e?.preventDefault()
    setError('')
    setBusy(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      onAuthed(data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-navy-900/60 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div
          className="relative w-full max-w-[440px] overflow-hidden rounded-3xl bg-white p-7 shadow-2xl"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>

          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-brand">
            <Lock className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-[22px] font-extrabold text-navy-800">Owner login</h2>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-500">
            Enter the mobile number and password you received when you listed your property.
          </p>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-[13px] font-medium text-red-600">
              {error}
            </p>
          )}

          <form onSubmit={login} className="mt-5 space-y-3.5">
            <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
              <span className="border-r border-slate-200 px-3.5 py-3 text-[14px] font-semibold text-slate-700">
                +91
              </span>
              <input
                autoFocus
                type="tel"
                inputMode="numeric"
                maxLength={10}
                required
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
                placeholder="10-digit mobile number"
                className="w-full px-3.5 py-3 text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Password"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] text-slate-800 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
            <button
              type="submit"
              disabled={busy || form.phone.length !== 10 || !form.password}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-800 py-3.5 text-[15px] font-semibold text-white transition hover:bg-navy-700 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Log in <ArrowRight className="h-[18px] w-[18px]" /></>}
            </button>
          </form>

          <p className="mt-5 text-center text-[13px] text-slate-500">
            New here?{' '}
            <Link
              href="/list-property"
              onClick={onClose}
              className="font-semibold text-brand hover:underline"
            >
              List a property
            </Link>{' '}
            to create your account.
          </p>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[12px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5" /> Your details stay private and are never shared.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  )
}
