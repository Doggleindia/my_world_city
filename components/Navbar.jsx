import Link from 'next/link'
import { Globe } from 'lucide-react'
import { navLinks } from '@/data'
import AuthButtons from '@/components/auth/AuthButtons'
import MobileNav from '@/components/MobileNav'

export default function Navbar({ links = navLinks, cta = 'navy' }) {
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

        <div className="flex items-center gap-2">
          <AuthButtons cta={cta} />
          <MobileNav links={links} />
        </div>
      </div>
    </header>
  )
}
