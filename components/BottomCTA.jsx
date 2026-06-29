export default function BottomCTA() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Property owner */}
          <div className="rounded-2xl bg-brand p-8 text-white shadow-card">
            <h3 className="text-xl font-extrabold sm:text-2xl">Are you a property owner?</h3>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-sky-100">
              List your property for free and get direct leads from verified buyers without
              any middleman.
            </p>
            <button className="mt-6 rounded-full bg-white px-5 py-2.5 text-[13px] font-semibold text-brand transition hover:bg-sky-50">
              List Property — Free
            </button>
          </div>

          {/* Developers & brokers */}
          <div className="rounded-2xl bg-ember p-8 text-white shadow-card">
            <h3 className="text-xl font-extrabold sm:text-2xl">For Developers and Brokers</h3>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-orange-50">
              Reach thousands of active property seekers every day. Premium dashboard to track
              all your listings.
            </p>
            <button className="mt-6 rounded-full border border-white px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-white/10">
              Dealer Program
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
