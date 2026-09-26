'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'

const TYPES = ['General enquiry', 'Site visit', 'Pricing & availability', 'Investment', 'Something else']
const RELATIONS = ['Prospective buyer', 'Prospective tenant', 'Investor', 'Broker / channel partner', 'Existing customer', 'Other']
const PHONE_RE = /^[6-9]\d{9}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// "Make an enquiry" at the foot of a property page. Files a real lead against
// the property, so it lands in the admin console like any other enquiry.
export default function EnquireForm({ propertyId, propertyTitle }) {
  const [f, setF] = useState({
    enquiryType: '', firstName: '', lastName: '', email: '', phone: '', city: '', relation: '', message: '', consent: false,
  })
  const [touched, setTouched] = useState(false)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))

  const bad = {
    enquiryType: !f.enquiryType,
    firstName: f.firstName.trim().length < 2,
    lastName: f.lastName.trim().length < 1,
    email: !EMAIL_RE.test(f.email.trim()),
    phone: !PHONE_RE.test(f.phone),
    relation: !f.relation,
    consent: !f.consent,
  }
  const invalid = Object.values(bad).some(Boolean)

  const submit = async (e) => {
    e.preventDefault()
    setTouched(true)
    setError('')
    if (invalid) return
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
          message: [
            f.enquiryType,
            propertyTitle && `Property: ${propertyTitle}`,
            f.relation && `Relationship: ${f.relation}`,
            f.city.trim() && `City: ${f.city.trim()}`,
            f.message.trim(),
          ].filter(Boolean).join(' — '),
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
      <div className="border border-emerald-200 bg-emerald-50 p-6">
        <p className="flex items-center gap-2 text-[16px] font-bold text-emerald-800">
          <Check className="h-5 w-5" /> Thank you — your enquiry is with our team.
        </p>
        <p className="mt-1.5 text-[14px] text-emerald-900/80">
          A My World City specialist will be in touch within 2 working hours.
        </p>
      </div>
    )
  }

  const box = (k) => `${control} ${touched && bad[k] ? 'border-rose-500' : 'border-slate-700 focus:border-brand'}`

  return (
    <form onSubmit={submit} className="space-y-3">
      <select value={f.enquiryType} onChange={(e) => set('enquiryType', e.target.value)} className={`${box('enquiryType')} ${f.enquiryType ? '' : 'text-slate-600'}`}>
        <option value="">Enquiry Type* (Select Option)</option>
        {TYPES.map((t) => <option key={t}>{t}</option>)}
      </select>

      <div className="grid gap-3 sm:grid-cols-2">
        <input value={f.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="First name*" autoComplete="given-name" className={box('firstName')} />
        <input value={f.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="Last name*" autoComplete="family-name" className={box('lastName')} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input type="email" value={f.email} onChange={(e) => set('email', e.target.value)} placeholder="Email*" autoComplete="email" className={box('email')} />
        <input inputMode="numeric" value={f.phone} onChange={(e) => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder="Contact number*" autoComplete="tel" className={box('phone')} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input value={f.city} onChange={(e) => set('city', e.target.value)} placeholder="City" autoComplete="address-level2" className={box('city')} />
        <select value={f.relation} onChange={(e) => set('relation', e.target.value)} className={`${box('relation')} ${f.relation ? '' : 'text-slate-600'}`}>
          <option value="">What is your relationship with us?*</option>
          {RELATIONS.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      <textarea rows={3} value={f.message} onChange={(e) => set('message', e.target.value)}
        placeholder="Type your message here" className={`${box('message')} resize-y`} />

      <label className="flex items-start gap-2.5 pt-1 text-[12px] leading-relaxed text-navy-900">
        <input type="checkbox" checked={f.consent} onChange={(e) => set('consent', e.target.checked)}
          className={`mt-0.5 h-4 w-4 shrink-0 rounded-none border ${touched && bad.consent ? 'border-rose-500' : 'border-slate-700'} text-brand focus:ring-brand`} />
        <span>
          I agree to the processing of my details. View our{' '}
          <a href="/privacy" className="font-medium text-brand underline">Privacy Policy</a>.
        </span>
      </label>

      {touched && invalid && (
        <p className="text-[13px] font-medium text-rose-600">
          {bad.enquiryType ? 'Choose an enquiry type. ' : ''}
          {bad.firstName || bad.lastName ? 'Enter your first and last name. ' : ''}
          {bad.email ? 'Enter a valid email address. ' : ''}
          {bad.phone ? 'Enter a valid 10-digit Indian mobile number. ' : ''}
          {bad.relation ? 'Tell us your relationship with us. ' : ''}
          {bad.consent ? 'Please agree to the processing of your details.' : ''}
        </p>
      )}
      {error && <p className="bg-red-50 px-3 py-2 text-[13px] font-medium text-red-600">{error}</p>}

      <button type="submit" disabled={busy}
        className="flex w-full items-center justify-center gap-2 bg-cyan py-3 text-[13.5px] font-bold text-navy-900 transition hover:bg-cyan-600 disabled:opacity-60">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Submit
      </button>
    </form>
  )
}

const control =
  'w-full border bg-white px-3 py-2.5 text-[13px] text-navy-900 outline-none placeholder:text-slate-600'
