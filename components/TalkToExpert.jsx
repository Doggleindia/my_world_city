'use client'

import {
  Scale, Ruler, PencilRuler, Wrench, Stamp, Truck, Sofa, Compass,
  ChevronLeft, ChevronRight, ArrowRight,
} from 'lucide-react'
import { useRef } from 'react'
import { experts } from '../data'

const icons = { Scale, Ruler, PencilRuler, Wrench, Stamp, Truck, Sofa, Compass }

export default function TalkToExpert() {
  const scroller = useRef(null)

  const scrollBy = (dir) => {
    scroller.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })
  }

  return (
    <section className="bg-brand">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Talk to the right expert.</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-sky-100">
              From search to possession — handled, end-to-end. No vetting, no fees. We connect
              you with verified professionals across every stage of your property journey.
            </p>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button
              onClick={() => scrollBy(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 text-white transition hover:bg-white/10"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 text-white transition hover:bg-white/10"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={scroller}
          className="no-scrollbar mt-8 flex gap-4 overflow-x-auto pb-2"
        >
          {experts.map((e) => {
            const Icon = icons[e.icon]
            return (
              <div
                key={e.title}
                className="min-w-[210px] flex-1 rounded-xl bg-white p-5 shadow-card"
              >
                <div className="flex items-start justify-between">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10.5px] font-semibold text-slate-500">
                    {e.tag}
                  </span>
                  <Icon className="h-5 w-5 text-brand" />
                </div>
                <h3 className="mt-4 text-[16px] font-bold text-navy-800">{e.title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-snug text-slate-500">{e.desc}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <button className="inline-flex items-center gap-1.5 rounded-full bg-navy-800 px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-navy-900">
            View all experts <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
