'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'

const TYPES = ['General enquiry', 'Site visit', 'Pricing & availability', 'Investment', 'Something else']
const PHONE_RE = /^[6-9]\d{9}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// "Make an enquiry" at the foot of a property page. Files a real lead against
// the property, so it lands in the admin console like any other enquiry.
export default function EnquireForm({ propertyId, propertyTitle }) {
  const [f, setF] = useState({
    enquiryType: TYPES[0], firstName: '', lastName: '', email: '', phone: '', message: '', consent: false,
  })
  const [touched, setTouched] = useState(false)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))

  const bad = {
    firstName: f.firstName.trim().length < 2,
    email: !EMAIL_RE.test(f.email.trim()),
    phone: !PHONE_RE.test(f.phone),
  }

  const submit = async (e) => {
    e.preventDefault()
    setTouched(true)
    setError('')
    if (bad.firstName || bad.email || bad.phone) return
    setBusy(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: f.enquiryType === 'Site visit' ? 'visit' : 'enquiry',
          propertyId: propertyId || undefined,
          name: `${f.firstName.trim()} ${f.lastName.trim()}`.trim(),
          email: f.email.trim(),
          phone: f.phone,
          message: [f.enquiryType, propertyTitle && `Property: ${propertyTitle}`, f.message.trim()]
            .filter(Boolean).join(' — '),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not send your enquiry')
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className="rounded border border-emerald-200 bg-emerald-50 p-6">
        <p className="flex items-center gap-2 text-[16px] font-bold text-emerald-800">
          <Check className="h-5 w-5" /> Thank you — your enquiry is with our team.
        </p>
        <p className="mt-1.5 text-[14px] text-emerald-900/80">
          A My World City specialist will be in touch within 2 working hours.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Enquiry Type*">
        <select value={f.enquiryType} onChange={(e) => set('enquiryType', e.target.value)} className={control}>
          {TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name*" bad={touched && bad.firstName}>
          <input value={f.firstName} onChange={(e) => set('firstName', e.target.value)} autoComplete="given-name" className={control} />
        </Field>
        <Field label="Last name">
          <input value={f.lastName} onChange={(e) => set('lastName', e.target.value)} autoComplete="family-name" className={control} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email*" bad={touched && bad.email}>
          <input type="email" value={f.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" className={control} />
        </Field>
        <Field label="Contact number*" bad={touched && bad.phone}>
          <input inputMode="numeric" value={f.phone} onChange={(e) => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit number" autoComplete="tel" className={control} />
        </Field>
      </div>

      <Field label="Your message">
        <textarea rows={4} value={f.message} onChange={(e) => set('message', e.target.value)}
          placeholder="Type your message here" className={`${control} resize-y`} />
      </Field>

      <label className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-slate-600">
        <input type="checkbox" checked={f.consent} onChange={(e) => set('consent', e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-400 text-brand focus:ring-brand" />
        <span>
          I would like to stay informed about new listings, project developments and leasing from My World City.
          Read our <a href="/privacy" className="font-semibold text-brand underline">Privacy Policy</a>.
        </span>
      </label>

      {touched && (bad.firstName || bad.email || bad.phone) && (
        <p className="text-[13px] font-medium text-rose-600">
          {bad.firstName ? 'Enter your first name. ' : ''}
          {bad.email ? 'Enter a valid email address. ' : ''}
          {bad.phone ? 'Enter a valid 10-digit Indian mobile number.' : ''}
        </p>
      )}
      {error && <p className="rounded bg-red-50 px-3 py-2 text-[13px] font-medium text-red-600">{error}</p>}

      <button type="submit" disabled={busy}
        className="inline-flex items-center justify-center gap-2 rounded bg-cyan px-10 py-3 text-[14.5px] font-bold text-navy-900 transition hover:bg-cyan-600 disabled:opacity-60">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Submit
      </button>
    </form>
  )
}

const control =
  'w-full bg-white px-3 py-2.5 text-[14px] text-navy-900 outline-none placeholder:text-slate-400'

// Outlined box with the label notched into the top border, as in the design.
function Field({ label, bad, children }) {
  return (
    <div className={`relative rounded border ${bad ? 'border-rose-500' : 'border-slate-300'} bg-white`}>
      <span className={`absolute -top-[9px] left-3 bg-white px-1 text-[11.5px] font-medium ${bad ? 'text-rose-600' : 'text-slate-500'}`}>
        {label}
      </span>
      {children}
    </div>
  )
}
