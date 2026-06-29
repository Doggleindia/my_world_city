import Navbar from '@/components/Navbar'
import SiteFooter from '@/components/property/SiteFooter'

export const metadata = {
  title: 'Terms of Service — My World City',
  description: 'The terms governing your use of My World City.',
}

const sections = [
  ['Using the platform', 'My World City connects buyers, builders and investors with property listings and verified service partners. You agree to provide accurate information and to use the platform lawfully.'],
  ['Listings', 'Listings are submitted by owners and dealers and reviewed before going live. We make reasonable efforts to verify details but you should independently confirm any property before transacting.'],
  ['Payments', 'Optional promotion plans (Featured, Premium) are billed at the displayed price. Promotion improves visibility but does not guarantee a sale.'],
  ['Liability', 'My World City facilitates connections and is not a party to transactions between users. We are not liable for agreements reached off-platform.'],
]

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Navbar cta="brand" />
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="text-[32px] font-extrabold tracking-tight text-navy-900 sm:text-[38px]">Terms of Service</h1>
        <p className="mt-3 text-[14px] text-slate-500">Last updated: 2026</p>
        <div className="mt-8 space-y-8">
          {sections.map(([h, b]) => (
            <section key={h}>
              <h2 className="text-[18px] font-bold text-navy-800">{h}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{b}</p>
            </section>
          ))}
        </div>
      </div>
      <SiteFooter />
    </main>
  )
}
