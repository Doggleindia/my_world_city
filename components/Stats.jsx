import { stats } from '../data'

export default function Stats() {
  return (
    <section className="border-y border-slate-100 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-4 py-10 sm:px-6 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`px-2 ${i !== 0 ? 'lg:border-l lg:border-slate-200' : ''}`}
          >
            <div className="text-2xl font-extrabold text-brand sm:text-[26px]">{s.value}</div>
            <div className="mt-1.5 text-[11px] font-semibold tracking-wide text-slate-500">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
