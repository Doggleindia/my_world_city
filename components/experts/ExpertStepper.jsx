'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Phone } from 'lucide-react'
import { ownershipSteps, expertList } from '@/data'
import ExpertConnectButton from './ExpertConnectButton'

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

// The five ownership steps.
//   Phones / tablets: one scrolling line of steps; tapping a step opens a
//   panel beneath it with the experts for that stage and a Connect button.
//   Large screens: the five-column layout with a Connect link per step.
export default function ExpertStepper({ experts = [] }) {
  const [active, setActive] = useState(1)
  const strip = useRef(null)

  // keep the chosen step in view on the strip
  useEffect(() => {
    const el = strip.current?.querySelector(`[data-step="${active}"]`)
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [active])

  const current = ownershipSteps.find((s) => s.n === active)
  const people = expertsFor(active, experts)

  return (
    <div className="relative mt-10 lg:mt-12">
      {/* ---------- phones & tablets ---------- */}
      <div className="lg:hidden">
        <div ref={strip} className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
          {ownershipSteps.map((s) => {
            const on = s.n === active
            return (
              <button
                key={s.n}
                type="button"
                data-step={s.n}
                onClick={() => setActive(s.n)}
                aria-expanded={on}
                className={`flex shrink-0 snap-center items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-4 text-[14px] font-bold transition ${
                  on ? 'border-navy-900 bg-navy-900 text-white shadow-md' : 'border-slate-200 bg-white text-navy-800'
                }`}
              >
                <span className={`grid h-9 w-9 place-items-center rounded-full text-[14px] font-bold text-white ${s.ring}`}>
                  {s.n}
                </span>
                {s.title}
              </button>
            )
          })}
        </div>

        {current && (
          <div key={active} className="mwc-msg-in mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-[15px] font-bold text-white ${current.ring}`}>
                {current.n}
              </span>
              <div>
                <h3 className="text-[17px] font-bold text-navy-900">{current.title}</h3>
                <p className="mt-0.5 text-[13.5px] text-slate-600">{current.desc}</p>
              </div>
            </div>

            <p className="mt-4 text-[11.5px] font-bold uppercase tracking-wide text-navy-900">Connect at this stage</p>
            <ul className="mt-2 divide-y divide-slate-100">
              {people.map((e) => (
                <li key={e.id || e.slug || e.name} className="flex items-center gap-3 py-3">
                  <Link
                    href={e.slug ? `/experts/${e.slug}` : '#'}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-navy-800 text-[13px] font-bold text-white"
                  >
                    {e.initials}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-bold text-navy-900">{e.name}</p>
                    <p className="truncate text-[12.5px] text-slate-600">{e.role} · {e.specialty}</p>
                  </div>
                  <ExpertConnectButton
                    expert={{ id: e.id, initials: e.initials, tag: e.tag, name: e.name, specialty: e.specialty }}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-800 px-3.5 py-2 text-[12.5px] font-bold text-white transition hover:bg-navy-700"
                  >
                    <Phone className="h-3.5 w-3.5" /> Connect
                  </ExpertConnectButton>
                </li>
              ))}
              {people.length === 0 && (
                <li className="py-3 text-[13.5px] text-slate-600">Our team will match you with the right specialist for this step.</li>
              )}
            </ul>

            {active < ownershipSteps.length && (
              <button
                type="button"
                onClick={() => setActive(active + 1)}
                className="mt-2 inline-flex items-center gap-1 text-[13.5px] font-bold text-brand-800 hover:text-brand"
              >
                Next step <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ---------- large screens ---------- */}
      <div className="hidden lg:block">
        <div className="pointer-events-none absolute left-[10%] right-[10%] top-7 h-0.5 bg-gradient-to-r from-teal-400 via-indigo-400 to-pink-400" />
        <div className="grid grid-cols-5">
          {ownershipSteps.map((s) => (
            <div key={s.n} className="relative flex h-full flex-col items-center text-center">
              <div
                className={`grid h-14 w-14 place-items-center rounded-full text-[18px] font-bold text-white shadow-md ring-4 ring-slate-100 ${s.ring}`}
              >
                {s.n}
              </div>
              <h3 className="mt-4 text-[15px] font-bold text-navy-800">{s.title}</h3>
              <p className="mt-1.5 min-h-[40px] max-w-[170px] text-[12px] leading-relaxed text-slate-500">{s.desc}</p>
              <Link
                href={`/experts?cat=${encodeURIComponent(STEP_CATS[s.n]?.[0] || 'All')}#experts-directory`}
                className="mt-auto rounded-md border border-slate-200 bg-white px-4 py-1.5 text-[12.5px] font-semibold text-brand transition hover:border-brand/40 hover:bg-brand/5"
              >
                Connect
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
