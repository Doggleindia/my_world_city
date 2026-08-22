import { ArrowRight } from 'lucide-react'
import ContactButton from '@/components/contact/ContactButton'

export default function BottomCTA() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-[#0a2a52] text-white shadow-card">
          <div className="grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-2 lg:gap-10 lg:p-10">
            <div className="overflow-hidden rounded-2xl">
              <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80"
                   alt="Modern residential towers at dusk"
                   className="h-56 w-full object-cover sm:h-64 lg:h-72" />
            </div>
            <div>
              <p className="text-[15px] font-medium text-sky-200">Own property?</p>
              <h3 className="mt-1 text-2xl font-extrabold leading-tight sm:text-[28px]">
                Turn it into leads, not a headache.
              </h3>
              <p className="mt-4 max-w-md text-[14px] leading-relaxed text-sky-100/85">
                Whether you're a homeowner, developer, or builder — list on PropAI for free and
                get verified buyers delivered to your phone. No brokers, no commissions, no chasing.
              </p>
              <ContactButton topic="PropAI — Get Leads" title="Get Leads"
                subtitle="Drop your number and we'll start sending you verified buyer leads."
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-navy-900 transition hover:bg-sky-50">
                Get Leads <ArrowRight className="h-4 w-4" />
              </ContactButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}