'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Send, BadgeCheck } from 'lucide-react'
import SuccessCard from '@/components/SuccessCard'
import { submitLead } from '@/lib/leads'

export default function ExpertConnectModal({ open, onClose, expert }) {
  const [sent, setSent] = useState(false)
  const [refId, setRefId] = useState('')
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
    if (open) setSent(false)
  }, [open])

  if (!open || !expert || typeof document === 'undefined') return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const payload = {
      type: 'expert',
      expertId: expert?.id || undefined,
      name: fd.get('name'),
      phone: fd.get('phone'),
      email: fd.get('email') || '',
      budget: fd.get('budget') || undefined,
      message: fd.get('message') || undefined,
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
            className="relative w-full max-w-[520px] overflow-hidden rounded-3xl bg-white shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3.5 px-6 pb-5 pt-6">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-[16px] font-bold text-white">
                {expert.initials}
              </span>
              <div className="min-w-0">
                <span className="inline-block rounded-full bg-brand/10 px-2.5 py-1 text-[11.5px] font-bold tracking-wide text-brand">
                  {expert.tag}
                </span>
                <p className="mt-1 text-[18px] font-bold text-navy-800">{expert.name}</p>
                <p className="truncate text-[13.5px] text-slate-500">{expert.specialty}</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="ml-auto grid h-9 w-9 shrink-0 place-items-center self-start rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-t border-slate-100" />

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 pb-2 pt-5">
              <p className="text-[14.5px] leading-relaxed text-slate-700">
                Trusted experts, ready to help.
                <br />
                We connect you with the right verified professional
              </p>

              <div className="mt-5 space-y-4">
                <Field label="Full name">
                  <input name="name" type="text" required placeholder="e.g. Rahul Sharma" className={inputCls} />
                </Field>

                <Field label="Phone number">
                  <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
                    <span className="border-r border-slate-200 px-3.5 py-3 text-[14px] font-semibold text-slate-700">
                      +91
                    </span>
                    <input
                      name="phone"
                      type="tel"
                      required
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="Enter 10 digit number"
                      className="w-full border-0 px-3.5 py-3 text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                    />
                  </div>
                </Field>

                <Field label="Email address" optional>
                  <input name="email" type="email" placeholder="rahul@example.com" className={inputCls} />
                </Field>

                <Field label="Budget range" optional>
                  <input name="budget" type="text" placeholder="e.g. ₹15,000 – ₹25,000" className={inputCls} />
                </Field>

                <Field label="Your message">
                  <textarea
                    name="message"
                    rows={3}
                    defaultValue="Hi, I'd like to connect about your services. Please share more details."
                    className={`${inputCls} resize-none`}
                  />
                </Field>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-navy-800 py-3.5 text-[15px] font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
              >
                {busy ? 'Sending…' : <>Send enquiry <Send className="h-[18px] w-[18px]" /></>}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-3 flex items-center justify-center gap-2 bg-slate-50 px-6 py-4 text-center text-[12.5px] text-slate-600">
              <BadgeCheck className="h-4 w-4 shrink-0 text-brand" />
              Title &amp; RERA verified · Your number is shared only with the owner.
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

const inputCls =
  'w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] text-slate-800 placeholder:text-slate-400 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20'

function Field({ label, optional, children }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </span>
        {optional && (
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Optional
          </span>
        )}
      </div>
      {children}
    </label>
  )
}
