import Link from 'next/link'
import { ownershipSteps } from '@/data'

export default function ExpertStepper() {
  return (
    <div className="relative mt-12">
      {/* connector line (desktop) */}
      <div className="pointer-events-none absolute left-[10%] right-[10%] top-7 hidden h-0.5 bg-gradient-to-r from-teal-400 via-indigo-400 to-pink-400 lg:block" />

      <div className="grid grid-cols-2 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
        {ownershipSteps.map((s) => (
          <div key={s.n} className="relative flex flex-col items-center text-center">
            <div
              className={`grid h-14 w-14 place-items-center rounded-full text-[18px] font-bold text-white shadow-md ring-4 ring-slate-100 ${s.ring}`}
            >
              {s.n}
            </div>
            <h3 className="mt-4 text-[15px] font-bold text-navy-800">{s.title}</h3>
            <p className="mt-1.5 max-w-[170px] text-[12px] leading-relaxed text-slate-500">{s.desc}</p>
            <Link
              href="/experts"
              className="mt-3 rounded-md border border-slate-200 bg-white px-4 py-1.5 text-[12.5px] font-semibold text-brand transition hover:border-brand/40 hover:bg-brand/5"
            >
              Connect
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
