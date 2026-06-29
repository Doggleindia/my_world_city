import Link from 'next/link'
import StepAccordion from './StepAccordion'
import { developSteps } from '@/data'

export default function DevelopTimeline() {
  return (
    <section className="bg-indigo-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-[28px] font-extrabold text-navy-800 sm:text-[34px]">
            Your Vision, Visualized.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-slate-500">
            Follow the unified path to your dream property with Jaipur&apos;s most trusted
            development framework.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative mt-12">
          {/* vertical connector line */}
          <div className="pointer-events-none absolute bottom-6 left-[19px] top-6 w-0.5 -translate-x-1/2 bg-brand/30" />

          <div className="space-y-14">
            {developSteps.map((s) => (
              <div key={s.n} className="relative grid grid-cols-[40px_1fr] gap-x-5 sm:gap-x-8">
                <div
                  className={`relative z-10 grid h-10 w-10 place-items-center rounded-full text-[15px] font-bold text-white ring-4 ring-indigo-50 ${s.ring}`}
                >
                  {s.n}
                </div>

                <div className="grid gap-7 lg:grid-cols-2 lg:items-start">
                  {/* Text */}
                  <div>
                    <h3 className="text-[20px] font-bold text-navy-800">
                      Step {String(s.n).padStart(2, '0')}: {s.title}
                    </h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-slate-500">{s.desc}</p>

                    <StepAccordion faqs={s.faqs} />

                    <Link
                      href="/experts"
                      className="mt-5 inline-block rounded-lg bg-navy-800 px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-navy-700"
                    >
                      Contact Expert
                    </Link>
                  </div>

                  {/* Image */}
                  <div className="overflow-hidden rounded-2xl shadow-card lg:mt-1">
                    <img
                      src={s.img}
                      alt={s.title}
                      className="h-56 w-full object-cover sm:h-72 lg:h-[300px]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
