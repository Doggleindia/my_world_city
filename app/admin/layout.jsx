'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import {
  LayoutDashboard, Inbox, Lightbulb, Building2, Wrench, MessageSquare,
  UserSearch, BookUser, Map, Search, Bell, HelpCircle, ShieldAlert, Loader2,
  Menu, X, ClipboardCheck, ChevronRight,
} from 'lucide-react'

function roleLabel(user) {
  const r = user?.roles || []
  if (r.includes('admin')) return 'Super Admin'
  if (r.includes('owner')) return 'Property Owner'
  return 'Team Member'
}

const NAV = [
  {
    section: 'Overview',
    items: [{ label: 'Dashboard', href: '/admin', icon: LayoutDashboard }],
  },
  {
    section: 'Enquiries',
    items: [
      { label: 'All Enquiries', href: '/admin/enquiries', icon: Inbox, badge: 'unassigned' },
      { label: 'Solution', href: '/admin/enquiries?cat=solution', icon: Lightbulb },
      { label: 'Property', href: '/admin/enquiries?cat=property', icon: Building2 },
      { label: 'Service', href: '/admin/service', icon: Wrench },
      { label: 'General', href: '/admin/enquiries?cat=general', icon: MessageSquare },
    ],
  },
  {
    section: 'Experts',
    items: [
      { label: 'Expert Requests', href: '/admin/experts', icon: UserSearch },
      { label: 'Directory', href: '/admin/directory', icon: BookUser },
    ],
  },
  {
    section: 'Properties',
    items: [
      { label: 'All Properties', href: '/admin/properties', icon: Building2, badge: 'pendingProperties' },
      { label: 'Localities', href: '/admin/localities', icon: Map },
    ],
  },
]

const AdminStatsCtx = createContext(null)
export function useAdminStats() {
  return useContext(AdminStatsCtx)
}

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth()
  const isAdmin = user?.roles?.includes('admin')

  const [data, setData] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState('')
  const [drawer, setDrawer] = useState(false)

  const refresh = useCallback(async () => {
    setStatsLoading(true)
    setStatsError('')
    try {
      const res = await fetch('/api/admin/stats')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Could not load stats')
      setData(json)
    } catch (e) {
      setStatsError(e.message)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) refresh()
  }, [isAdmin, refresh])

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f4f6fb]">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f4f6fb] px-6">
        <div className="flex max-w-sm flex-col items-center rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-card">
          <ShieldAlert className="h-10 w-10 text-slate-300" />
          <h2 className="mt-4 text-[18px] font-bold text-navy-800">Admins only</h2>
          <p className="mt-1.5 px-8 text-[14px] text-slate-500">
            You need an admin account to open the console.
          </p>
          <Link href="/" className="mt-6 rounded-full bg-brand px-6 py-3 text-[14px] font-semibold text-white hover:bg-brand-700">
            Back to site
          </Link>
        </div>
      </div>
    )
  }

  const badges = { unassigned: data?.stats?.unassigned, pendingProperties: data?.stats?.pendingProperties }

  return (
    <AdminStatsCtx.Provider value={{ data, loading: statsLoading, error: statsError, refresh }}>
      <div className="min-h-screen bg-[#f4f6fb] text-slate-900">
        <Sidebar badges={badges} user={user} drawer={drawer} onClose={() => setDrawer(false)} />
        <div className="lg:pl-64">
          <Topbar onMenu={() => setDrawer(true)} />
          <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </AdminStatsCtx.Provider>
  )
}

function Sidebar({ badges, user, drawer, onClose }) {
  const initials =
    (user?.name || 'Admin')
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'AD'

  return (
    <>
      {/* Mobile overlay */}
      {drawer && <div className="fixed inset-0 z-40 bg-navy-900/50 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0a2f63] text-white transition-transform lg:translate-x-0 ${
          drawer ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/admin" className="flex items-center gap-2" onClick={onClose}>
            <span className="text-[17px] font-extrabold tracking-tight">My World City</span>
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white/90">
              ADMIN
            </span>
          </Link>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-white/70 hover:bg-white/10 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {NAV.map((group) => (
            <div key={group.section} className="mt-4 first:mt-2">
              <p className="px-3 pb-1.5 text-[10.5px] font-bold uppercase tracking-wider text-white/35">
                {group.section}
              </p>
              {group.items.map((item) => (
                <NavItem key={item.label} item={item} badge={badges[item.badge]} onClose={onClose} />
              ))}
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 text-[12px] font-bold">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-semibold">{user?.name || 'Admin'}</p>
              <p className="text-[11.5px] text-white/50">{roleLabel(user)}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

function NavItem({ item, badge, onClose }) {
  const pathname = usePathname()
  const base = item.href.split('?')[0]
  const active = base === '/admin' ? pathname === '/admin' : pathname === base || pathname.startsWith(base + '/')
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      onClick={onClose}
      className={`mt-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition ${
        active ? 'bg-white/12 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span className="flex-1 truncate">{item.label}</span>
      {badge > 0 && (
        <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
          {badge}
        </span>
      )}
    </Link>
  )
}

function Topbar({ onMenu }) {
  const { user } = useAuth()
  const { data } = useAdminStats() || {}
  const s = data?.stats || {}
  const alerts = [
    s.pendingProperties > 0 && { icon: ClipboardCheck, label: `${s.pendingProperties} propert${s.pendingProperties === 1 ? 'y' : 'ies'} pending approval`, href: '/admin/properties' },
    s.unassigned > 0 && { icon: Inbox, label: `${s.unassigned} unassigned enquir${s.unassigned === 1 ? 'y' : 'ies'}`, href: '/admin/enquiries' },
    s.expertsPending > 0 && { icon: UserSearch, label: `${s.expertsPending} expert${s.expertsPending === 1 ? '' : 's'} pending verification`, href: '/admin/directory' },
  ].filter(Boolean)
  const [bellOpen, setBellOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
      <button onClick={onMenu} className="grid h-9 w-9 place-items-center rounded-lg text-navy-800 hover:bg-slate-100 lg:hidden">
        <Menu className="h-5 w-5" />
      </button>

      <SearchBox />

      <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
        <div className="relative">
          <button onClick={() => setBellOpen((o) => !o)} className="relative grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100">
            <Bell className="h-5 w-5" />
            {alerts.length > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />}
          </button>
          {bellOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
              <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-card">
                <p className="px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Needs attention</p>
                {alerts.length === 0 ? (
                  <p className="px-4 py-3 text-[13px] text-slate-500">All clear 🎉</p>
                ) : alerts.map((a, i) => (
                  <Link key={i} href={a.href} onClick={() => setBellOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-slate-700 transition hover:bg-slate-50">
                    <a.icon className="h-4 w-4 text-amber-500" /> {a.label}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
        <a href="/contact" target="_blank" title="Help & support" className="grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100">
          <HelpCircle className="h-5 w-5" />
        </a>
        <div className="hidden h-8 w-px bg-slate-200 sm:block" />
        <div className="flex items-center gap-2.5">
          <div className="hidden text-right sm:block">
            <p className="text-[13px] font-bold text-navy-800">{user?.name || 'Admin User'}</p>
            <p className="text-[11px] text-slate-400">{roleLabel(user)}</p>
          </div>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand/10 text-[12px] font-bold text-brand">
            {(user?.name || 'AD').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  )
}

function SearchBox() {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [res, setRes] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (q.trim().length < 2) { setRes(null); return }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`)
        setRes(r.ok ? await r.json() : null)
      } catch { setRes(null) }
    }, 250)
    return () => clearTimeout(t)
  }, [q])

  const go = (href) => { setOpen(false); setQ(''); setRes(null); router.push(href) }
  const groups = [
    ['Properties', res?.properties, (r) => `${r.title} · ${r.locality}`],
    ['Experts', res?.experts, (r) => `${r.name} · ${r.cat}`],
    ['Enquiries', res?.leads, (r) => `${r.name} · +91 ${r.phone}`],
  ].filter(([, list]) => list && list.length)

  return (
    <div className="relative hidden max-w-xl flex-1 sm:block">
      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder="Search properties, experts, enquiries…"
        className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-[13.5px] text-slate-700 placeholder:text-slate-400 focus:border-brand focus:bg-white focus:outline-none"
      />
      {open && q.trim().length >= 2 && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 z-50 mt-2 max-h-[60vh] overflow-y-auto rounded-xl border border-slate-200 bg-white py-1.5 shadow-card">
            {!res ? (
              <p className="px-4 py-3 text-[13px] text-slate-400">Searching…</p>
            ) : groups.length === 0 ? (
              <p className="px-4 py-3 text-[13px] text-slate-500">No matches for “{q}”.</p>
            ) : groups.map(([label, list, render]) => (
              <div key={label}>
                <p className="px-4 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                {list.map((r) => (
                  <button key={r.id} onClick={() => go(r.href)} className="flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-[13px] text-slate-700 transition hover:bg-slate-50">
                    <span className="truncate">{render(r)}</span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
