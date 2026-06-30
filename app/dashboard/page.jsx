'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import SiteFooter from '@/components/property/SiteFooter'
import { useAuth } from '@/components/auth/AuthProvider'
import PromoteButton from '@/components/dashboard/PromoteButton'
import {
  Loader2, LogIn, Plus, Eye, Trash2, Home, Inbox, Phone, Mail, BadgeCheck, Star,
} from 'lucide-react'

const STATUS_STYLE = {
  active: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  draft: 'bg-slate-100 text-slate-600',
  sold: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function DashboardPage() {
  const { user, loading, openLogin } = useAuth()
  const [tab, setTab] = useState('listings')

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <Navbar cta="brand" />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {loading ? (
          <Center><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></Center>
        ) : !user ? (
          <Gate onLogin={openLogin} />
        ) : (
          <>
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-[28px] font-extrabold tracking-tight text-navy-900 sm:text-[32px]">
                  Dashboard
                </h1>
                <p className="mt-1 text-[14px] text-slate-500">
                  {user.name ? `Welcome, ${user.name.split(' ')[0]}` : `+91 ${user.phone}`}
                </p>
              </div>
              <Link
                href="/list-property"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-brand-700"
              >
                <Plus className="h-4 w-4" /> List a property
              </Link>
            </div>

            <div className="mt-7 flex gap-2.5">
              <Tab active={tab === 'listings'} onClick={() => setTab('listings')} icon={Home}>
                My listings
              </Tab>
              <Tab active={tab === 'leads'} onClick={() => setTab('leads')} icon={Inbox}>
                Leads
              </Tab>
            </div>

            <div className="mt-6">
              {tab === 'listings' ? <Listings /> : <Leads />}
            </div>
          </>
        )}
      </div>
      <SiteFooter />
    </main>
  )
}

function Listings() {
  const [items, setItems] = useState(null)
  const load = useCallback(async () => {
    const res = await fetch('/api/me/listings')
    const data = await res.json()
    setItems(res.ok ? data.items : [])
  }, [])
  useEffect(() => { load() }, [load])

  const remove = async (id) => {
    if (!confirm('Delete this listing?')) return
    setItems((prev) => prev.filter((p) => p.id !== id))
    await fetch(`/api/properties/${id}`, { method: 'DELETE' })
  }

  if (!items) return <Center><Loader2 className="h-7 w-7 animate-spin text-slate-400" /></Center>
  if (items.length === 0)
    return (
      <Empty icon={Home} title="No listings yet" body="Create your first listing to start getting leads.">
        <Link href="/list-property" className="mt-5 rounded-full bg-brand px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-brand-700">
          List a property
        </Link>
      </Empty>
    )

  return (
    <div className="space-y-4">
      {items.map((p) => (
        <div key={p.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <img src={p.img} alt={p.title} className="h-24 w-full rounded-xl object-cover sm:w-36" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[16px] font-bold text-navy-800">{p.title}</h3>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLE[p.status] || 'bg-slate-100 text-slate-600'}`}>
                {p.status}
              </span>
              {p.verified && <BadgeCheck className="h-4 w-4 text-emerald-500" />}
              {p.featured && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
            </div>
            <p className="mt-0.5 text-[13px] text-slate-500">
              {p.category} • {p.locality} {p.priceLabel ? `• ${p.priceLabel}` : ''}
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-[12.5px] text-slate-400">
              <Eye className="h-3.5 w-3.5" /> {p.views} views
            </p>
            {p.status === 'rejected' && p.rejectionReason && (
              <p className="mt-1 text-[12.5px] text-red-600">Reason: {p.rejectionReason}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PromoteButton id={p.id} premium={p.premium} featured={p.featured} onDone={load} />
            {p.status === 'active' && (
              <Link
                href={`/property/${p.slug}`}
                className="rounded-lg border border-slate-300 px-3 py-2 text-[13px] font-semibold text-slate-700 transition hover:border-slate-400"
              >
                View
              </Link>
            )}
            <button
              onClick={() => remove(p.id)}
              aria-label="Delete"
              className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-red-300 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function Leads() {
  const [data, setData] = useState(null)
  useEffect(() => {
    fetch('/api/me/leads')
      .then((r) => r.json())
      .then((d) => setData(d.received ? d : { received: [], sent: [] }))
      .catch(() => setData({ received: [], sent: [] }))
  }, [])

  if (!data) return <Center><Loader2 className="h-7 w-7 animate-spin text-slate-400" /></Center>

  return (
    <div className="space-y-8">
      <LeadGroup title="Leads on your properties" leads={data.received} empty="No leads yet — leads from buyers appear here." />
      <LeadGroup title="Your enquiries" leads={data.sent} empty="You haven’t sent any enquiries yet." />
    </div>
  )
}

function LeadGroup({ title, leads, empty }) {
  return (
    <div>
      <h3 className="text-[15px] font-bold text-navy-800">{title}</h3>
      {leads.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-[13.5px] text-slate-500">
          {empty}
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {leads.map((l) => (
            <div key={l.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[14px] font-bold text-navy-800">{l.name}</span>
                <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand">
                  {l.type}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-slate-500">
                <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> +91 {l.phone}</span>
                {l.email && <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {l.email}</span>}
                {l.propertyTitle && <span>• {l.propertyTitle}</span>}
                {l.serviceKey && <span>• {l.serviceKey}</span>}
                {l.refId && <span className="font-semibold text-slate-400">{l.refId}</span>}
              </div>
              {l.message && <p className="mt-2 text-[13px] text-slate-600">{l.message}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---- shared bits ---- */
function Tab({ active, onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13.5px] font-semibold transition ${
        active ? 'bg-navy-800 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300'
      }`}
    >
      <Icon className="h-4 w-4" /> {children}
    </button>
  )
}
function Center({ children }) {
  return <div className="flex justify-center py-24">{children}</div>
}
function Empty({ icon: Icon, title, body, children }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
      <Icon className="h-9 w-9 text-slate-300" />
      <h2 className="mt-3 text-[17px] font-bold text-navy-800">{title}</h2>
      <p className="mt-1.5 max-w-xs text-[13.5px] text-slate-500">{body}</p>
      {children}
    </div>
  )
}
function Gate({ onLogin }) {
  return (
    <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
      <LogIn className="h-9 w-9 text-slate-300" />
      <h2 className="mt-3 text-[18px] font-bold text-navy-800">Login to view your dashboard</h2>
      <button onClick={onLogin} className="mt-6 rounded-full bg-brand px-6 py-3 text-[14px] font-semibold text-white hover:bg-brand-700">
        Login
      </button>
    </div>
  )
}
