'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Mail, Phone, X } from 'lucide-react'
import { expertList } from '@/data'
import ExpertConnectButton from '@/components/experts/ExpertConnectButton'

// Which expert categories help at each step of owning a property.
const STEP_CATS = {
  1: ['Legal'],
  2: ['Finance'],
  3: ['Legal'],
  4: ['Approvals', 'Legal'],
  5: ['Engineering', 'Construction'],
}

const expertsFor = (step, experts) => {
  const cats = STEP_CATS[step] || []
  const pool = experts?.length ? experts : expertList
  return cats.flatMap((c) => pool.filter((e) => e.cat === c)).slice(0, 3)
}

// "Own this property in 5 easy steps".
//   Phones: a vertical timeline with the numbers down the left edge. Connect
//           slides a panel in from the right with the contact details of the
//           experts for that step, each with a link to their profile.
//   Tablets: a snap-scrolling row. Large screens: an evenly spread 5-column row.
export default function OwnershipSteps({ steps, experts = [] }) {
  const [openStep, setOpenStep] = useState(null)

  // lock the page behind the slide-over and close it with Escape
  useEffect(() => {
    if (openStep == null) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && setOpenStep(null)
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [openStep])

  const current = steps.find((s) => s.n === openStep)

  return (
    <section className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-[28px] font-extrabold text-navy-800 sm:text-[34px]">
          Own This Property in <span className="text-emerald-500">5 Easy Steps</span>
        </h2>
        <p className="mt-2 text-[14px] text-slate-500">
          We connect you with a verified expert at every step — free.
        </p>

        <div className="mt-10 rounded-3xl bg-gradient-to-b from-indigo-50/70 to-white px-3 py-7 ring-1 ring-slate-100 sm:py-12 sm:pl-10 sm:pr-0 lg:px-10">
          {/* ---- phones: vertical timeline, numbers down the left edge ---- */}
          <ol className="sm:hidden">
            {steps.map((s, i) => (
              <li key={s.n} className="relative flex gap-3.5 pb-7 last:pb-0">
                {i < steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-6 top-12 h-[calc(100%-3rem)] w-0.5 -translate-x-1/2 bg-gradient-to-b from-teal-300 via-indigo-300 to-pink-300"
                  />
                )}
                <div
                  className={`relative grid h-12 w-12 shrink-0 place-items-center rounded-full text-[16px] font-bold text-white shadow-md ring-4 ring-white ${s.ring}`}
                >
                  {s.n}
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <h3 className="text-[16px] font-bold text-navy-800">{s.title}</h3>
                  <p className="mt-0.5 text-[13.5px] leading-relaxed text-slate-500">{s.desc}</p>
                  <button
                    type="button"
                    onClick={() => setOpenStep(s.n)}
                    className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-brand-800 px-4 py-1.5 text-[12.5px] font-semibold text-white transition hover:bg-navy-700"
                  >
                    Connect <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ol>

          {/* ---- tablets and up: one row ---- */}
          <div className="no-scrollbar hidden snap-x snap-mandatory gap-6 overflow-x-auto pb-3 pr-10 sm:flex lg:grid lg:grid-cols-5 lg:gap-0 lg:overflow-visible lg:pb-0 lg:pr-0">
            {steps.map((s, i) => (
              <div
                key={s.n}
                className="relative flex w-[30%] shrink-0 snap-center flex-col items-center text-center lg:w-auto"
              >
                {i < steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-7 h-0.5 w-[calc(100%+24px)] bg-gradient-to-r from-teal-300 via-indigo-300 to-pink-300 lg:w-full"
                  />
                )}
                <div
                  className={`relative grid h-14 w-14 shrink-0 place-items-center rounded-full text-[18px] font-bold text-white shadow-md ring-4 ring-white ${s.ring}`}
                >
                  {s.n}
                </div>
                <h3 className="mt-4 text-[15px] font-bold text-navy-800">{s.title}</h3>
                <p className="mb-3 mt-1.5 max-w-[170px] text-[12px] leading-relaxed text-slate-500">{s.desc}</p>
                <Link
                  href={`/experts?cat=${encodeURIComponent(STEP_CATS[s.n]?.[0] || 'All')}#experts-directory`}
                  className="mt-auto rounded-md border border-slate-200 bg-white px-4 py-1.5 text-[12.5px] font-semibold text-brand transition hover:border-brand/40 hover:bg-brand/5"
                >
                  Connect
                </Link>
              </div>
            ))}
          </div>

          <p className="mt-1 hidden pr-10 text-center text-[11.5px] text-slate-400 sm:block lg:hidden">
            Swipe to see all 5 steps
          </p>
        </div>
      </div>

      {/* ---- phones: contact slide-over ---- */}
      {current && (
        <div className="fixed inset-0 z-[90] sm:hidden">
          <div className="absolute inset-0 bg-navy-900/45 backdrop-blur-[2px]" onClick={() => setOpenStep(null)} aria-hidden="true" />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={`Experts for ${current.title}`}
            className="mwc-slide-in absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4">
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-[15px] font-bold text-white ${current.ring}`}>
                {current.n}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-bold text-navy-900">{current.title}</p>
                <p className="truncate text-[12.5px] text-slate-500">{current.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpenStep(null)}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <p className="text-[11.5px] font-bold uppercase tracking-wide text-navy-900">Connect at this stage</p>
              <ul className="mt-3 space-y-3">
                {expertsFor(current.n, experts).map((e) => {
                  const href = e.slug ? `/experts/${e.slug}` : '/experts'
                  return (
                    <li key={e.id || e.slug || e.name} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        {e.photo ? (
                          <img src={e.photo} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
                        ) : (
                          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-navy-800 text-[14px] font-bold text-white">
                            {e.initials}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-bold text-navy-900">{e.name}</p>
                          <p className="truncate text-[12.5px] text-slate-600">{e.role}</p>
                        </div>
                      </div>
                      <p className="mt-2.5 text-[13px] text-slate-700">{e.specialty}</p>

                      {(e.phone || e.email) && (
                        <div className="mt-3 space-y-1.5">
                          {e.phone && (
                            <a href={`tel:+91${e.phone}`} className="flex items-center gap-2 text-[13.5px] font-semibold text-navy-900">
                              <Phone className="h-4 w-4 text-brand-800" /> +91 {e.phone}
                            </a>
                          )}
                          {e.email && (
                            <a href={`mailto:${e.email}`} className="flex items-center gap-2 text-[13.5px] font-semibold text-navy-900">
                              <Mail className="h-4 w-4 text-brand-800" /> <span className="truncate">{e.email}</span>
                            </a>
                          )}
                        </div>
                      )}

                      <div className="mt-3.5 flex items-center gap-2">
                        <ExpertConnectButton
                          expert={{ id: e.id, initials: e.initials, tag: e.tag, name: e.name, specialty: e.specialty }}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-800 py-2 text-[13px] font-semibold text-white transition hover:bg-navy-700"
                        >
                          <Phone className="h-3.5 w-3.5" /> Connect now
                        </ExpertConnectButton>
                        <Link
                          href={href}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3.5 py-2 text-[13px] font-semibold text-navy-900 transition hover:border-brand hover:text-brand"
                        >
                          Details <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </li>
                  )
                })}
                {expertsFor(current.n, experts).length === 0 && (
                  <li className="text-[13.5px] text-slate-600">Our team will match you with the right specialist for this step.</li>
                )}
              </ul>
            </div>
          </aside>
        </div>
      )}
    </section>
  )
}
