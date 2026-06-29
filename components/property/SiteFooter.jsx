import { Building2, Globe, Mail, MessageCircle, ArrowRight } from 'lucide-react'

const cols = [
  {
    head: 'Explore',
    items: ['Find Property', 'List Property', 'Map View', 'Premium Listings', 'Top Areas'],
  },
  {
    head: 'Company',
    items: ['About Us', 'Terms of Service', 'Privacy Policy', 'Careers', 'Press Kit'],
  },
]

export default function SiteFooter() {
  return (
    <footer className="bg-navy-900 text-slate-300">
      {/* Dealer CTA strip */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 px-4 py-3.5 text-center text-[13px] sm:flex-row sm:px-6">
          <span className="text-slate-300">
            Are you a dealer? Get verified buyer leads delivered instantly to your phone.
          </span>
          <a href="#" className="inline-flex items-center gap-1 font-semibold text-sky-400 hover:text-sky-300">
            Try free for 5 leads <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <a href="#" className="flex items-center gap-2 font-extrabold text-white">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand">
              <Building2 className="h-4 w-4 text-white" />
            </span>
            <span className="text-[15px] tracking-wide">MY WORLD CITY</span>
          </a>
          <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-slate-400">
            Jaipur's premier data-driven real estate marketplace. Bringing transparency and trust to
            every title deed.
          </p>
          <div className="mt-5 flex gap-2.5">
            {[Globe, Mail, MessageCircle].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="grid h-8 w-8 place-items-center rounded-md bg-white/10 text-slate-300 transition hover:bg-white/20 hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {cols.map((c) => (
          <div key={c.head}>
            <h4 className="text-[13px] font-bold uppercase tracking-wide text-white">{c.head}</h4>
            <ul className="mt-4 space-y-2.5">
              {c.items.map((i) => (
                <li key={i}>
                  <a href="#" className="text-[13px] text-slate-400 transition hover:text-white">
                    {i}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="text-[13px] font-bold uppercase tracking-wide text-white">Support</h4>
          <ul className="mt-4 space-y-2.5">
            {['Contact Support', 'FAQs'].map((i) => (
              <li key={i}>
                <a href="#" className="text-[13px] text-slate-400 transition hover:text-white">
                  {i}
                </a>
              </li>
            ))}
          </ul>
          <button className="mt-4 inline-flex items-center gap-2 rounded-md bg-emerald-500 px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-emerald-600">
            <MessageCircle className="h-4 w-4" /> WhatsApp Support
          </button>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-[12.5px] text-slate-400 sm:flex-row sm:px-6">
          <p>© 2024 My World City. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Designed for Jaipur</span>
            <span>RERA Approved Platform</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
