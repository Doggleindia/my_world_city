'use client'

import { useEffect, useRef, useState } from 'react'
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
//
// As the page scrolls, a coloured line fills down the rail. Each time it
// reaches a step (1, 2, 3 …) that step "arrives": the badge lights up and the
// card rises into place with a lift and a shadow, so the path reads as being
// walked. Steps the line hasn't reached yet sit a little lower and fainter.
// TRIGGER is where on the screen the line's tip sits (0.6 = 60% down).
const TRIGGER = 0.6

export default function DevelopTimeline() {
  const [open, setOpen] = useState(null)
  const [reached, setReached] = useState(0) // how many steps the line has reached
  const railRef = useRef(null)
  const fillRef = useRef(null)
  const badgeRefs = useRef([])

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const rail = railRef.current
      if (!rail) return
      const tip = window.innerHeight * TRIGGER
      const r = rail.getBoundingClientRect()
      const fill = Math.min(Math.max(tip - r.top, 0), r.height)
      if (fillRef.current) fillRef.current.style.height = `${fill}px`

      let n = 0
      for (const b of badgeRefs.current) {
        if (!b) continue
        const br = b.getBoundingClientRect()
        if (br.top + br.height / 2 <= tip) n++
      }
      setReached((prev) => (prev === n ? prev : n))
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <section className="bg-indigo-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-[32px] font-extrabold leading-tight text-navy-800 sm:text-[44px]">Your Vision, Visualized.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[16.5px] leading-relaxed text-slate-500 sm:text-[19px]">
            Follow the unified path to your dream property with Jaipur&apos;s most trusted development framework.
          </p>
          <p className="mt-2 text-[14px] text-slate-400 sm:text-[15px]">Tap a step to see what happens in it.</p>
        </div>

        <div className="relative mt-12">
          {/* the rail joining the step badges: a faint track, and the coloured
              line that fills down it as the page scrolls */}
          <div
            ref={railRef}
            aria-hidden="true"
            className="pointer-events-none absolute bottom-10 left-6 top-10 w-1 -translate-x-1/2 rounded-full bg-indigo-200/70 sm:left-7 sm:top-11"
          >
            <div
              ref={fillRef}
              className="absolute inset-x-0 top-0 rounded-full bg-gradient-to-b from-[#3D6FF6] via-[#6366F1] to-[#8B5CF6] shadow-[0_0_12px_rgba(99,102,241,0.6)] transition-[height] duration-150 ease-out"
              style={{ height: 0 }}
            >
              {/* glowing tip */}
              <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-[#8B5CF6] shadow-[0_0_10px_3px_rgba(139,92,246,0.7)]" />
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {developSteps.map((s, i) => {
              const isOpen = s.n === open
              const isReached = i < reached
              const isCurrent = i === reached - 1
              return (
                <div key={s.n} className="relative grid grid-cols-[48px_1fr] gap-x-4 sm:grid-cols-[56px_1fr] sm:gap-x-7">
                  {/* number badge, coloured per step */}
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : s.n)}
                    aria-label={`${isOpen ? 'Collapse' : 'Expand'} step ${s.n}: ${s.title}`}
                    ref={(el) => { badgeRefs.current[i] = el }}
                    className={`relative z-10 mt-4 grid h-12 w-12 place-items-center rounded-full text-[18px] font-bold ring-4 ring-indigo-50 transition-all duration-500 sm:h-14 sm:w-14 sm:text-[21px] ${
                      isReached ? 'text-white' : 'bg-white text-slate-400'
                    } ${isOpen || isCurrent ? 'scale-110' : ''}`}
                    style={
                      isReached
                        ? { background: s.color, boxShadow: `0 0 0 4px #eef2ff, 0 0 20px 4px ${s.color}66` }
                        : undefined
                    }
                  >
                    {s.n}
                  </button>

                  <div
                    className={`min-w-0 overflow-hidden rounded-3xl border bg-white transition-all duration-700 ease-out ${
                      isCurrent || isOpen
                        ? '-translate-y-1.5 border-transparent opacity-100'
                        : isReached
                          ? 'translate-y-0 border-slate-200/80 opacity-100 shadow-card hover:border-brand/30'
                          : 'translate-y-6 border-slate-200/80 opacity-60 shadow-sm'
                    }`}
                    style={isCurrent || isOpen ? { boxShadow: `0 24px 50px -20px rgba(8,26,51,0.45), 0 0 0 2px ${s.color}55` } : undefined}
                  >
                    {/* collapsed row: always visible, click to toggle */}
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : s.n)}
                      aria-expanded={isOpen}
                      aria-controls={`develop-step-${s.n}`}
                      className="flex w-full items-center justify-between gap-4 px-6 py-6 text-left sm:px-8 sm:py-7"
                    >
                      <span className="min-w-0">
                        <span className="block text-[21px] font-bold leading-snug text-navy-900 sm:text-[26px]">
                          Step {String(s.n).padStart(2, '0')}: {s.title}
                        </span>
                        <span className="mt-2 block text-[15.5px] leading-relaxed text-slate-600 sm:text-[17px]">{s.desc}</span>
                      </span>
                      <span
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition duration-300 ${
                          isOpen ? 'rotate-180 bg-brand text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <ChevronDown className="h-6 w-6" />
                      </span>
                    </button>

                    {/* expanded details */}
                    <div
                      id={`develop-step-${s.n}`}
                      className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div className="grid gap-7 border-t border-slate-100 px-6 pb-7 pt-6 sm:px-8 lg:grid-cols-2 lg:items-start">
                          <div>
                            <div className="h-[3px] w-16 rounded-full" style={{ background: s.color }} />
                            <StepAccordion faqs={s.faqs} active={isOpen} />
                            <Link
                              href={`/experts?cat=${EXPERT_CAT[s.n]}#experts-directory`}
                              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-navy-800 px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-navy-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
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
