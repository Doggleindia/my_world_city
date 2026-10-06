import Link from 'next/link'

// "Own this property in 5 easy steps". Phones get a vertical timeline (one
// step under the next, nothing to swipe); tablets a snap-scrolling row; large
// screens an evenly spread 5-column row.
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

        <div className="mt-10 rounded-3xl bg-gradient-to-b from-indigo-50/70 to-white px-5 py-8 ring-1 ring-slate-100 sm:py-12 sm:pl-10 sm:pr-0 lg:px-10">
          {/* ---- phones: vertical timeline ---- */}
          <ol className="sm:hidden">
            {steps.map((s, i) => (
              <li key={s.n} className="relative flex gap-4 pb-8 last:pb-0">
                {/* the joining line runs down from each circle to the next */}
                {i < steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-7 top-14 h-[calc(100%-3.5rem)] w-0.5 -translate-x-1/2 bg-gradient-to-b from-teal-300 via-indigo-300 to-pink-300"
                  />
                )}
                <div
                  className={`relative grid h-14 w-14 shrink-0 place-items-center rounded-full text-[18px] font-bold text-white shadow-md ring-4 ring-white ${s.ring}`}
                >
                  {s.n}
                </div>
                <div className="min-w-0 pt-1">
                  <h3 className="text-[17px] font-bold text-navy-800">{s.title}</h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-slate-500">{s.desc}</p>
                  <Link
                    href="/experts"
                    className="mt-3 inline-block rounded-md border border-slate-200 bg-white px-4 py-1.5 text-[13px] font-semibold text-brand transition hover:border-brand/40 hover:bg-brand/5"
                  >
                    Connect
                  </Link>
                </div>
              </li>
            ))}
          </ol>

          {/* ---- tablets and up: one row ---- */}
          <div className="no-scrollbar hidden snap-x snap-mandatory gap-6 overflow-x-auto pb-3 pr-10 sm:flex lg:grid lg:grid-cols-5 lg:gap-0 lg:overflow-visible lg:pb-0 lg:pr-0">
            {steps.map((s, i) => (
              <div
                key={s.n}
                className="relative flex w-[30%] shrink-0 snap-center flex-col items-center text-center lg:w-auto"
              >
                {/* the joining line, drawn per step so it survives both layouts */}
                {i < steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-7 h-0.5 w-[calc(100%+24px)] bg-gradient-to-r from-teal-300 via-indigo-300 to-pink-300 lg:w-full"
                  />
                )}

                <div
                  className={`relative grid h-14 w-14 shrink-0 place-items-center rounded-full text-[18px] font-bold text-white shadow-md ring-4 ring-white ${s.ring}`}
                >
                  {s.n}
                </div>
                <h3 className="mt-4 text-[15px] font-bold text-navy-800">{s.title}</h3>
                <p className="mb-3 mt-1.5 max-w-[170px] text-[12px] leading-relaxed text-slate-500">
                  {s.desc}
                </p>
                <Link
                  href="/experts"
                  className="mt-auto rounded-md border border-slate-200 bg-white px-4 py-1.5 text-[12.5px] font-semibold text-brand transition hover:border-brand/40 hover:bg-brand/5"
                >
                  Connect
                </Link>
              </div>
            ))}
          </div>

          {/* Only shown where the row actually scrolls. */}
          <p className="mt-1 hidden pr-10 text-center text-[11.5px] text-slate-400 sm:block lg:hidden">
            Swipe to see all 5 steps
          </p>
        </div>
      </div>
    </section>
  )
}
