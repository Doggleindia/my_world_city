'use client'
import { Scale, Ruler, PencilRuler, Wrench, Stamp, Truck, Sofa, Compass,
  ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { useRef } from 'react'
import Link from 'next/link'
import { experts } from '../data'

const icons = { Scale, Ruler, PencilRuler, Wrench, Stamp, Truck, Sofa, Compass }

export default function TalkToExpert() {
  const scroller = useRef(null)
  const scrollBy = (dir) => scroller.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })

  return (
    <section className="bg-[#0a3d7a]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Talk to the right expert.</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-sky-100/90">
              From search to possession — handled, end-to-end. No vetting, no fees. We connect
              you with verified professionals across every stage of your property journey.
            </p>
          </div>
          <div className="hidden shrink-0 gap-2 sm:flex">
            <button onClick={() => scrollBy(-1)} aria-label="Previous"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 text-white transition hover:bg-white/10">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => scrollBy(1)} aria-label="Next"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 text-white transition hover:bg-white/10">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* pt/pb give the hover lift and its shadow room — overflow-x-auto clips
            vertically too, so without them the raised card gets cut off. */}
        <div ref={scroller} className="no-scrollbar mt-5 flex gap-5 overflow-x-auto pb-5 pt-3">
          {experts.map((e) => {
            const Icon = icons[e.icon]
            return (
              <div
                key={e.title}
                className="relative flex w-[300px] shrink-0 flex-col overflow-hidden rounded-2xl bg-white py-6 pl-7 pr-6 shadow-card transition hover:-translate-y-1 sm:w-[330px]"
              >
                {/* accent stripe down the left edge */}
                <span
                  className="absolute inset-y-0 left-0 w-[6px]"
                  style={{ backgroundColor: e.color }}
                />

                <div className="flex items-start justify-between gap-3">
                  <span
                    className="rounded-md px-2.5 py-1 text-[12px] font-medium"
                    style={{ backgroundColor: `${e.color}1f`, color: e.color }}
                  >
                    {e.tag}
                  </span>
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                    style={{ backgroundColor: `${e.color}14` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: e.color }} />
                  </span>
                </div>

                <h3 className="mt-4 text-[26px] font-bold leading-tight text-navy-900">{e.title}</h3>
                <p className="mt-2 flex-1 text-[15px] leading-relaxed text-slate-500">{e.desc}</p>
                <Link
                  href="/experts"
                  className="mt-5 self-start rounded-full bg-navy-800 px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-navy-700"
                >
                  Details
                </Link>
              </div>
            )
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <Link href="/experts" className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-[13px] font-semibold text-navy-800 transition hover:bg-sky-50">
            View all experts <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}