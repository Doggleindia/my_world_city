import ContactButton from '@/components/contact/ContactButton'

export default function BottomCTA() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="overflow-hidden rounded-3xl bg-[#0a2a52] text-white shadow-card">
          <div className="grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-2 lg:gap-12 lg:p-12">
            <div className="overflow-hidden rounded-2xl">
              <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80"
                   alt="Modern residential towers at dusk"
                   className="h-56 w-full object-cover sm:h-64 lg:h-80" />
            </div>
            <div>
              <h3 className="text-[24px] font-semibold leading-[1.3] text-white sm:text-[28px] lg:text-[32px]">
                <span className="block">Own property?</span>
                <span className="block">Turn it into leads, not a headache.</span>
              </h3>
              <p className="mt-5 max-w-xl text-[16px] leading-[1.55] text-white/90 sm:text-[17px] lg:text-[19px]">
                Whether you're a homeowner, developer, or builder — list on PropAI for free and
                get verified buyers delivered to your phone. No brokers, no commissions, no chasing.
              </p>
              <ContactButton topic="PropAI — Get Leads" title="Get Leads"
                subtitle="Drop your number and we'll start sending you verified buyer leads."
                className="mt-8 inline-flex items-center rounded-full bg-white px-9 py-4 text-[17px] font-semibold text-navy-900 transition hover:bg-sky-50 sm:px-10 sm:py-5 sm:text-[20px]">
                Get Leads
              </ContactButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}