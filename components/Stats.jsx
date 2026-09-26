import { stats } from '../data'

export default function Stats() {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-4 py-10 sm:px-6 lg:flex lg:flex-wrap lg:gap-x-[60px] lg:gap-y-6 lg:py-12">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`px-2 lg:px-0 ${i !== 0 ? 'lg:border-l lg:border-slate-300 lg:pl-[60px]' : ''}`}
          >
            <div className={`font-sans text-[28px] font-bold leading-none sm:text-[34px] lg:text-[40px] ${s.color || 'text-brand'}`}>{s.value}</div>
            <div className="mt-3 text-[12px] font-bold uppercase tracking-[0.04em] text-[#0A0A0A] sm:text-[13px]">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
