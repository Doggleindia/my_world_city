import { Check } from 'lucide-react'

export default function ProfileAbout({ p }) {
  return (
    <section className="bg-emerald-500">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-[26px] font-extrabold text-emerald-950 sm:text-[30px]">About me</h2>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="max-w-2xl space-y-4 text-[14px] leading-relaxed text-emerald-950/80">
            {p.about.map((par, i) => (
              <p key={i}>{par}</p>
            ))}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-[16px] font-bold text-navy-800">Quick facts</h3>
            <ul className="mt-4 space-y-3">
              {p.quickFacts.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-slate-600">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" strokeWidth={3} /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
