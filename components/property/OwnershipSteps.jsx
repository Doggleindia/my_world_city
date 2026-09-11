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

        <div className="mt-10 rounded-3xl bg-gradient-to-b from-indigo-50/70 to-white py-10 pl-6 ring-1 ring-slate-100 sm:py-12 sm:pl-10 lg:px-10">
          {/* One line on every screen: a snap-scrolling row on phones and
              tablets, an evenly spread 5-column row from lg up. */}
          <div className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-3 pr-6 sm:pr-10 lg:grid lg:grid-cols-5 lg:gap-0 lg:overflow-visible lg:pb-0 lg:pr-0">
            {steps.map((s, i) => (
              <div
                key={s.n}
                className="relative flex w-[43%] shrink-0 snap-center flex-col items-center text-center sm:w-[30%] lg:w-auto"
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
          <p className="mt-1 pr-6 text-center text-[11.5px] text-slate-400 sm:pr-10 lg:hidden">
            Swipe to see all 5 steps
          </p>
        </div>
      </div>
    </section>
  )
}
