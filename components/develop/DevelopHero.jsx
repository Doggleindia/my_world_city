import { developHeroImg } from '@/data'

export default function DevelopHero() {
  return (
    <section className="relative overflow-hidden bg-slate-900">
      <img
        src={developHeroImg}
        alt="Luxury property"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* light wash on the left for the text */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="max-w-xl">
          <h1 className="text-[32px] font-extrabold leading-tight tracking-tight text-navy-900 sm:text-[42px]">
            Developing a property?
            <br />
            The whole process handled.
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-700">
            From legal clearances to the final Vastu check, we orchestrate every professional and
            permit required to turn your land into a masterpiece.
          </p>
          <button className="mt-7 rounded-full border border-slate-300 bg-white/90 px-6 py-3 text-[14px] font-semibold text-navy-800 transition hover:border-brand hover:text-brand">
            Talk to our team
          </button>
        </div>
      </div>
    </section>
  )
}
