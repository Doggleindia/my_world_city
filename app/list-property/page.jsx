'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, ArrowRight, Building, Building2, Camera, Check, CheckCircle2, CircleEllipsis,
  Compass, DoorOpen, Home, Loader2, MapPin, Mountain, Plus, Target, Trash2, User as UserIcon,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import SiteFooter from '@/components/property/SiteFooter'
import { useAuth } from '@/components/auth/AuthProvider'
import {
  PROFESSIONS, PROPERTY_TYPES, CONFIGURATIONS, POSSESSION, PHOTO_SLOTS,
  NEARBY_TYPES, LEAD_SOURCES, LEADS_MIN, LEADS_MAX, typeMeta,
} from '@/lib/listingWizard'

const TYPE_ICONS = { Building2, Home, Building, Mountain, DoorOpen, CircleEllipsis }

const STEPS = [
  { title: 'About you', heading: 'Let’s get to know you', sub: 'We’ll use these details to set up your account and stay in touch.', icon: UserIcon },
  { title: 'Property basics', heading: 'Tell us about the property', sub: 'Just the essentials buyers care about — type, size, price and possession.', icon: Home },
  { title: 'Address', heading: 'Where is the property located?', sub: 'Add the address so we can match buyers in the right area.', icon: MapPin },
  { title: 'Photos', heading: 'Add photos of the property', sub: 'Upload one clear photo for each space. Well-labelled listings get more high-intent leads.', icon: Camera },
  { title: 'Nearby & connectivity', heading: 'What’s nearby?', sub: 'Add nearby landmarks buyers care about — schools, hospitals, transport. You can skip this.', icon: Compass },
  { title: 'Your goals', heading: 'What are your goals?', sub: 'Set your monthly lead target — and optionally tell us where you’d like leads from.', icon: Target },
  { title: 'Review & submit', heading: 'Review & submit', sub: 'Quick check before you send this to our team for approval.', icon: CheckCircle2 },
]

const EMPTY = {
  name: '', phone: '', email: '', profession: '',
  title: '', propertyType: 'apartment', configuration: [], area: '', bathrooms: '',
  priceLabel: '', negotiable: true, possession: 'ready', possessionDate: '', description: '',
  address: '', locality: '', landmark: '', pincode: '', city: 'Jaipur', state: 'Rajasthan', country: 'India',
  photos: {}, nearby: [{ type: 'school', name: '', distanceKm: '' }],
  leadGoal: 120, leadSources: [],
}

export default function ListPropertyPage() {
  const { user, loading, refresh } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [verifying, setVerifying] = useState(false) // guest OTP gate after step 1

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const toggle = (k, v) =>
    setForm((f) => ({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] }))

  // Prefill from the signed-in account so returning owners don't retype.
  useEffect(() => {
    if (!user) return
    setForm((f) => ({
      ...f,
      name: f.name || user.name || '',
      phone: f.phone || user.phone || '',
      email: f.email || user.email || '',
      profession: f.profession || user.profession || '',
    }))
  }, [user])

  const stepValid = useCallback(() => {
    if (step === 0) return form.name.trim().length >= 2 && /^[6-9]\d{9}$/.test(form.phone) && !!form.profession
    if (step === 1) return form.title.trim().length >= 3 && !!form.propertyType
    if (step === 2) {
      const pinOk = !form.pincode || /^[1-9][0-9]{5}$/.test(form.pincode)
      return form.locality.trim().length >= 2 && form.city.trim().length >= 2 && pinOk
    }
    if (step === 3) return Object.keys(form.photos).length >= 1
    return true
  }, [step, form])

  const next = async () => {
    setError('')
    if (!stepValid()) return setError(hint(step))
    // A guest proves their number once, right after the About-you step. That
    // creates their account, so photo uploads and the submission work.
    if (step === 0 && !user) return setVerifying(true)
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const back = () => { setError(''); setStep((s) => Math.max(0, s - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const submit = async () => {
    setError('')
    setBusy(true)
    try {
      const meta = typeMeta(form.propertyType)
      const photos = PHOTO_SLOTS.filter((s) => form.photos[s.key]).map((s) => ({
        slot: s.key, label: s.label, url: form.photos[s.key],
      }))
      if (!photos.length) throw new Error('Add at least one photo before submitting')

      const payload = {
        title: form.title.trim(),
        category: meta.category,
        listingType: meta.listingType,
        priceLabel: form.priceLabel || undefined,
        area: form.area || undefined,
        location: { locality: form.locality.trim(), city: form.city.trim() },
        gallery: { main: photos[0].url, thumbs: photos.slice(1).map((p) => p.url) },
        description: form.description || undefined,
        profession: form.profession,
        propertyType: form.propertyType,
        configuration: form.configuration,
        bathrooms: form.bathrooms || undefined,
        possession: POSSESSION.find((p) => p.key === form.possession)?.label,
        possessionDate: form.possessionDate || undefined,
        negotiable: form.negotiable,
        address: form.address || undefined,
        landmark: form.landmark || undefined,
        pincode: form.pincode || '',
        state: form.state || undefined,
        country: form.country || undefined,
        photos,
        nearby: form.nearby
          .filter((n) => n.name.trim())
          .map((n) => {
            const km = Number(n.distanceKm)
            return { type: n.type, name: n.name.trim(), distanceKm: Number.isFinite(km) && n.distanceKm !== '' ? km : undefined }
          }),
        leadGoal: form.leadGoal,
        leadSources: form.leadSources,
        ...(user ? {} : { name: form.name.trim(), phone: form.phone, email: form.email || undefined }),
      }
      const res = await fetch('/api/listings/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        // The API reports which field failed — say so instead of "Validation failed".
        const detail = data.issues
          ? Object.entries(data.issues).map(([k, v]) => `${k}: ${[].concat(v).join(', ')}`).join(' · ')
          : ''
        throw new Error(detail || data.error || 'Could not submit listing')
      }
      await refresh()
      setDone(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  if (done) return <Success name={form.name} onDashboard={() => router.push('/dashboard')} />

  const S = STEPS[step]
  const pct = ((step + 1) / STEPS.length) * 100

  return (
    <main className="min-h-screen bg-[#f5f6f8] text-slate-900">
      <Navbar cta="brand" />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
          <div className="p-6 sm:p-8">
            {/* progress */}
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] font-bold uppercase tracking-wider text-brand">
                Step {step + 1} <span className="text-slate-400">of {STEPS.length}</span>
              </span>
              <span className="text-[13px] font-semibold text-slate-500">{S.title}</span>
            </div>
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-800 to-brand transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>

            {/* heading */}
            <div className="mt-7 flex items-start gap-3.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                <S.icon className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-[21px] font-extrabold tracking-tight text-navy-900 sm:text-[24px]">{S.heading}</h1>
                <p className="mt-1 text-[13.5px] leading-relaxed text-slate-500">{S.sub}</p>
              </div>
            </div>

            <div className="mt-7">
              {verifying ? (
                <VerifyGate
                  form={form}
                  onCancel={() => setVerifying(false)}
                  onVerified={async () => { setVerifying(false); await refresh(); setStep(1) }}
                />
              ) : (
                <>
                  {step === 0 && <AboutYou form={form} set={set} locked={!!user} />}
                  {step === 1 && <Basics form={form} set={set} toggle={toggle} />}
                  {step === 2 && <Address form={form} set={set} />}
                  {step === 3 && <Photos form={form} set={set} onError={setError} />}
                  {step === 4 && <Nearby form={form} set={set} />}
                  {step === 5 && <Goals form={form} set={set} toggle={toggle} />}
                  {step === 6 && <Review form={form} />}
                </>
              )}
            </div>

            {error && (
              <p className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-[13px] font-medium text-red-600">{error}</p>
            )}
          </div>

          {!verifying && (
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/70 px-6 py-4 sm:px-8">
              <button
                type="button" onClick={back} disabled={step === 0}
                className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-slate-500 transition hover:text-navy-800 disabled:invisible"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              {step < STEPS.length - 1 ? (
                <button
                  type="button" onClick={next}
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3 text-[14.5px] font-semibold text-white transition hover:bg-brand-700"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button" onClick={submit} disabled={busy}
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3 text-[14.5px] font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Submit application <Check className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-[12.5px] text-slate-400">
          Listing is free. Our team reviews every submission before it goes live.
        </p>
      </div>
      <SiteFooter />
    </main>
  )
}

function hint(step) {
  return [
    'Add your name, a valid 10-digit mobile number, and tell us what you do.',
    'Give the property a name and pick its type.',
    'Add at least the area/street and city — and a 6-digit pincode if you enter one.',
    'Upload at least one photo.',
  ][step] || 'Please complete this step.'
}

/* ---------------- shared bits ---------------- */

const field =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-[14px] text-navy-900 outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15'
const lab = 'text-[12.5px] font-semibold text-slate-600'

function Field({ label, children, hint }) {
  return (
    <div>
      <label className={lab}>{label}</label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-[11.5px] text-slate-400">{hint}</p>}
    </div>
  )
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button" onClick={onClick}
      className={`rounded-full border px-4 py-2 text-[13.5px] font-semibold transition ${
        active ? 'border-brand bg-brand/5 text-brand' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
      }`}
    >
      {children}
    </button>
  )
}

/* ---------------- step 1 ---------------- */

function AboutYou({ form, set, locked }) {
  return (
    <div className="space-y-5">
      <Field label="Full name">
        <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Rahul Sharma" className={field} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Contact number">
          <div className="flex gap-2">
            <span className="grid w-[58px] shrink-0 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-[14px] font-semibold text-slate-600">+91</span>
            <input
              value={form.phone} disabled={locked} inputMode="numeric"
              onChange={(e) => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="98100 24680" className={`${field} disabled:bg-slate-50 disabled:text-slate-500`}
            />
          </div>
        </Field>
        <Field label="Email address">
          <input value={form.email} onChange={(e) => set('email', e.target.value)} type="email" placeholder="rahul@example.com" className={field} />
        </Field>
      </div>

      <Field label="I am a...">
        <div className="grid grid-cols-3 gap-3">
          {PROFESSIONS.map((p) => {
            const on = form.profession === p.key
            return (
              <button
                key={p.key} type="button" onClick={() => set('profession', p.key)}
                className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-[13px] font-semibold transition ${
                  on ? 'border-brand bg-brand/5 text-brand' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <span className="text-[22px] leading-none">{p.icon}</span>
                {p.label}
              </button>
            )
          })}
        </div>
      </Field>
    </div>
  )
}

/* ---------------- guest OTP gate ---------------- */

function VerifyGate({ form, onVerified, onCancel }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [devCode, setDevCode] = useState('')
  const [left, setLeft] = useState(30)
  const sent = useRef(false)

  const send = useCallback(async () => {
    setError('')
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, name: form.name.trim(), email: form.email.trim() }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Could not send the code')
      setDevCode(d.devCode || '')
      setLeft(30)
    } catch (e) { setError(e.message) }
  }, [form.phone, form.name, form.email])

  useEffect(() => { if (!sent.current) { sent.current = true; send() } }, [send])
  useEffect(() => { if (left <= 0) return; const t = setTimeout(() => setLeft((s) => s - 1), 1000); return () => clearTimeout(t) }, [left])

  const verify = async () => {
    setError('')
    setBusy(true)
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, code }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Could not verify the code')
      onVerified()
    } catch (e) { setError(e.message); setBusy(false) }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
      <h2 className="text-[17px] font-bold text-navy-900">Verify your number</h2>
      <p className="mt-1 text-[13.5px] text-slate-500">
        We sent a 6-digit code to +91 {form.phone}. This creates your free account so you can manage the listing later.
      </p>
      <input
        value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        inputMode="numeric" placeholder="Enter 6-digit code" aria-label="Verification code"
        className={`${field} mt-4 max-w-[220px] tracking-[0.4em]`}
      />
      {devCode && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12.5px] text-amber-800">
          <b>Development mode:</b> no SMS gateway is connected, so your code is <b className="tracking-widest">{devCode}</b>.
        </p>
      )}
      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[13px] font-medium text-red-600">{error}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button" onClick={verify} disabled={busy || code.length !== 6}
          className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-[14px] font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Verify &amp; continue <ArrowRight className="h-4 w-4" />
        </button>
        {left > 0 ? (
          <span className="text-[13px] font-semibold text-slate-400">Resend in 0:{String(left).padStart(2, '0')}</span>
        ) : (
          <button type="button" onClick={send} className="text-[13px] font-semibold text-brand hover:underline">Resend code</button>
        )}
        <button type="button" onClick={onCancel} className="text-[13px] font-semibold text-slate-500 hover:text-navy-800">Change details</button>
      </div>
    </div>
  )
}

/* ---------------- step 2 ---------------- */

function Basics({ form, set, toggle }) {
  return (
    <div className="space-y-5">
      <Field label="Property / project name">
        <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Skyline Residences" className={field} />
      </Field>

      <Field label="Property type">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PROPERTY_TYPES.map((t) => {
            const Icon = TYPE_ICONS[t.icon] || Home
            const on = form.propertyType === t.key
            return (
              <button
                key={t.key} type="button" onClick={() => set('propertyType', t.key)}
                className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-3.5 text-[13px] font-semibold transition ${
                  on ? 'border-brand bg-brand/5 text-brand' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                {t.label}
              </button>
            )
          })}
        </div>
      </Field>

      <Field label="Configuration">
        <div className="flex flex-wrap gap-2.5">
          {CONFIGURATIONS.map((c) => (
            <Chip key={c} active={form.configuration.includes(c)} onClick={() => toggle('configuration', c)}>{c}</Chip>
          ))}
        </div>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Built-up area (sq.ft.)">
          <input value={form.area} onChange={(e) => set('area', e.target.value)} placeholder="1,800 – 2,650" className={field} />
        </Field>
        <Field label="Bathrooms">
          <select value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} className={field}>
            <option value="">Select</option>
            {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <Field label="Price range">
          <input value={form.priceLabel} onChange={(e) => set('priceLabel', e.target.value)} placeholder="₹2.1 Cr – ₹3.4 Cr" className={field} />
        </Field>
        <div className="flex items-center gap-3 pb-1">
          <span className="text-[13.5px] font-semibold text-slate-600">Negotiable</span>
          <button
            type="button" onClick={() => set('negotiable', !form.negotiable)} aria-pressed={form.negotiable}
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${form.negotiable ? 'bg-brand' : 'bg-slate-300'}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${form.negotiable ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
        </div>
      </div>

      <Field label="Possession status">
        <div className="flex flex-wrap items-center gap-2.5">
          {POSSESSION.map((p) => (
            <Chip key={p.key} active={form.possession === p.key} onClick={() => set('possession', p.key)}>{p.label}</Chip>
          ))}
          {form.possession === 'under_construction' && (
            <input
              value={form.possessionDate} onChange={(e) => set('possessionDate', e.target.value)}
              placeholder="Expected possession…" className={`${field} max-w-[220px] py-2`}
            />
          )}
        </div>
      </Field>

      <Field
        label="Property details"
        hint="e.g. 3 BHK apartment, 1,850 sq.ft., ₹2.2 Cr. Includes clubhouse, parking & 24×7 security."
      >
        <textarea
          rows={4} value={form.description} onChange={(e) => set('description', e.target.value)}
          placeholder="3 & 4 BHK apartments with clubhouse, pool and 24×7 security. Ready-to-move, close to NH-48."
          className={field}
        />
      </Field>
    </div>
  )
}

/* ---------------- step 3 ---------------- */

function Address({ form, set }) {
  return (
    <div className="space-y-5">
      <Field label="Flat / House no. / Building">
        <input value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Tower B-1204, Skyline Residences" className={field} />
      </Field>
      <Field label="Area / Street / Sector">
        <input value={form.locality} onChange={(e) => set('locality', e.target.value)} placeholder="Sitapura, Tonk Road" className={field} />
      </Field>
      <Field label="Landmark (optional)">
        <input value={form.landmark} onChange={(e) => set('landmark', e.target.value)} placeholder="e.g. near World Trade Park" className={field} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Pincode">
          <input value={form.pincode} onChange={(e) => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="302017" className={field} />
        </Field>
        <Field label="City">
          <input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Jaipur" className={field} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="State"><input value={form.state} onChange={(e) => set('state', e.target.value)} className={field} /></Field>
        <Field label="Country"><input value={form.country} onChange={(e) => set('country', e.target.value)} className={field} /></Field>
      </div>
      <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5">
        <span className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-brand shadow-sm"><MapPin className="h-4 w-4" /></span>
          <span>
            <span className="block text-[13.5px] font-semibold text-navy-800">Pin exact location on map</span>
            <span className="block text-[12px] text-slate-500">Helps buyers find your entrance</span>
          </span>
        </span>
        <span className="text-[13px] font-semibold text-slate-400">Coming soon</span>
      </div>
    </div>
  )
}

/* ---------------- step 4 ---------------- */

function Photos({ form, set, onError }) {
  const [busySlot, setBusySlot] = useState('')

  const upload = async (slotKey, file) => {
    if (!file) return
    setBusySlot(slotKey)
    onError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      set('photos', { ...form.photos, [slotKey]: data.url })
    } catch (e) {
      onError(e.message)
    } finally {
      setBusySlot('')
    }
  }

  const remove = (slotKey) => {
    const next = { ...form.photos }
    delete next[slotKey]
    set('photos', next)
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        {PHOTO_SLOTS.map((s) => {
          const url = form.photos[s.key]
          return url ? (
            <div key={s.key} className="relative overflow-hidden rounded-xl border border-slate-200">
              <img src={url} alt={s.label} className="aspect-[4/3] w-full object-cover" />
              <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-1 text-[11.5px] font-semibold text-navy-800 shadow-sm">
                {s.label}
              </span>
              <button
                type="button" onClick={() => remove(s.key)} aria-label={`Remove ${s.label}`}
                className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-red-500 shadow-sm transition hover:bg-white"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label
              key={s.key}
              className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/60 text-center transition hover:border-brand hover:bg-brand/5"
            >
              <input
                type="file" accept="image/*" className="hidden"
                onChange={(e) => upload(s.key, e.target.files?.[0])}
              />
              {busySlot === s.key ? (
                <Loader2 className="h-5 w-5 animate-spin text-brand" />
              ) : (
                <Plus className="h-5 w-5 text-brand" />
              )}
              <span className="text-[13px] font-semibold text-navy-800">{s.label}</span>
              <span className="text-[11.5px] text-slate-400">Add photo</span>
            </label>
          )
        })}
      </div>
      <p className="mt-4 text-center text-[12px] text-slate-400">
        JPEG, PNG or WebP up to 8&nbsp;MB each. The first photo becomes the cover image.
      </p>
    </div>
  )
}

/* ---------------- step 5 ---------------- */

function Nearby({ form, set }) {
  const update = (i, k, v) => set('nearby', form.nearby.map((n, x) => (x === i ? { ...n, [k]: v } : n)))
  return (
    <div>
      <div className="space-y-3">
        {form.nearby.map((n, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/60 p-2.5">
            <select value={n.type} onChange={(e) => update(i, 'type', e.target.value)} className={`${field} w-auto min-w-[150px] py-2`}>
              {NEARBY_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
            <input
              value={n.name} onChange={(e) => update(i, 'name', e.target.value)}
              placeholder="Name of the place" className={`${field} min-w-[160px] flex-1 py-2`}
            />
            <div className="flex items-center gap-1.5">
              <input
                value={n.distanceKm} onChange={(e) => update(i, 'distanceKm', e.target.value.replace(/[^\d.]/g, ''))}
                placeholder="1.8" inputMode="decimal" className={`${field} w-[74px] py-2 text-center`}
              />
              <span className="text-[13px] font-semibold text-slate-400">km</span>
            </div>
            {form.nearby.length > 1 && (
              <button
                type="button" onClick={() => set('nearby', form.nearby.filter((_, x) => x !== i))}
                aria-label="Remove place" className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-white hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button" onClick={() => set('nearby', [...form.nearby, { type: 'school', name: '', distanceKm: '' }])}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-3.5 text-[14px] font-semibold text-brand transition hover:border-brand hover:bg-brand/5"
      >
        <Plus className="h-4 w-4" /> Add nearby place
      </button>
      <p className="mt-3 text-center text-[12px] text-slate-400">
        Add as many as you like — more landmarks help buyers picture the location.
      </p>
    </div>
  )
}

/* ---------------- step 6 ---------------- */

function Goals({ form, set, toggle }) {
  return (
    <div className="space-y-6">
      <Field label="Leads needed per month">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-center">
          <p className="text-[34px] font-extrabold leading-none text-brand">
            {form.leadGoal} <span className="text-[15px] font-semibold text-slate-500">leads</span>
          </p>
          <input
            type="range" min={LEADS_MIN} max={LEADS_MAX} step={10} value={form.leadGoal}
            onChange={(e) => set('leadGoal', Number(e.target.value))}
            aria-label="Leads needed per month"
            className="mt-4 w-full accent-[#1f5fbf]"
          />
          <div className="mt-1 flex justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <span>{LEADS_MIN} leads</span><span>{LEADS_MAX} leads</span>
          </div>
        </div>
      </Field>

      <Field label="Where would you like your leads from? (optional)" hint="Preferences only — they help us tailor your campaign.">
        <div className="grid gap-3 sm:grid-cols-2">
          {LEAD_SOURCES.map((s) => {
            const on = form.leadSources.includes(s)
            return (
              <button
                key={s} type="button" onClick={() => toggle('leadSources', s)}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-[13.5px] font-semibold transition ${
                  on ? 'border-brand bg-brand/5 text-brand' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {s}
                {on && <CheckCircle2 className="h-4 w-4" />}
              </button>
            )
          })}
        </div>
      </Field>

      <p className="flex items-start gap-2.5 rounded-xl bg-brand/[0.06] px-3.5 py-3 text-[12.5px] leading-relaxed text-slate-600">
        <CheckCircle2 className="mt-[1px] h-4 w-4 shrink-0 text-brand" />
        My World City prices every campaign on volume. We’ll share a quote once your listing is approved.
      </p>
    </div>
  )
}

/* ---------------- step 7 ---------------- */

function Review({ form }) {
  const t = typeMeta(form.propertyType)
  const prof = PROFESSIONS.find((p) => p.key === form.profession)
  const rows = [
    ['Full name', form.name],
    ['Phone number', form.phone ? `+91 ${form.phone}` : '—'],
    ['Email address', form.email || '—'],
    ['Role / Type', prof?.label || '—'],
    ['Property & type', `${form.title || '—'} · ${t.label}`],
    ['Configuration', form.configuration.join(', ') || '—'],
    ['Price', `${form.priceLabel || '—'}${form.negotiable ? ' · Negotiable' : ''}`],
    ['Location', [form.locality, form.city].filter(Boolean).join(', ') || '—'],
  ]
  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-slate-200">
        {rows.map(([k, v], i) => (
          <div key={k} className={`flex items-start justify-between gap-4 px-4 py-3.5 ${i % 2 ? 'bg-slate-50/70' : 'bg-white'}`}>
            <span className="text-[13px] text-slate-500">{k}</span>
            <span className="text-right text-[13.5px] font-semibold text-navy-900">{v}</span>
          </div>
        ))}
        <div className="flex items-start justify-between gap-4 bg-brand/5 px-4 py-3.5">
          <span className="text-[13px] font-semibold text-brand">Lead volume &amp; assets</span>
          <span className="text-right text-[13.5px] font-bold text-brand">
            {form.leadGoal} leads, {Object.keys(form.photos).length} photo{Object.keys(form.photos).length === 1 ? '' : 's'}
          </span>
        </div>
      </div>
      <p className="mt-4 flex items-start gap-2.5 rounded-xl bg-slate-50 px-3.5 py-3 text-[12.5px] leading-relaxed text-slate-600">
        <CheckCircle2 className="mt-[1px] h-4 w-4 shrink-0 text-brand" />
        After you submit, our team reviews your details and approves the listing — usually within 24 hours.
      </p>
    </div>
  )
}

/* ---------------- success ---------------- */

function Success({ name, onDashboard }) {
  const first = (name || '').trim().split(' ')[0]
  return (
    <main className="min-h-screen bg-[#f5f6f8] text-slate-900">
      <Navbar cta="brand" />
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-card">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand text-white">
            <Check className="h-8 w-8" strokeWidth={3} />
          </span>
          <h1 className="mt-5 text-[26px] font-extrabold tracking-tight text-navy-900">
            Thank you{first ? `, ${first}` : ''}! 🎉
          </h1>
          <p className="mx-auto mt-2.5 max-w-md text-[14px] leading-relaxed text-slate-500">
            Your details have been submitted. Our team will contact you shortly and approve your listing.
            Once approved it goes live and verified buyer leads start arriving.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3.5 py-1.5 text-[12.5px] font-semibold text-brand">
              <CheckCircle2 className="h-3.5 w-3.5" /> Details submitted
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1.5 text-[12.5px] font-semibold text-slate-500">
              ⏳ Team review
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1.5 text-[12.5px] font-semibold text-slate-500">
              🚀 Listing live
            </span>
          </div>

          <button
            onClick={onDashboard}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-[15px] font-semibold text-white transition hover:bg-brand-700"
          >
            Go to my dashboard <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-3 text-[12px] text-slate-400">Typical review time: 24–48 hours</p>
        </div>
      </div>
      <SiteFooter />
    </main>
  )
}
