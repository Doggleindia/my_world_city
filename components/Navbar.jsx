import Link from 'next/link'
import { Globe } from 'lucide-react'

const defaultLinks = [
  { label: 'Find Property', href: '/find-property' },
  { label: 'Build Property', href: '/develop' },
  { label: 'Services', href: '/services' },
]

export default function Navbar({ links = defaultLinks, cta = 'navy' }) {
  const ctaClass =
    cta === 'brand'
      ? 'bg-brand hover:bg-brand-700'
      : 'bg-navy-800 hover:bg-navy-700'

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-navy-800">
          <Globe className="h-5 w-5 text-brand" />
          <span className="text-[15px] tracking-tight">My World City</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-[14px] font-medium text-slate-600 transition hover:text-navy-800"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="#" className="hidden text-[14px] font-medium text-slate-600 hover:text-navy-800 sm:block">
            Login
          </Link>
          <button className={`rounded-full px-4 py-2 text-[13px] font-semibold text-white transition ${ctaClass}`}>
            List Property — Free
          </button>
        </div>
      </div>
    </header>
  )
}
