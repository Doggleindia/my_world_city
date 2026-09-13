'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Check, Loader2, Mail, ShieldCheck } from 'lucide-react'

const RESEND_SECONDS = 30
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Two-step email auth used for both signing up and signing in.
//   signup  : name + email  ->  6-digit code
//   login   : email         ->  6-digit code
// A returning address is detected by the server, so entering an existing email
// on the sign-up form simply signs that person in instead of erroring.
const apiError = (data, fallback) => {
  if (data?.issues) {
    const detail = Object.entries(data.issues).map(([k, v]) => [].concat(v)[0]).filter(Boolean)
    if (detail.length) return detail.join(' · ')
  }
  return data?.error || fallback
}

export default function OtpAuth({ mode = 'login', onDone, onSwitchMode, footer = true }) {
  const isSignup = mode === 'signup'
  const [step, setStep] = useState(1) // 1 = details/email, 2 = verify
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sentTo, setSentTo] = useState('')
  const [devCode, setDevCode] = useState('')
  const [notDelivered, setNotDelivered] = useState(false) // server has no mail set-up and won't reveal the code
  const [secondsLeft, setSecondsLeft] = useState(0)
  const boxes = useRef([])

  // Reset everything when the modal switches between Log in and Sign up.
  useEffect(() => {
    setStep(1); setCode(['', '', '', '', '', '']); setError(''); setDevCode('')
  }, [mode])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secondsLeft])

  useEffect(() => {
    if (step === 2) boxes.current[0]?.focus()
  }, [step])

  const digits = useMemo(() => code.join(''), [code])

  const sendCode = useCallback(
    async (resend = false) => {
      setError('')
      const clean = email.trim().toLowerCase()
      if (!EMAIL_RE.test(clean)) return setError('Enter a valid email address')
      if (isSignup && !resend && name.trim().length < 2) return setError('Enter your full name')
      setBusy(true)
      try {
        const res = await fetch('/api/auth/otp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: clean, ...(isSignup ? { name: name.trim() } : {}) }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(apiError(data, 'Could not send the code'))
        setSentTo(clean)
        setDevCode(data.devCode || '')
        setNotDelivered(data.channel === 'console' && !data.devCode)
        setSecondsLeft(RESEND_SECONDS)
        setCode(['', '', '', '', '', ''])
        setStep(2)
      } catch (e) {
        setError(e.message)
      } finally {
        setBusy(false)
      }
    },
    [email, name, isSignup],
  )

  const verify = useCallback(
    async (value) => {
      const entered = value || digits
      setError('')
      if (entered.length !== 6) return setError('Enter the 6-digit code')
      setBusy(true)
      try {
        const res = await fetch('/api/auth/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: sentTo || email.trim().toLowerCase(), code: entered }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(apiError(data, 'Could not verify the code'))
        onDone?.(data)
      } catch (e) {
        setError(e.message)
        setCode(['', '', '', '', '', ''])
        boxes.current[0]?.focus()
      } finally {
        setBusy(false)
      }
    },
    [digits, email, sentTo, onDone],
  )

  const setDigit = (i, v) => {
    const only = v.replace(/\D/g, '')
    if (!only) {
      setCode((c) => c.map((x, n) => (n === i ? '' : x)))
      return
    }
    // Typing or pasting several digits fills the boxes to the right.
    setCode((c) => {
      const next = [...c]
      only.split('').forEach((d, k) => { if (i + k < 6) next[i + k] = d })
      const filled = Math.min(i + only.length, 5)
      setTimeout(() => boxes.current[filled]?.focus(), 0)
      const joined = next.join('')
      // every box filled -> submit automatically
      if (next.every((x) => x !== '')) setTimeout(() => verify(joined), 60)
      return next
    })
  }

  const onKey = (i, e) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) boxes.current[i - 1]?.focus()
    if (e.key === 'ArrowLeft' && i > 0) boxes.current[i - 1]?.focus()
    if (e.key === 'ArrowRight' && i < 5) boxes.current[i + 1]?.focus()
  }

  const input =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14.5px] text-navy-900 outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15'
  const label = 'text-[11px] font-bold uppercase tracking-wider text-slate-500'

  return (
    <div>
      <Stepper step={step} isSignup={isSignup} />

      {step === 1 ? (
        <form
          onSubmit={(e) => { e.preventDefault(); sendCode() }}
          className="mt-6"
        >
          <h2 className="text-[24px] font-extrabold tracking-tight text-navy-900">
            {isSignup ? (<>Create your <span className="text-brand">free account</span></>) : (<>Welcome <span className="text-brand">back</span></>)}
          </h2>
          <p className="mt-1.5 text-[14px] text-slate-500">
            {isSignup ? 'It takes under a minute — no password to remember.' : 'Enter your email and we’ll send you a code.'}
          </p>

          <div className="mt-6 space-y-4">
            {isSignup && (
              <div>
                <label className={label} htmlFor="mwc-name">Full name</label>
                <input id="mwc-name" name="name" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma" autoComplete="name" className={`${input} mt-2`} />
              </div>
            )}

            <div>
              <label className={label} htmlFor="mwc-email">Email address</label>
              <input id="mwc-email" name="email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul@example.com" autoComplete="email" className={`${input} mt-2`} />
            </div>
          </div>

          <p className="mt-4 flex items-start gap-2.5 rounded-xl bg-brand/[0.06] px-3.5 py-3 text-[12.5px] leading-relaxed text-slate-600">
            <ShieldCheck className="mt-[1px] h-4 w-4 shrink-0 text-brand" />
            No passwords. We email you a one-time code every time you log in.
          </p>

          {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[13px] font-medium text-red-600">{error}</p>}

          <button type="submit" disabled={busy}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 text-[15px] font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isSignup ? 'Continue' : 'Send code'} <ArrowRight className="h-4 w-4" />
          </button>

          {onSwitchMode && (
            <>
              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-slate-200" />
                <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-400">or</span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>
              <button type="button" onClick={onSwitchMode}
                className="w-full rounded-full border border-slate-300 bg-white py-3 text-[14px] font-semibold text-navy-800 transition hover:border-brand hover:text-brand">
                {isSignup ? 'I already have an account' : 'Create a new account'}
              </button>
            </>
          )}
        </form>
      ) : (
        <div className="mt-6">
          <h2 className="text-[24px] font-extrabold tracking-tight text-navy-900">
            Verify your <span className="text-brand">email</span>
          </h2>
          <p className="mt-1.5 break-words text-[14px] text-slate-500">
            We sent a 6-digit code to <b className="text-navy-800">{sentTo}</b>.
          </p>

          <div className="mt-6 flex gap-2.5" onPaste={(e) => { e.preventDefault(); setDigit(0, e.clipboardData.getData('text')) }}>
            {code.map((d, i) => (
              <input
                key={i}
                ref={(el) => (boxes.current[i] = el)}
                value={d}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => onKey(i, e)}
                inputMode="numeric"
                maxLength={6}
                aria-label={`Digit ${i + 1}`}
                className="h-14 w-full rounded-xl border border-slate-200 bg-white text-center text-[20px] font-bold text-navy-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
              />
            ))}
          </div>

          {devCode && (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12.5px] text-amber-800">
              <b>Development mode:</b> email sending isn’t configured yet, so your code is <b className="tracking-widest">{devCode}</b>.
            </p>
          )}
          {notDelivered && (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12.5px] text-amber-800">
              <b>Email sending isn’t set up on this server yet.</b> The code was written to the server log only — please ask the site
              administrator to configure the SMTP settings.
            </p>
          )}

          <div className="mt-4 flex items-center justify-between text-[13px]">
            <span className="text-slate-500">Didn’t receive it?</span>
            {secondsLeft > 0 ? (
              <span className="font-semibold text-slate-400">
                Resend in 0:{String(secondsLeft).padStart(2, '0')}
              </span>
            ) : (
              <button type="button" onClick={() => sendCode(true)} disabled={busy}
                className="font-semibold text-brand transition hover:underline">
                Resend code
              </button>
            )}
          </div>

          <p className="mt-2 text-[12.5px] text-slate-400">Can’t find it? Check your spam or promotions folder.</p>

          {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[13px] font-medium text-red-600">{error}</p>}

          <button type="button" onClick={() => verify()} disabled={busy}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 text-[15px] font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Verify &amp; continue <ArrowRight className="h-4 w-4" />
          </button>

          <button type="button" onClick={() => { setStep(1); setError('') }}
            className="mt-3 w-full text-center text-[13px] font-semibold text-slate-500 transition hover:text-navy-800">
            Change email
          </button>
        </div>
      )}

      {footer && (
        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-[12.5px] text-slate-400">
          <Mail className="h-3.5 w-3.5" /> Trouble logging in?{' '}
          <a href="/contact" className="font-semibold text-brand hover:underline">Contact support</a>
        </p>
      )}
    </div>
  )
}

function Stepper({ step, isSignup }) {
  const labels = isSignup ? ['Details', 'Verify'] : ['Email', 'Verify']
  return (
    <div className="flex items-center justify-center gap-0">
      {labels.map((l, i) => {
        const n = i + 1
        const done = step > n
        const current = step === n
        return (
          <div key={l} className="flex items-center">
            {i > 0 && (
              <span className={`mx-2 h-[2px] w-12 rounded-full transition-colors ${step > i ? 'bg-brand' : 'bg-slate-200'}`} />
            )}
            <div className="flex flex-col items-center gap-1.5">
              <span className={`grid h-9 w-9 place-items-center rounded-full text-[14px] font-bold transition ${
                done ? 'bg-brand text-white' : current ? 'border-2 border-brand bg-white text-brand' : 'bg-slate-200 text-slate-500'
              }`}>
                {done ? <Check className="h-4.5 w-4.5" strokeWidth={3} /> : n}
              </span>
              <span className={`text-[10.5px] font-bold uppercase tracking-wider ${current || done ? 'text-brand' : 'text-slate-400'}`}>
                {l}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
