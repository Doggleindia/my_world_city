'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { solutionPurposes, solutionCategories, solutionTypes } from '@/data'

const STEPS = [
  {
    title: 'Select your property need',
    sub: "Pick what you'd like to do — we'll match the right properties.",
  },
  {
    title: 'Which segment fits best?',
    sub: 'Each category has its own ecosystem, pricing logic, and legal pathway. Pick the closest match.',
  },
  {
    title: 'What type exactly?',
    sub: 'The more specific you are, the better we can match — but you can always change this later.',
  },
]

export default function FindSolutionWizard({ onClose }) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [purpose, setPurpose] = useState(null)
  const [category, setCategory] = useState(null)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Step 1 has nowhere to go back to, so BACK closes the panel instead.
  const back = () => (step === 1 ? onClose() : setStep(step - 1))

  // How far the user is allowed to jump — step 3 needs a category to list types.
  const reachable = 1 + (purpose ? 1 : 0) + (category ? 1 : 0)

  const cards =
    step === 1
      ? solutionPurposes
      : step === 2
        ? solutionCategories
        : solutionTypes[category?.key] || []

  const select = (item) => {
    if (step === 1) {
      setPurpose(item)
      setStep(2)
    } else if (step === 2) {
      setCategory(item)
      setStep(3)
    } else {
      const params = new URLSearchParams({ category: category.key, type: item.title })
      router.push(`/find-property?${params.toString()}`)
      onClose()
    }
  }

  return (
    <div className="mt-4 rounded-2xl bg-[#eef1f6] p-5 shadow-card ring-1 ring-slate-200 sm:p-7">
      {/* BACK / step counter */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          className="group flex items-center gap-2.5 text-[15px] font-bold uppercase tracking-wide text-brand transition hover:text-brand-700"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full border-[1.5px] border-brand transition group-hover:bg-brand group-hover:text-white">
            <ChevronLeft className="h-5 w-5" />
          </span>
          Back
        </button>
        <span className="text-[15px] font-bold uppercase tracking-wide text-brand">
          Step {step} of 3
        </span>
      </div>

      {/* Heading */}
      <div className="mt-4 text-center">
        <h3 className="text-[24px] font-extrabold tracking-tight text-navy-900 sm:text-[28px]">
          {STEPS[step - 1].title}
        </h3>
        <p className="mx-auto mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-600">
          {STEPS[step - 1].sub}
        </p>
      </div>

      <StepNav
        step={step}
        purpose={purpose}
        category={category}
        reachable={reachable}
        onGo={setStep}
      />

      {/* Option cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
        {cards.map((c) => (
          <article
            key={c.title}
            className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
          >
            <img src={c.img} alt="" className="aspect-[4/3] w-full object-cover" />
            <div className="flex flex-1 flex-col p-4">
              <h4 className="text-[15px] font-bold text-navy-900">{c.title}</h4>
              <p className="mt-1 flex-1 text-[12.5px] leading-snug text-slate-500">{c.desc}</p>
              <button
                type="button"
                onClick={() => select(c)}
                className="mt-4 w-full rounded-full bg-[#0a3d7a] py-2.5 text-[13px] font-semibold text-white transition hover:bg-navy-700"
              >
                Select
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

// Rail and labels share one 3-column grid, so every circle sits directly above
// its own pill. GAP is referenced in CSS below to place the connectors and
// chevrons on the exact column boundaries.
const GAP = '1.25rem' // = gap-x-5

function StepNav({ step, purpose, category, reachable, onGo }) {
  const crumbs = [
    { n: 1, label: 'Purpose', choice: purpose && `1. ${purpose.short}` },
    { n: 2, label: 'Category', choice: category && `2. ${category.title}` },
    { n: 3, label: 'Type', choice: null },
  ]

  return (
    <div className="mx-auto mt-7 grid max-w-xl grid-cols-3 gap-x-5">
      {/* Row 1 — circles, joined by connectors that stop at each circle's edge */}
      {crumbs.map((c) => {
        const canGo = c.n !== step && c.n <= reachable
        return (
          <div key={`node-${c.n}`} className="relative flex items-center justify-center">
            {c.n > 1 && (
              <span
                // spans from the previous column's centre to this one's
                style={{ left: `calc(-50% - ${GAP})`, right: '50%' }}
                className={`absolute top-1/2 mx-[18px] h-1.5 -translate-y-1/2 rounded-full transition-colors duration-300 ${
                  step > c.n - 1 ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              />
            )}
            <button
              type="button"
              onClick={() => canGo && onGo(c.n)}
              disabled={!canGo}
              aria-label={`Go to step ${c.n}`}
              aria-current={c.n === step ? 'step' : undefined}
              className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full text-[14px] font-bold transition ${
                c.n < step
                  ? 'bg-emerald-500'
                  : c.n === step
                    ? 'border-2 border-slate-300 bg-white text-navy-900'
                    : 'bg-slate-200 text-slate-500'
              } ${canGo ? 'hover:scale-110' : 'cursor-default'}`}
            >
              {c.n < step ? <Check className="h-5 w-5 text-amber-300" strokeWidth={3.5} /> : c.n}
            </button>
          </div>
        )
      })}

      {/* Row 2 — labels, centred under their own circle */}
      {crumbs.map((c) => {
        const isCurrent = c.n === step
        const canGo = !isCurrent && c.n <= reachable
        const base =
          'max-w-full truncate rounded-full px-3 py-2 text-[12.5px] transition sm:px-5 sm:text-[14px]'
        return (
          <div key={`pill-${c.n}`} className="relative mt-5 flex items-center justify-center">
            {c.n > 1 && (
              <ChevronRight
                style={{ left: `calc(-${GAP} / 2)` }}
                className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-slate-400"
              />
            )}
            <button
              type="button"
              onClick={() => canGo && onGo(c.n)}
              disabled={!canGo}
              aria-current={isCurrent ? 'step' : undefined}
              className={
                c.choice && !isCurrent
                  ? `${base} bg-ember-700 font-semibold text-white hover:bg-ember`
                  : `${base} border border-slate-300 bg-white ${
                      c.choice ? 'font-semibold' : 'uppercase tracking-wide'
                    } ${isCurrent ? 'text-navy-900' : 'text-slate-500'} ${
                      canGo ? 'hover:border-brand hover:text-brand' : 'cursor-default'
                    }`
              }
            >
              {c.choice || c.label}
            </button>
          </div>
        )
      })}
    </div>
  )
}
