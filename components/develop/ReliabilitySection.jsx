import { BadgeCheck, UserCheck, Eye } from 'lucide-react'
import { reliability } from '@/data'

const iconMap = { BadgeCheck, UserCheck, Eye }

// Darker end of the icon-tile gradient.
function shade(hex, amount = 0.76) {
  const n = parseInt(hex.replace('#', ''), 16)
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * amount))
  return `rgb(${c.join(',')})`
}

export default function ReliabilitySection() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-[26px] font-extrabold tracking-tight text-navy-900 sm:text-[32px]">
          The standard of <span className="text-brand">reliability</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-[15px] leading-relaxed text-slate-500">
          Three promises we hold ourselves to on every single project.
        </p>

        <div className="mt-11 grid gap-6 md:grid-cols-3">
          {reliability.map((r) => {
            const Icon = iconMap[r.icon]
            const c = r.color || '#1f5fbf'
            return (
              <div
                key={r.title}
                className="group relative overflow-hidden rounded-3xl p-6 ring-1 ring-slate-200/80 transition-all duration-300 hover:-translate-y-2 sm:p-7"
                style={{
                  background: `linear-gradient(158deg, ${c}0f 0%, #ffffff 58%)`,
                  boxShadow: '0 6px 22px -14px rgba(8,26,51,0.25)',
                }}
              >
                {/* colour bar that fills across the top on hover */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1.5 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                  style={{ background: `linear-gradient(90deg, ${c}, ${c}55)` }}
                />

                {/* light sweeps across the card on hover */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent transition-all duration-700 group-hover:left-[130%]"
                />

                {/* oversized ghost of the icon, anchored bottom-right */}
                <Icon
                  aria-hidden="true"
                  strokeWidth={1.25}
                  className="pointer-events-none absolute -bottom-6 -right-5 h-32 w-32 opacity-[0.055] transition-all duration-500 group-hover:-rotate-6 group-hover:scale-110 group-hover:opacity-[0.1]"
                  style={{ color: c }}
                />

                <span
                  className="relative grid h-14 w-14 place-items-center rounded-2xl text-white transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${c}, ${shade(c)})`,
                    boxShadow: `0 12px 24px -10px ${c}cc`,
                  }}
                >
                  <Icon className="h-6 w-6" />
                </span>

                <h3 className="relative mt-6 inline-block text-[17px] font-bold text-navy-900">
                  {r.title}
                  {/* underline grows out from the left on hover */}
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1 left-0 h-[3px] w-full origin-left scale-x-0 rounded-full transition-transform duration-400 group-hover:scale-x-100"
                    style={{ background: c }}
                  />
                </h3>

                <p className="relative mt-3 text-[13.5px] leading-relaxed text-slate-500">{r.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
