'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { BadgeCheck, X, Send, ArrowRight, Phone } from 'lucide-react'
import SuccessCard from '@/components/SuccessCard'
import { submitLead } from '@/lib/leads'

const TABS = ['Enquire', 'Schedule visit', 'Request callback']
const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const TIME_SLOTS = ['10–12 PM', '12–2 PM', '2–4 PM', '4–6 PM']
const CALL_TIMES = ['Morning (9–12)', 'Afternoon (12–4)', 'Evening (4–8)', 'Anytime']
const CALL_DAYS = ['Today', 'Tomorrow']

const copy = {
  Enquire: {
    heading: 'Talk to the owner directly',
    sub: "No brokerage. We'll connect you straight to the owner.",
    cta: 'Send enquiry',
    icon: Send,
  },
  'Schedule visit': {
    heading: 'Book a site visit',
    sub: 'Pick a date and time — the owner will confirm your visit. No brokerage.',
    cta: 'Confirm site visit',
    icon: ArrowRight,
  },
  'Request callback': {
    heading: 'Request a callback',
    sub: 'Tell us when to call and the owner will ring you directly. No brokerage.',
    cta: 'Request a callback',
    icon: Phone,
  },
}

export default function EnquiryModal({ open, onClose, tab, onTabChange, property }) {
  const [sent, setSent] = useState(false)
  const [refId, setRefId] = useState('')
  const [busy, setBusy] = useState(false)
  const [dateIdx, setDateIdx] = useState(0)
  const [timeSlot, setTimeSlot] = useState('12–2 PM')
  const [callTime, setCallTime] = useState('Afternoon (12–4)')
  const [callDay, setCallDay] = useState('Today')

  // Next 7 days starting today (computed client-side; modal only renders after a click).
  const days = useMemo(() => {
    const base = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base)
      d.setDate(base.getDate() + i)
      return { wd: WEEKDAYS[d.getDay()], date: d.getDate() }
    })
  }, [])

  // Lock body scroll + close on Escape while open.
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

  // Reset the success view whenever the modal reopens or switches tab.
  useEffect(() => {
    if (open) setSent(false)
  }, [open, tab])

  if (!open || typeof document === 'undefined') return null

  const c = copy[tab] ?? copy.Enquire
  const Icon = c.icon
  const shortLoc = property.location.split(',')[0]

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const type = tab === 'Schedule visit' ? 'visit' : tab === 'Request callback' ? 'callback' : 'enquiry'
    const payload = {
      type,
      name: fd.get('name'),
      phone: fd.get('phone'),
      email: fd.get('email') || '',
      message: fd.get('message') || undefined,
    }
    if (property?.id) payload.propertyId = property.id
    if (type === 'visit') {
      payload.visitDate = `${days[dateIdx].wd} ${days[dateIdx].date}`
      payload.timeSlot = timeSlot
    }
    if (type === 'callback') {
      payload.preferredTime = callTime
      payload.preferredDay = callDay
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
            className="relative my-auto w-full max-w-[520px] overflow-hidden rounded-3xl bg-white shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3.5 px-6 pb-5 pt-6">
              <img
                src={property.gallery.main}
                alt={property.title}
                className="h-14 w-14 shrink-0 rounded-2xl object-cover"
              />
              <div className="min-w-0">
                {property.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 text-[11.5px] font-bold tracking-wide text-brand">
                    <BadgeCheck className="h-3.5 w-3.5" /> VERIFIED
                  </span>
                )}
                <p className="mt-1.5 truncate text-[16px] font-bold text-navy-800">
                  {property.title}, {shortLoc}
                </p>
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

            {/* Tabs */}
            <div className="px-6 pt-5">
              <div className="flex rounded-full bg-slate-100 p-1">
                {TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => onTabChange(t)}
                    className={`flex-1 rounded-full px-3 py-2.5 text-[13.5px] font-semibold transition ${
                      t === tab
                        ? 'bg-navy-800 text-white shadow-sm'
                        : 'text-slate-600 hover:text-navy-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="px-6 pb-2 pt-5">
              <h3 className="text-[18px] font-bold text-navy-800">{c.heading}</h3>
              <p className="mt-1 text-[13.5px] leading-relaxed text-slate-500">{c.sub}</p>

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

                {tab === 'Schedule visit' && (
                  <>
                    <div>
                      <Label>Select a date</Label>
                      <div className="no-scrollbar -mx-1 mt-2 flex gap-2.5 overflow-x-auto px-1 pb-1">
                        {days.map((d, i) => {
                          const active = i === dateIdx
                          return (
                            <button
                              type="button"
                              key={i}
                              onClick={() => setDateIdx(i)}
                              className={`flex w-[62px] shrink-0 flex-col items-center rounded-xl border py-2.5 transition ${
                                active
                                  ? 'border-amber-500 bg-amber-500 text-white shadow-sm'
                                  : 'border-slate-200 bg-white hover:border-slate-300'
                              }`}
                            >
                              <span
                                className={`text-[11px] font-semibold tracking-wide ${
                                  active ? 'text-white/90' : 'text-slate-400'
                                }`}
                              >
                                {d.wd}
                              </span>
                              <span
                                className={`mt-0.5 text-[18px] font-bold ${
                                  active ? 'text-white' : 'text-navy-800'
                                }`}
                              >
                                {d.date}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <Label>Preferred time</Label>
                      <div className="mt-2 flex flex-wrap gap-2.5">
                        {TIME_SLOTS.map((slot) => (
                          <Chip
                            key={slot}
                            active={slot === timeSlot}
                            activeClass="border-emerald-500 bg-emerald-500 text-white"
                            onClick={() => setTimeSlot(slot)}
                          >
                            {slot}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {tab === 'Request callback' && (
                  <>
                    <div>
                      <Label>Preferred time to call</Label>
                      <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1.5">
                        {CALL_TIMES.map((t) => (
                          <Pill
                            key={t}
                            active={t === callTime}
                            activeClass="bg-ember text-white"
                            onClick={() => setCallTime(t)}
                          >
                            {t}
                          </Pill>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Preferred day</Label>
                      <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1.5">
                        {CALL_DAYS.map((d) => (
                          <Pill
                            key={d}
                            active={d === callDay}
                            activeClass="bg-brand text-white"
                            onClick={() => setCallDay(d)}
                          >
                            {d}
                          </Pill>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {tab === 'Enquire' && (
                  <Field label="Your message">
                    <textarea
                      name="message"
                      rows={3}
                      defaultValue="Hi, I'm interested in this property. Please share more details."
                      className={`${inputCls} resize-none`}
                    />
                  </Field>
                )}
              </div>

              <button
                type="submit"
                disabled={busy}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-navy-800 py-3.5 text-[15px] font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
              >
                {busy ? 'Sending…' : <>{c.cta} <Icon className="h-[18px] w-[18px]" /></>}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-3 flex items-center justify-center gap-2 bg-slate-50 px-6 py-4 text-center text-[12.5px] text-slate-600">
              <BadgeCheck className="h-4 w-4 shrink-0 text-brand" />
              {property.rera ? 'Title & RERA verified · ' : ''}Your number is shared only with the owner.
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

function Label({ children }) {
  return (
    <span className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </span>
  )
}

function Field({ label, optional, children }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <Label>{label}</Label>
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

/* Bordered chip (date / time slot). */
function Chip({ active, activeClass, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition ${
        active ? `${activeClass} shadow-sm` : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
      }`}
    >
      {children}
    </button>
  )
}

/* Borderless pill — selected gets a solid fill, unselected is plain text. */
function Pill({ active, activeClass, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-[14px] font-semibold transition ${
        active ? `${activeClass} shadow-sm` : 'text-navy-800 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  )
}

