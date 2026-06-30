'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Heart, LayoutDashboard, Shield, LogOut, Globe } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'

export default function MobileNav({ links }) {
  const [open, setOpen] = useState(false)
  const { user, openLogin, logout } = useAuth()
  const isAdmin = user?.roles?.includes('admin')

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="grid h-9 w-9 place-items-center rounded-lg text-navy-800 transition hover:bg-slate-100"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[70]">
          <div
            className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm"
            onClick={close}
          />
          <div className="absolute right-0 top-0 flex h-full w-72 max-w-[85%] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <Link href="/" onClick={close} className="flex items-center gap-2 font-extrabold text-navy-800">
                <Globe className="h-5 w-5 text-brand" />
                <span className="text-[15px]">My World City</span>
              </Link>
              <button
                onClick={close}
                aria-label="Close menu"
                className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-col px-3 py-3">
              {links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  onClick={close}
                  className="rounded-lg px-3 py-3 text-[15px] font-semibold text-navy-800 transition hover:bg-slate-50"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto border-t border-slate-100 px-3 py-3">
              {user ? (
                <>
                  <MobileLink href="/saved" icon={Heart} onClick={close}>Saved properties</MobileLink>
                  <MobileLink href="/dashboard" icon={LayoutDashboard} onClick={close}>Dashboard</MobileLink>
                  {isAdmin && <MobileLink href="/admin" icon={Shield} onClick={close}>Admin</MobileLink>}
                  <button
                    onClick={async () => {
                      close()
                      await logout()
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-3 text-left text-[14px] font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    close()
                    openLogin()
                  }}
                  className="w-full rounded-full border border-slate-200 px-4 py-2.5 text-[14px] font-semibold text-navy-800 transition hover:border-slate-300"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MobileLink({ href, icon: Icon, children, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-[14px] font-semibold text-slate-700 transition hover:bg-slate-50"
    >
      <Icon className="h-4 w-4 text-slate-400" /> {children}
    </Link>
  )
}
