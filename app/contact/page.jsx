import Navbar from '@/components/Navbar'
import SiteFooter from '@/components/property/SiteFooter'
import ContactButton from '@/components/contact/ContactButton'
import { Phone, Mail, MapPin } from 'lucide-react'

export const metadata = {
  title: 'Contact — My World City',
  description: 'Get in touch with the My World City team.',
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Navbar cta="brand" />
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="text-[34px] font-extrabold tracking-tight text-navy-900 sm:text-[42px]">
          Contact us
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-slate-600">
          Questions about a property, a service, or listing with us? We’re here to help.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Info icon={Phone} label="Phone" value="+91 90000 00000" />
          <Info icon={Mail} label="Email" value="hello@myworldcity.in" />
          <Info icon={MapPin} label="Office" value="C-Scheme, Jaipur" />
        </div>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-7 text-center">
          <h2 className="text-[18px] font-bold text-navy-800">Send us a message</h2>
          <p className="mt-1.5 text-[14px] text-slate-500">We usually respond within a couple of hours.</p>
          <ContactButton
            topic="Contact page enquiry"
            title="Get in touch"
            subtitle="Leave your details and we’ll call you back."
            className="mt-5 inline-block rounded-full bg-brand px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-brand-700"
          >
            Message us
          </ContactButton>
        </div>
      </div>
      <SiteFooter />
    </main>
  )
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
      <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-[14px] font-semibold text-navy-800">{value}</p>
    </div>
  )
}
