import Link from 'next/link'
import { Building2, Globe, Mail, MessageCircle, ArrowRight } from 'lucide-react'
import ContactButton from '@/components/contact/ContactButton'

const cols = [
  {
    head: 'Explore',
    items: [
      { label: 'Find Property', href: '/find-property' },
      { label: 'List Property', href: '/list-property' },
      { label: 'Premium Listings', href: '/find-property' },
      { label: 'Build Property', href: '/develop' },
      { label: 'Services', href: '/services' },
    ],
  },
  {
    head: 'Company',
    items: [
      { label: 'About Us', href: '/about' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Careers', href: '/about#careers' },
      { label: 'Insights', href: '/insights' },
    ],
  },
]

const WHATSAPP = 'https://wa.me/919000000000'

export default function SiteFooter() {
  return (
    <footer className="bg-navy-900 text-slate-300">
      {/* Dealer CTA strip */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 px-4 py-3.5 text-center text-[13px] sm:flex-row sm:px-6">
          <span className="text-slate-300">
            Are you a dealer? Get verified buyer leads delivered instantly to your phone.
          </span>
          <ContactButton
            topic="Dealer free trial — 5 leads"
            title="Try free for 5 leads"
            subtitle="Drop your number and we’ll set up your free dealer trial."
            className="inline-flex items-center gap-1 font-semibold text-sky-400 hover:text-sky-300"
          >
            Try free for 5 leads <ArrowRight className="h-3.5 w-3.5" />
          </ContactButton>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2 font-extrabold text-white">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand">
              <Building2 className="h-4 w-4 text-white" />
            </span>
            <span className="text-[15px] tracking-wide">MY WORLD CITY</span>
          </Link>
          <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-slate-400">
            Jaipur's premier data-driven real estate marketplace. Bringing transparency and trust to
            every title deed.
          </p>
          <div className="mt-5 flex gap-2.5">
            <a href="/" className="grid h-8 w-8 place-items-center rounded-md bg-white/10 text-slate-300 transition hover:bg-white/20 hover:text-white">
              <Globe className="h-4 w-4" />
            </a>
            <a href="mailto:hello@myworldcity.in" className="grid h-8 w-8 place-items-center rounded-md bg-white/10 text-slate-300 transition hover:bg-white/20 hover:text-white">
              <Mail className="h-4 w-4" />
            </a>
            <a href={WHATSAPP} target="_blank" rel="noreferrer" className="grid h-8 w-8 place-items-center rounded-md bg-white/10 text-slate-300 transition hover:bg-white/20 hover:text-white">
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>

        {cols.map((c) => (
          <div key={c.head}>
            <h4 className="text-[13px] font-bold uppercase tracking-wide text-white">{c.head}</h4>
            <ul className="mt-4 space-y-2.5">
              {c.items.map((i) => (
                <li key={i.label}>
                  <Link href={i.href} className="text-[13px] text-slate-400 transition hover:text-white">
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="text-[13px] font-bold uppercase tracking-wide text-white">Support</h4>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link href="/contact" className="text-[13px] text-slate-400 transition hover:text-white">
                Contact Support
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-[13px] text-slate-400 transition hover:text-white">
                FAQs
              </Link>
            </li>
          </ul>
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-emerald-500 px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-emerald-600"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp Support
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-[12.5px] text-slate-400 sm:flex-row sm:px-6">
          <p>© 2026 My World City. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Designed for Jaipur</span>
            <span>RERA Approved Platform</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
