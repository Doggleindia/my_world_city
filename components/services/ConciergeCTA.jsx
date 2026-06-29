const officeImg =
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1100&q=80'

export default function ConciergeCTA() {
  return (
    <section className="bg-indigo-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-[28px] font-extrabold text-navy-800 sm:text-[32px]">
              Can&apos;t find what you&apos;re looking for?
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-600">
              Our concierge team is available to source specific partners for unique property
              requirements. We maintain the highest standards of vetting for every referral.
            </p>
            <button className="mt-7 rounded-full border border-brand/40 bg-white px-6 py-3 text-[14px] font-semibold text-brand transition hover:border-brand hover:bg-brand/5">
              Connect to us
            </button>
          </div>

          <div className="overflow-hidden rounded-3xl shadow-card">
            <img
              src={officeImg}
              alt="Concierge office"
              className="h-[300px] w-full object-cover sm:h-[360px]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
