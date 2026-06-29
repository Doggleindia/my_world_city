import Link from 'next/link'
import { Globe } from 'lucide-react'

const cols = [
  {
    head: 'Company',
    items: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/about#careers' },
      { label: 'Contact', href: '/contact' },
      { label: 'Blog', href: '/insights' },
    ],
  },
  {
    head: 'Properties',
    items: [
      { label: 'Residential', href: '/find-property?category=Residential' },
      { label: 'Commercial', href: '/find-property?category=Commercial' },
      { label: 'Industrial', href: '/find-property?category=Industrial' },
      { label: 'Farm & Agri', href: '/find-property?category=Farm%20%26%20Agri' },
    ],
  },
  {
    head: 'Services',
    items: [
      { label: 'Legal', href: '/services' },
      { label: 'Surveyor', href: '/services' },
      { label: 'Architect', href: '/services' },
      { label: 'Vastu', href: '/services' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2 font-extrabold text-white">
            <Globe className="h-5 w-5 text-sky-400" />
            <span className="text-[15px]">My World City</span>
          </Link>
          <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-slate-400">
            Jaipur's verified property platform connecting buyers, builders and investors —
            every property real, every partner verified.
          </p>
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
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-[12.5px] text-slate-400 sm:flex-row sm:px-6">
          <p>© 2026 My World City. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
