'use client'

import { useState } from 'react'
import { MapPin, ChevronDown, Check } from 'lucide-react'

const localities = ['Sitapura', 'RIICO', 'Jagatpura', 'Mansarovar', 'C-Scheme']
const propertyTypes = ['Residential', 'Commercial', 'Industrial', 'Farm & Agri']
const timelines = ['Immediately', '1–3 month', '3–6 month', 'Not Sure']
const budgetRanges = ['40L - 60L', '60L - 80L', '80L - 1Cr', '1Cr - 1.5Cr', '1.5Cr+']

function SectionLabel({ children }) {
  return (
    <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
      {children}
    </h3>
  )
}

function Switch({ on, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        on ? 'bg-brand' : 'bg-slate-300'
      }`}
      aria-pressed={on}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
          on ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  )
}

export default function FilterSidebar() {
  const [checked, setChecked] = useState(['Sitapura'])
  const [ptype, setPtype] = useState('Residential')
  const [timeline, setTimeline] = useState('Immediately')
  const [verified, setVerified] = useState(true)
  const [rera, setRera] = useState(false)

  const toggleLocality = (l) =>
    setChecked((prev) => (prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]))

  const clearAll = () => {
    setChecked([])
    setPtype('')
    setTimeline('')
    setVerified(false)
    setRera(false)
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card lg:sticky lg:top-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-navy-800">Filters</h2>
        <button
          onClick={clearAll}
          className="text-[13px] font-semibold text-brand transition hover:underline"
        >
          Clear all
        </button>
      </div>

      {/* Location */}
      <div className="mt-6">
        <SectionLabel>Location</SectionLabel>
        <div className="relative mt-2.5">
          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-rose-400" />
          <input
            placeholder="Enter city, locality..."
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-[13.5px] text-slate-700 placeholder:text-slate-400 focus:border-brand focus:outline-none"
          />
        </div>
      </div>

      {/* Budget */}
      <div className="mt-6">
        <SectionLabel>Budget</SectionLabel>
        <div className="relative mt-2.5">
          <select className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13.5px] text-slate-700 focus:border-brand focus:outline-none">
            {budgetRanges.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
        </div>
        <p className="mt-1.5 text-[11.5px] italic text-slate-400">select range of price</p>
      </div>

      {/* Locality */}
      <div className="mt-6">
        <SectionLabel>Locality</SectionLabel>
        <div className="mt-3 space-y-3">
          {localities.map((l) => {
            const on = checked.includes(l)
            return (
              <label
                key={l}
                className="flex cursor-pointer items-center gap-2.5 text-[13.5px] text-slate-600"
                onClick={() => toggleLocality(l)}
              >
                <span
                  className={`flex h-[18px] w-[18px] items-center justify-center rounded border transition ${
                    on ? 'border-brand bg-brand text-white' : 'border-slate-300 bg-white'
                  }`}
                >
                  {on && <Check className="h-3 w-3" strokeWidth={3.5} />}
                </span>
                {l}
              </label>
            )
          })}
        </div>
      </div>

      {/* Property type */}
      <div className="mt-6">
        <SectionLabel>Property Type</SectionLabel>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {propertyTypes.map((t) => (
            <button
              key={t}
              onClick={() => setPtype(t)}
              className={`rounded-lg border px-3 py-2 text-[13px] font-medium transition ${
                ptype === t
                  ? 'border-brand bg-brand/5 text-brand'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-6">
        <SectionLabel>Timeline</SectionLabel>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {timelines.map((t) => (
            <button
              key={t}
              onClick={() => setTimeline(t)}
              className={`rounded-lg border px-3 py-2 text-[13px] font-medium transition ${
                timeline === t
                  ? 'border-brand bg-brand/5 text-brand'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="my-6 border-t border-slate-100" />

      {/* Toggles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[13.5px] font-medium text-slate-700">Verified Only</span>
          <Switch on={verified} onClick={() => setVerified((v) => !v)} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[13.5px] font-medium text-slate-700">RERA Approved</span>
          <Switch on={rera} onClick={() => setRera((v) => !v)} />
        </div>
      </div>

      <button className="mt-6 w-full rounded-lg bg-navy-800 py-3 text-[14px] font-semibold text-white transition hover:bg-navy-700">
        Apply Filters
      </button>
    </div>
  )
}
