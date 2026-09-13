'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Loader2, ShieldCheck } from 'lucide-react'
import Navbar from '@/components/Navbar'
import SiteFooter from '@/components/property/SiteFooter'
import OtpAuth from '@/components/auth/OtpAuth'
import { useAuth } from '@/components/auth/AuthProvider'

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  )
}

function LoginInner() {
  const { user, loading, refresh } = useAuth()
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/dashboard'
  // ?signup=1 opens straight on the create-account form.
  const [mode, setMode] = useState(params.get('signup') ? 'signup' : 'login')
  // Owners issued a temporary password can still sign in the old way.
  const [usePassword, setUsePassword] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!loading && user) router.replace(next)
  }, [loading, user, next, router])

  const submitPassword = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      await refresh()
      router.replace(next)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <Navbar cta="brand" />
      <div className="mx-auto flex max-w-md flex-col px-4 py-14 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-card sm:p-8">
          {usePassword ? (
            <>
              <h1 className="text-[24px] font-extrabold tracking-tight text-navy-900">
                Log in with a <span className="text-brand">password</span>
              </h1>
              <p className="mt-1.5 text-[14px] text-slate-500">
                For owner accounts issued a password when the property was listed.
              </p>

              {error && (
                <p className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-[13px] font-medium text-red-600">{error}</p>
              )}

              <form onSubmit={submitPassword} className="mt-5 space-y-3.5">
                <input
                  autoFocus type="email" required autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] text-slate-800 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
                <input
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] text-slate-800 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
                <button
                  type="submit" disabled={busy || !email.trim() || !password}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-navy-800 py-3.5 text-[15px] font-semibold text-white transition hover:bg-navy-700 disabled:opacity-50"
                >
                  {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Log in <ArrowRight className="h-[18px] w-[18px]" /></>}
                </button>
              </form>

              <button
                type="button" onClick={() => { setUsePassword(false); setError('') }}
                className="mt-5 w-full text-center text-[13.5px] font-semibold text-brand hover:underline"
              >
                Use a one-time code instead
              </button>
            </>
          ) : (
            <>
              <OtpAuth
                mode={mode}
                onSwitchMode={() => setMode((m) => (m === 'signup' ? 'login' : 'signup'))}
                onDone={async () => {
                  await refresh()
                  router.replace(next)
                }}
                footer={false}
              />
              <button
                type="button" onClick={() => setUsePassword(true)}
                className="mt-5 w-full text-center text-[13px] font-semibold text-slate-500 transition hover:text-navy-800"
              >
                Owner with a password? Log in here
              </button>
            </>
          )}

          <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[12px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5" /> Your details stay private and are never shared.
          </p>
        </div>

        <p className="mt-5 text-center text-[13.5px] text-slate-500">
          Want to list a property?{' '}
          <Link href="/list-property" className="font-semibold text-brand hover:underline">
            List it free
          </Link>
        </p>
      </div>
      <SiteFooter />
    </main>
  )
}
