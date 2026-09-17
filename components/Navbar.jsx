'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { navLinks } from '@/data'
import AuthButtons from '@/components/auth/AuthButtons'
import MobileNav from '@/components/MobileNav'

// `overlay` puts the bar on top of a full-bleed hero: transparent with white
// text at the top of the page, then it turns into the normal solid bar as soon
// as the user scrolls, so the links stay readable over the page content.
export default function Navbar({ links = navLinks, cta = 'navy', overlay = false }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (!overlay) return
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [overlay])

  const clear = overlay && !scrolled

  return (
    <header
      className={`z-50 transition-[background-color,border-color,box-shadow] duration-300 ${
        overlay
          ? clear
            ? 'absolute inset-x-0 top-0 border-b border-transparent bg-transparent'
            : 'mwc-nav-drop fixed inset-x-0 top-0 border-b border-slate-100 bg-white/95 shadow-[0_2px_18px_-12px_rgba(8,26,51,0.5)] backdrop-blur'
          : 'sticky top-0 border-b border-slate-100 bg-white/95 backdrop-blur'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3.5 sm:px-6">
        <Link href="/" aria-label="My World City — home" className="flex shrink-0 items-center">
          <Image
            src={clear ? '/logo-white.png' : '/logo.png'}
            alt="My World City"
            width={128}
            height={50}
            priority
            className="h-8 w-auto xs:h-[38px] sm:h-[42px]"
          />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className={`whitespace-nowrap text-[14px] font-medium transition ${
                clear
                  ? 'text-white/85 drop-shadow-[0_1px_6px_rgba(8,26,51,0.5)] hover:text-white'
                  : 'text-slate-600 hover:text-navy-800'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <AuthButtons cta={cta} onDark={clear} />
          <MobileNav links={links} onDark={clear} />
        </div>
      </div>
    </header>
  )
}
