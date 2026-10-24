'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import StepAccordion from './StepAccordion'
import { developSteps } from '@/data'

// Each build step maps to the expert category that handles it.
const EXPERT_CAT = {
  1: 'Legal', // Land & Legal
  2: 'Architecture', // Design & Planning
  3: 'Approvals', // Approvals & Permits
  4: 'Construction', // Construction
  5: 'Solar', // Utilities & Systems
  6: 'Interior', // Finishing & Handover
}

// The six build steps as a vertical timeline. Every step starts collapsed —
// just its number, title and one-line summary — and opens on click to show
// the details, the FAQ accordion, the Contact Expert button and the photo.
// Nothing changes while the page scrolls; only the visitor's clicks do.
export default function DevelopTimeline() {
  const [open, setOpen] = useState(null)

  return (
    <section className="bg-indigo-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-[28px] font-extrabold text-navy-800 sm:text-[34px]">Your Vision, Visualized.</h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-slate-500">
            Follow the unified path to your dream property with Jaipur&apos;s most trusted development framework.
          </p>
          <p className="mt-2 text-[13px] text-slate-400">Tap a step to see what happens in it.</p>
        </div>

        <div className="relative mt-12">
          {/* the rail joining the step badges */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-5 left-5 top-5 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#3D6FF6] to-[#8B5CF6] opacity-40"
          />

          <div className="space-y-4">
            {developSteps.map((s) => {
              const isOpen = s.n === open
              return (
                <div key={s.n} className="relative grid grid-cols-[40px_1fr] gap-x-4 sm:gap-x-6">
                  {/* number badge, coloured per step */}
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : s.n)}
                    aria-label={`${isOpen ? 'Collapse' : 'Expand'} step ${s.n}: ${s.title}`}
                    className={`relative z-10 mt-3 grid h-10 w-10 place-items-center rounded-full text-[15px] font-bold text-white ring-4 ring-indigo-50 transition-transform duration-300 ${isOpen ? 'scale-110' : ''}`}
                    style={{ background: s.color }}
                  >
                    {s.n}
                  </button>

                  <div
                    className={`min-w-0 overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${
                      isOpen ? 'border-brand/25 shadow-card' : 'border-slate-200/80 shadow-sm hover:border-brand/30 hover:shadow-card'
                    }`}
                  >
                    {/* collapsed row: always visible, click to toggle */}
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : s.n)}
                      aria-expanded={isOpen}
                      aria-controls={`develop-step-${s.n}`}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                    >
                      <span className="min-w-0">
                        <span className="block text-[18px] font-bold text-navy-900 sm:text-[20px]">
                          Step {String(s.n).padStart(2, '0')}: {s.title}
                        </span>
                        <span className="mt-1 block text-[13.5px] leading-relaxed text-slate-500">{s.desc}</span>
                      </span>
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition duration-300 ${
                          isOpen ? 'rotate-180 bg-brand text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <ChevronDown className="h-5 w-5" />
                      </span>
                    </button>

                    {/* expanded details */}
                    <div
                      id={`develop-step-${s.n}`}
                      className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div className="grid gap-7 border-t border-slate-100 px-5 pb-6 pt-5 sm:px-6 lg:grid-cols-2 lg:items-start">
                          <div>
                            <div className="h-[3px] w-16 rounded-full" style={{ background: s.color }} />
                            <StepAccordion faqs={s.faqs} active={isOpen} />
                            <Link
                              href={`/experts?cat=${EXPERT_CAT[s.n]}#experts-directory`}
                              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-navy-800 px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-navy-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
                            >
                              Contact Expert
                            </Link>
                          </div>
                          <div className="overflow-hidden rounded-2xl shadow-card lg:mt-1">
                            <img src={s.img} alt={s.title} loading="lazy" className="h-56 w-full object-cover sm:h-72 lg:h-[300px]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
