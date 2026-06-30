'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { User, Heart, LayoutDashboard, Shield, LogOut, ChevronDown } from 'lucide-react'

export default function AuthButtons({ cta = 'navy' }) {
  const { user, loading, openLogin, requireAuth, logout } = useAuth()
  const router = useRouter()
  const [menu, setMenu] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setMenu(false)
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const ctaClass =
    cta === 'brand' ? 'bg-brand hover:bg-brand-700' : 'bg-navy-800 hover:bg-navy-700'

  const firstName = user?.name?.split(' ')[0] || `+91 ${user?.phone?.slice(-4)}`
  const isAdmin = user?.roles?.includes('admin')

  return (
    <div className="flex items-center gap-4">
      {loading ? (
        <span className="h-8 w-20 animate-pulse rounded-full bg-slate-100" />
      ) : user ? (
        <div className="relative" ref={ref}>
          <button
            onClick={() => setMenu((m) => !m)}
            className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-2.5 text-[13px] font-semibold text-navy-800 transition hover:border-slate-300"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-brand/10 text-brand">
              <User className="h-4 w-4" />
            </span>
            <span className="hidden max-w-[120px] truncate sm:block">{firstName}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {menu && (
            <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-100 bg-white py-1.5 shadow-card">
              <MenuLink href="/saved" icon={Heart} onClick={() => setMenu(false)}>
                Saved properties
              </MenuLink>
              <MenuLink href="/dashboard" icon={LayoutDashboard} onClick={() => setMenu(false)}>
                Dashboard
              </MenuLink>
              {isAdmin && (
                <MenuLink href="/admin" icon={Shield} onClick={() => setMenu(false)}>
                  Admin
                </MenuLink>
              )}
              <button
                onClick={async () => {
                  setMenu(false)
                  await logout()
                  router.push('/')
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13.5px] font-medium text-red-600 transition hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={openLogin}
          className="hidden text-[14px] font-medium text-slate-600 transition hover:text-navy-800 sm:block"
        >
          Login
        </button>
      )}

      <button
        onClick={() => requireAuth(() => router.push('/list-property'))}
        className={`whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-semibold text-white transition sm:px-4 ${ctaClass}`}
      >
        <span className="sm:hidden">List Free</span>
        <span className="hidden sm:inline">List Property — Free</span>
      </button>
    </div>
  )
}

function MenuLink({ href, icon: Icon, children, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2.5 text-[13.5px] font-medium text-slate-700 transition hover:bg-slate-50"
    >
      <Icon className="h-4 w-4 text-slate-400" /> {children}
    </Link>
  )
}
