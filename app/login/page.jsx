'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, ArrowRight, Loader2, ShieldCheck } from 'lucide-react'
import Navbar from '@/components/Navbar'
import SiteFooter from '@/components/property/SiteFooter'
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

  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Already logged in — skip the form.
  useEffect(() => {
    if (!loading && user) router.replace(next)
  }, [loading, user, next, router])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
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
      <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-card sm:p-8">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-brand">
            <Lock className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-[26px] font-extrabold tracking-tight text-navy-900">Owner login</h1>
          <p className="mt-1.5 text-[14px] text-slate-500">
            Use the mobile number and password you received when you listed your property.
          </p>

          {error && (
            <p className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-[13px] font-medium text-red-600">
              {error}
            </p>
          )}

          <form onSubmit={submit} className="mt-5 space-y-3.5">
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
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit mobile number"
                className="w-full px-3.5 py-3 text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] text-slate-800 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
            <button
              type="submit"
              disabled={busy || phone.length !== 10 || !password}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-800 py-3.5 text-[15px] font-semibold text-white transition hover:bg-navy-700 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Log in <ArrowRight className="h-[18px] w-[18px]" /></>}
            </button>
          </form>

          <p className="mt-5 text-center text-[13.5px] text-slate-500">
            Don’t have an account?{' '}
            <Link href="/list-property" className="font-semibold text-brand hover:underline">
              List a property
            </Link>
          </p>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[12px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5" /> Your details stay private and are never shared.
          </p>
        </div>
      </div>
      <SiteFooter />
    </main>
  )
}
