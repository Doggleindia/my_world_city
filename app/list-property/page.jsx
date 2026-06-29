'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import SiteFooter from '@/components/property/SiteFooter'
import { useAuth } from '@/components/auth/AuthProvider'
import { compressImage } from '@/lib/image'
import {
  Check, Upload, X, Loader2, ArrowRight, ArrowLeft, LogIn, PartyPopper,
} from 'lucide-react'

const CATEGORIES = ['Residential', 'Commercial', 'Industrial', 'Farm & Agri']
const LOCALITIES = ['Sitapura', 'RIICO', 'Jagatpura', 'Mansarovar', 'C-Scheme', 'Vaishali Nagar', 'Malviya Nagar']
const BADGES = ['3 BHK', '2 BHK', '4 BHK', 'Ready to move', 'Under construction', 'Freehold', 'Corner plot', 'Gated']
const AMENITIES = [
  { icon: 'Users', label: 'Clubhouse' },
  { icon: 'ShieldCheck', label: '24×7 Security' },
  { icon: 'Zap', label: 'Power Backup' },
  { icon: 'ArrowUpDown', label: 'Lift' },
  { icon: 'Trees', label: 'Landscaped Park' },
  { icon: 'Droplet', label: 'Water 24×7' },
  { icon: 'Fence', label: 'Gated Community' },
  { icon: 'Dumbbell', label: 'Gym' },
]
const STEPS = ['Basics', 'Photos', 'Details', 'Review']

function priceLabel(n) {
  if (!n) return ''
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`
  return `₹${Math.round(n / 100_000)} L`
}

export default function ListPropertyPage() {
  const { user, loading, openLogin } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    category: 'Residential',
    listingType: 'buy',
    price: '',
    area: '',
    locality: LOCALITIES[0],
    main: '',
    thumbs: [],
    badges: [],
    amenities: [],
    description: '',
  })
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const toggleIn = (k, v) =>
    setForm((f) => ({
      ...f,
      [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v],
    }))

  const [uploading, setUploading] = useState(false)
  const upload = async (file, target) => {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const compressed = await compressImage(file)
      const fd = new FormData()
      fd.append('file', compressed)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      if (target === 'main') set('main', data.url)
      else set('thumbs', [...form.thumbs, data.url].slice(0, 4))
    } catch (e) {
      setError(e.message)
    } finally {
      setUploading(false)
    }
  }

  const canNext =
    step === 0
      ? form.title.trim().length >= 3 && form.locality
      : step === 1
        ? !!form.main
        : true

  const submit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const price = form.price ? Number(form.price) : undefined
      const payload = {
        title: form.title.trim(),
        category: form.category,
        listingType: form.listingType,
        price,
        priceLabel: priceLabel(price),
        area: form.area || undefined,
        location: { locality: form.locality, city: 'Jaipur' },
        badges: form.badges,
        amenities: form.amenities.map((label) => AMENITIES.find((a) => a.label === label)),
        gallery: { main: form.main, thumbs: form.thumbs },
        description: form.description || undefined,
      }
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not create listing')
      setDone(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <Navbar cta="brand" />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {loading ? (
          <div className="flex justify-center py-24 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : !user ? (
          <Gate onLogin={openLogin} />
        ) : done ? (
          <Success onDashboard={() => router.push('/dashboard')} />
        ) : (
          <>
            <h1 className="text-[28px] font-extrabold tracking-tight text-navy-900 sm:text-[34px]">
              List your property — free
            </h1>
            <p className="mt-1.5 text-[14px] text-slate-500">
              Verified listings get more genuine buyer leads. It takes ~2 minutes.
            </p>

            {/* Stepper */}
            <div className="mt-7 flex items-center gap-2">
              {STEPS.map((s, i) => (
                <div key={s} className="flex flex-1 items-center gap-2">
                  <div
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[13px] font-bold ${
                      i < step
                        ? 'bg-emerald-500 text-white'
                        : i === step
                          ? 'bg-brand text-white'
                          : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {i < step ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={`hidden text-[12.5px] font-semibold sm:block ${i === step ? 'text-navy-800' : 'text-slate-400'}`}>
                    {s}
                  </span>
                  {i < STEPS.length - 1 && <div className="h-0.5 flex-1 bg-slate-200" />}
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
              {error && (
                <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-[13px] font-medium text-red-600">
                  {error}
                </p>
              )}

              {step === 0 && <Basics form={form} set={set} />}
              {step === 1 && (
                <Photos form={form} set={set} upload={upload} uploading={uploading} />
              )}
              {step === 2 && <Details form={form} set={set} toggleIn={toggleIn} />}
              {step === 3 && <Review form={form} />}

              <div className="mt-7 flex items-center justify-between">
                <button
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-[14px] font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-0"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>

                {step < STEPS.length - 1 ? (
                  <button
                    onClick={() => setStep((s) => s + 1)}
                    disabled={!canNext}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-navy-800 px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-navy-700 disabled:opacity-50"
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={submit}
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit for review'}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <SiteFooter />
    </main>
  )
}

/* ---- Steps ---- */

const inputCls =
  'w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] text-slate-800 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20'

function Label({ children }) {
  return <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-500">{children}</span>
}

function Basics({ form, set }) {
  return (
    <div className="space-y-4">
      <label className="block">
        <Label>Listing title</Label>
        <input
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="e.g. Modern 3BHK Villa"
          className={inputCls}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <Label>Category</Label>
          <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputCls}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <Label>Locality</Label>
          <select value={form.locality} onChange={(e) => set('locality', e.target.value)} className={inputCls}>
            {LOCALITIES.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <Label>Listing type</Label>
        <div className="flex gap-2.5">
          {['buy', 'rent'].map((t) => (
            <button
              key={t}
              onClick={() => set('listingType', t)}
              className={`flex-1 rounded-xl border px-4 py-2.5 text-[14px] font-semibold capitalize transition ${
                form.listingType === t
                  ? 'border-brand bg-brand/5 text-brand'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {t === 'buy' ? 'Sell' : 'Rent'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <Label>Price (₹)</Label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
            placeholder="12500000"
            className={inputCls}
          />
          {form.price ? (
            <span className="mt-1 block text-[12px] font-semibold text-brand">{priceLabel(Number(form.price))}</span>
          ) : null}
        </label>
        <label className="block">
          <Label>Area</Label>
          <input
            value={form.area}
            onChange={(e) => set('area', e.target.value)}
            placeholder="e.g. 2,400 sq ft"
            className={inputCls}
          />
        </label>
      </div>
    </div>
  )
}

function Photos({ form, set, upload, uploading }) {
  return (
    <div className="space-y-5">
      <div>
        <Label>Main photo</Label>
        {form.main ? (
          <div className="relative h-48 w-full overflow-hidden rounded-xl">
            <img src={form.main} alt="main" className="h-full w-full object-cover" />
            <button
              onClick={() => set('main', '')}
              className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <UploadBox onPick={(f) => upload(f, 'main')} busy={uploading} label="Upload main photo" />
        )}
      </div>

      <div>
        <Label>More photos (up to 4)</Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {form.thumbs.map((t, i) => (
            <div key={i} className="relative h-24 overflow-hidden rounded-lg">
              <img src={t} alt={`thumb ${i + 1}`} className="h-full w-full object-cover" />
              <button
                onClick={() => set('thumbs', form.thumbs.filter((_, j) => j !== i))}
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {form.thumbs.length < 4 && (
            <UploadBox onPick={(f) => upload(f, 'thumb')} busy={uploading} small />
          )}
        </div>
      </div>
    </div>
  )
}

function UploadBox({ onPick, busy, label = 'Upload', small }) {
  return (
    <label
      className={`flex ${small ? 'h-24' : 'h-48'} cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 transition hover:border-brand hover:text-brand`}
    >
      {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
      {!small && <span className="text-[13px] font-medium">{label}</span>}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0])}
      />
    </label>
  )
}

function Details({ form, toggleIn, set }) {
  return (
    <div className="space-y-5">
      <div>
        <Label>Highlights</Label>
        <div className="flex flex-wrap gap-2">
          {BADGES.map((b) => (
            <Chip key={b} active={form.badges.includes(b)} onClick={() => toggleIn('badges', b)}>
              {b}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <Label>Amenities</Label>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((a) => (
            <Chip key={a.label} active={form.amenities.includes(a.label)} onClick={() => toggleIn('amenities', a.label)}>
              {a.label}
            </Chip>
          ))}
        </div>
      </div>
      <label className="block">
        <Label>Description</Label>
        <textarea
          rows={5}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Describe the property, neighbourhood, and what makes it special…"
          className={`${inputCls} resize-none`}
        />
      </label>
    </div>
  )
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition ${
        active ? 'border-brand bg-brand/5 text-brand' : 'border-slate-200 text-slate-600 hover:border-slate-300'
      }`}
    >
      {children}
    </button>
  )
}

function Review({ form }) {
  const rows = [
    ['Title', form.title],
    ['Category', form.category],
    ['Type', form.listingType === 'buy' ? 'Sell' : 'Rent'],
    ['Locality', form.locality],
    ['Price', form.price ? priceLabel(Number(form.price)) : '—'],
    ['Area', form.area || '—'],
    ['Highlights', form.badges.join(', ') || '—'],
    ['Amenities', form.amenities.join(', ') || '—'],
  ]
  return (
    <div>
      {form.main && (
        <img src={form.main} alt="preview" className="mb-4 h-48 w-full rounded-xl object-cover" />
      )}
      <dl className="divide-y divide-slate-100">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-6 py-2.5">
            <dt className="text-[13px] text-slate-500">{k}</dt>
            <dd className="text-right text-[13.5px] font-semibold text-navy-800">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-[12.5px] text-amber-700">
        Your listing will be reviewed by our team before going live.
      </p>
    </div>
  )
}

function Gate({ onLogin }) {
  return (
    <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
      <LogIn className="h-9 w-9 text-slate-300" />
      <h2 className="mt-3 text-[18px] font-bold text-navy-800">Login to list your property</h2>
      <p className="mt-1.5 max-w-xs text-[14px] text-slate-500">
        We’ll send a one-time code to your phone to get started.
      </p>
      <button
        onClick={onLogin}
        className="mt-6 rounded-full bg-brand px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-brand-700"
      >
        Login
      </button>
    </div>
  )
}

function Success({ onDashboard }) {
  return (
    <div className="mt-10 flex flex-col items-center rounded-2xl border border-slate-200 bg-white py-20 text-center shadow-card">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white">
        <PartyPopper className="h-8 w-8" />
      </span>
      <h2 className="mt-5 text-[24px] font-extrabold text-navy-800">Listing submitted!</h2>
      <p className="mt-2 max-w-sm text-[14px] text-slate-500">
        It’s now pending review. You’ll find it under your dashboard, and it goes live once approved.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={onDashboard}
          className="rounded-full bg-navy-800 px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-navy-700"
        >
          Go to dashboard
        </button>
        <Link
          href="/find-property"
          className="rounded-full border border-slate-300 px-6 py-3 text-[14px] font-semibold text-slate-700 transition hover:border-slate-400"
        >
          Browse properties
        </Link>
      </div>
    </div>
  )
}
