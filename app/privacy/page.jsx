import Navbar from '@/components/Navbar'
import SiteFooter from '@/components/property/SiteFooter'

export const metadata = {
  title: 'Privacy Policy — My World City',
  description: 'How My World City collects, uses and protects your data.',
}

const sections = [
  ['Information we collect', 'We collect the phone number, name and email you provide when you create an account or submit an enquiry, along with basic usage data needed to run the platform.'],
  ['How we use it', 'We use your details to authenticate you, connect you with property owners and verified partners, and respond to your enquiries. We never sell your data.'],
  ['Sharing', 'When you submit an enquiry, your contact details are shared only with the relevant owner or matched partner so they can respond to you.'],
  ['Your choices', 'You can request access to or deletion of your account data at any time by contacting us.'],
]

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Navbar cta="brand" />
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="text-[32px] font-extrabold tracking-tight text-navy-900 sm:text-[38px]">Privacy Policy</h1>
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
