import Link from 'next/link'
import Image from 'next/image'
import { navLinks } from '@/data'
import AuthButtons from '@/components/auth/AuthButtons'
import MobileNav from '@/components/MobileNav'

export default function Navbar({ links = navLinks, cta = 'navy' }) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link href="/" aria-label="My World City — home" className="flex shrink-0 items-center">
          <Image src="/logo.png" alt="My World City" width={128} height={50} priority className="h-[38px] w-auto sm:h-[42px]" />
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
