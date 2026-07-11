'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Scale,
  Ruler,
  PencilRuler,
  Wrench,
  Landmark,
  Home,
  Sun,
  Lightbulb,
  BadgeCheck,
  Check,
  X,
} from 'lucide-react'
import SuccessCard from '@/components/SuccessCard'
import { submitLead } from '@/lib/leads'

const iconMap = { Scale, Ruler, PencilRuler, Wrench, Landmark, Home, Sun, Lightbulb }
const TIMES = ['Morning', 'Afternoon', 'Evening', 'Anytime']

export default function ServiceRequestModal({ open, service, onClose }) {
  const [sent, setSent] = useState(false)
  const [refId, setRefId] = useState('')
  const [time, setTime] = useState('Anytime')
  const [busy, setBusy] = useState(false)

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

  useEffect(() => {
    if (open) {
      setSent(false)
      setTime('Anytime')
    }
  }, [open, service])

  if (!open || !service || typeof document === 'undefined') return null

  const Icon = iconMap[service.icon] ?? Scale

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const related = fd.get('relatedProperty')
    const payload = {
      type: 'service',
      serviceKey: service?.title,
      name: fd.get('name'),
      phone: fd.get('phone'),
      email: fd.get('email') || '',
      budget: fd.get('budget') || undefined,
      message:
        (fd.get('message') || '') + (related ? `\nRelated property: ${related}` : ''),
      preferredTime: time,
    }
    setBusy(true)
    setRefId(await submitLead(payload))
    setBusy(false)
    setSent(true)
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-navy-900/60 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        {sent ? (
          <SuccessCard refId={refId} onClose={onClose} />
        ) : (
          <div
            className="relative my-auto w-full max-w-[560px] overflow-hidden rounded-3xl bg-white p-6 shadow-2xl sm:p-7"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Service header card */}
            <div className="flex items-center gap-4 rounded-2xl bg-indigo-50 p-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-navy-800 text-white">
                <Icon className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[20px] font-extrabold text-navy-800">{service.title}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-bold tracking-wide text-brand">
                    <BadgeCheck className="h-3.5 w-3.5" /> VERIFIED
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[13.5px] text-slate-500">{service.tagline}</p>
              </div>
            </div>

            {/* Heading */}
            <h3 className="mt-6 text-[26px] font-extrabold text-navy-800">
              Request {service.title} help
            </h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-slate-500">
              Tell us what you need — we&apos;ll connect you with one of our {service.partners}{' '}
              verified {service.title} partners. Free to enquire, zero brokerage.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Field label="Full name">
                <input name="name" type="text" required placeholder="e.g. Rahul Sharma" className={inputCls} />
              </Field>

              <Field label="Phone number">
                <div className="flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 focus-within:border-brand focus-within:bg-white">
                  <span className="px-4 py-3.5 text-[15px] font-semibold text-slate-600">+91</span>
                  <input
                    name="phone"
                    type="tel"
                    required
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="9876543210"
                    className="w-full bg-transparent py-3.5 pr-4 text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </Field>

              <Field label="Email address (optional)">
                <input name="email" type="email" placeholder="rahul.sharma@example.com" className={inputCls} />
              </Field>

              <Field label="Budget range (optional)">
                <input name="budget" type="text" placeholder="e.g. ₹15,000 – ₹25,000" className={inputCls} />
              </Field>

              <Field label="What do you need help with?">
                <textarea name="message" rows={3} defaultValue={service.need} className={`${inputCls} resize-none`} />
              </Field>

              <Field label="Related property (optional)">
                <input
                  name="relatedProperty"
                  type="text"
                  placeholder="e.g. Modern 3BHK Villa, Jagatpura"
                  className={inputCls}
                />
              </Field>

              <div>
                <p className="text-[15px] font-bold text-navy-800">Preferred time to be contacted</p>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {TIMES.map((t) => {
                    const active = t === time
                    return (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setTime(t)}
                        className={`rounded-full border px-5 py-2.5 text-[14px] font-semibold transition ${
                          active
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {t}
                      </button>
                    )
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="mt-2 w-full rounded-full bg-navy-800 py-4 text-[17px] font-bold text-white transition hover:bg-navy-700 disabled:opacity-60"
              >
                {busy ? 'Sending…' : 'Request help'}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-5 flex items-center justify-center gap-2 text-center text-[12.5px] text-slate-500">
              <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-slate-300 text-white">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              All partners verified by My World City · Your number is shared only with the matched
              partner.
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

const inputCls =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[15px] text-slate-800 placeholder:text-slate-400 transition focus:border-brand focus:bg-white focus:outline-none'

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[15px] font-bold text-navy-800">{label}</span>
      {children}
    </label>
  )
}
