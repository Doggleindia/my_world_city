import Link from 'next/link'

export default function OwnershipSteps({ steps }) {
  return (
    <section className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-[28px] font-extrabold text-navy-800 sm:text-[34px]">
          Own This Property in <span className="text-emerald-500">5 Easy Steps</span>
        </h2>
        <p className="mt-2 text-[14px] text-slate-500">
          We connect you with a verified expert at every step — free.
        </p>

        <div className="mt-10 rounded-3xl bg-gradient-to-b from-indigo-50/70 to-white px-6 py-12 ring-1 ring-slate-100 sm:px-10">
          <div className="relative grid grid-cols-2 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
            {/* Connecting line (desktop) */}
            <div className="pointer-events-none absolute left-[10%] right-[10%] top-7 hidden h-0.5 bg-gradient-to-r from-teal-400 via-indigo-400 to-pink-400 lg:block" />

            {steps.map((s) => (
              <div key={s.n} className="relative flex flex-col items-center text-center">
                <div
                  className={`grid h-14 w-14 place-items-center rounded-full text-[18px] font-bold text-white shadow-md ring-4 ring-white ${s.ring}`}
                >
                  {s.n}
                </div>
                <h3 className="mt-4 text-[15px] font-bold text-navy-800">{s.title}</h3>
                <p className="mt-1.5 max-w-[170px] text-[12px] leading-relaxed text-slate-500">
                  {s.desc}
                </p>
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
      </div>
    </section>
  )
}
