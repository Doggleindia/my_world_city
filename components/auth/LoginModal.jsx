'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Phone, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react'

const EMPTY = { phone: '', code: '', name: '' }

export default function LoginModal({ open, onClose, onAuthed }) {
  const [step, setStep] = useState('phone') // 'phone' | 'otp'
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [devCode, setDevCode] = useState('')
  const firstField = useRef(null)

  useEffect(() => {
    if (open) {
      setStep('phone')
      setForm(EMPTY)
      setError('')
      setDevCode('')
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

  const sendOtp = async (e) => {
    e?.preventDefault()
    setError('')
    setBusy(true)
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not send code')
      if (data.devCode) setDevCode(data.devCode)
      setStep('otp')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const verifyOtp = async (e) => {
    e?.preventDefault()
    setError('')
    setBusy(true)
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, code: form.code, name: form.name || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Verification failed')
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
            <Phone className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-[22px] font-extrabold text-navy-800">
            {step === 'phone' ? 'Login or sign up' : 'Verify your number'}
          </h2>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-500">
            {step === 'phone'
              ? 'Enter your mobile number — we’ll send a one-time code.'
              : `Enter the 6-digit code sent to +91 ${form.phone}.`}
          </p>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-[13px] font-medium text-red-600">
              {error}
            </p>
          )}

          {step === 'phone' ? (
            <form onSubmit={sendOtp} className="mt-5">
              <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
                <span className="border-r border-slate-200 px-3.5 py-3 text-[14px] font-semibold text-slate-700">
                  +91
                </span>
                <input
                  ref={firstField}
                  autoFocus
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  required
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))
                  }
                  placeholder="10-digit mobile number"
                  className="w-full px-3.5 py-3 text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={busy || form.phone.length !== 10}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-navy-800 py-3.5 text-[15px] font-semibold text-white transition hover:bg-navy-700 disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Send code <ArrowRight className="h-[18px] w-[18px]" /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="mt-5 space-y-4">
              {devCode && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-[12.5px] font-medium text-amber-700">
                  Dev mode — your code is <span className="font-bold">{devCode}</span>
                </p>
              )}
              <input
                autoFocus
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.replace(/\D/g, '') }))}
                placeholder="6-digit code"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-[20px] font-bold tracking-[0.4em] text-slate-800 placeholder:tracking-normal placeholder:text-[14px] placeholder:font-normal placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Your name (optional)"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] text-slate-800 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
              <button
                type="submit"
                disabled={busy || form.code.length !== 6}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-[15px] font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify & continue'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('phone')
                  setForm((f) => ({ ...f, code: '' }))
                  setError('')
                }}
                className="w-full text-center text-[13px] font-medium text-slate-500 hover:text-navy-800"
              >
                ← Change number
              </button>
            </form>
          )}

          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-[12px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5" /> Your number stays private and is never shared.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  )
}
