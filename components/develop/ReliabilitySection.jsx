import { BadgeCheck, UserCheck, Eye } from 'lucide-react'
import { reliability } from '@/data'

const iconMap = { BadgeCheck, UserCheck, Eye }
const accent = { 'bg-amber-500': 'border-amber-500', 'bg-brand': 'border-brand', 'bg-red-600': 'border-red-600' }

export default function ReliabilitySection() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-[26px] font-extrabold text-navy-800 sm:text-[30px]">
          The standard of reliability
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {reliability.map((r) => {
            const Icon = iconMap[r.icon]
            return (
              <div
                key={r.title}
                className={`rounded-2xl border border-slate-200 border-l-4 bg-white p-6 shadow-sm ${accent[r.bg]}`}
              >
                <span className={`grid h-11 w-11 place-items-center rounded-xl text-white ${r.bg}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-[16px] font-bold text-navy-800">{r.title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-500">{r.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
