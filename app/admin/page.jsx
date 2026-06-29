'use client'

import { useEffect, useState, useCallback } from 'react'
import Navbar from '@/components/Navbar'
import SiteFooter from '@/components/property/SiteFooter'
import { useAuth } from '@/components/auth/AuthProvider'
import {
  Loader2, ShieldAlert, Check, X, BadgeCheck, Star, Clock, Inbox, ListChecks,
} from 'lucide-react'

const TABS = [
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'all', label: 'All listings', icon: ListChecks },
  { key: 'leads', label: 'Leads', icon: Inbox },
]

export default function AdminPage() {
  const { user, loading } = useAuth()
  const [tab, setTab] = useState('pending')
  const isAdmin = user?.roles?.includes('admin')

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <Navbar cta="brand" />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {loading ? (
          <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
        ) : !isAdmin ? (
          <Forbidden />
        ) : (
          <>
            <h1 className="text-[28px] font-extrabold tracking-tight text-navy-900 sm:text-[32px]">
              Admin console
            </h1>
            <p className="mt-1 text-[14px] text-slate-500">Moderate listings and manage leads.</p>

            <div className="mt-7 flex gap-2.5">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13.5px] font-semibold transition ${
                    tab === t.key ? 'bg-navy-800 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300'
                  }`}
                >
                  <t.icon className="h-4 w-4" /> {t.label}
                </button>
              ))}
            </div>

            <div className="mt-6">
              {tab === 'leads' ? <AdminLeads /> : <AdminProperties scope={tab} />}
            </div>
          </>
        )}
      </div>
      <SiteFooter />
    </main>
  )
}

function AdminProperties({ scope }) {
  const [items, setItems] = useState(null)
  const load = useCallback(async () => {
    setItems(null)
    const res = await fetch(`/api/admin/properties?status=${scope}`)
    const data = await res.json()
    setItems(res.ok ? data.items : [])
  }, [scope])
  useEffect(() => { load() }, [load])

  const patch = async (id, body) => {
    await fetch(`/api/admin/properties/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    load()
  }

  if (!items) return <Center />
  if (items.length === 0)
    return <Empty text={scope === 'pending' ? 'No listings awaiting review 🎉' : 'No listings yet.'} />

  return (
    <div className="space-y-4">
      {items.map((p) => (
        <div key={p.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <img src={p.img} alt={p.title} className="h-24 w-full rounded-xl object-cover sm:w-36" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[16px] font-bold text-navy-800">{p.title}</h3>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                {p.status}
              </span>
              {p.verified && <BadgeCheck className="h-4 w-4 text-emerald-500" />}
              {p.featured && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
            </div>
            <p className="mt-0.5 text-[13px] text-slate-500">
              {p.category} • {p.locality} {p.priceLabel ? `• ${p.priceLabel}` : ''}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {p.status !== 'active' && (
              <button onClick={() => patch(p.id, { status: 'active' })} className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-2 text-[13px] font-semibold text-white hover:bg-emerald-600">
                <Check className="h-4 w-4" /> Approve
              </button>
            )}
            {p.status !== 'rejected' && (
              <button
                onClick={() => {
                  const reason = prompt('Rejection reason (optional):') ?? ''
                  patch(p.id, { status: 'rejected', rejectionReason: reason })
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-[13px] font-semibold text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4" /> Reject
              </button>
            )}
            <Toggle on={p.verified} onClick={() => patch(p.id, { verified: !p.verified })}>Verified</Toggle>
            <Toggle on={p.featured} onClick={() => patch(p.id, { featured: !p.featured })}>Featured</Toggle>
          </div>
        </div>
      ))}
    </div>
  )
}

function AdminLeads() {
  const [items, setItems] = useState(null)
  const load = useCallback(async () => {
    const res = await fetch('/api/admin/leads')
    const data = await res.json()
    setItems(res.ok ? data.items : [])
  }, [])
  useEffect(() => { load() }, [load])

  const setStatus = async (id, status) => {
    setItems((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
    await fetch(`/api/admin/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  }

  if (!items) return <Center />
  if (items.length === 0) return <Empty text="No leads yet." />

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-[13px]">
        <thead className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-4 py-3">Ref</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Contact</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {items.map((l) => (
            <tr key={l.id} className="hover:bg-slate-50/60">
              <td className="px-4 py-3 font-mono text-[12px] text-slate-500">{l.refId}</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-bold uppercase text-brand">{l.type}</span>
              </td>
              <td className="px-4 py-3">
                <div className="font-semibold text-navy-800">{l.name}</div>
                <div className="text-[12px] text-slate-500">+91 {l.phone}{l.email ? ` · ${l.email}` : ''}</div>
              </td>
              <td className="px-4 py-3">
                <select
                  value={l.status}
                  onChange={(e) => setStatus(l.id, e.target.value)}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-[12.5px] font-semibold text-slate-700 focus:border-brand focus:outline-none"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="closed">Closed</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Toggle({ on, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-[12.5px] font-semibold transition ${
        on ? 'border-brand bg-brand/5 text-brand' : 'border-slate-200 text-slate-500 hover:border-slate-300'
      }`}
    >
      {children}
    </button>
  )
}
function Center() {
  return <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-slate-400" /></div>
}
function Empty({ text }) {
  return <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-16 text-center text-[14px] text-slate-500">{text}</p>
}
function Forbidden() {
  return (
    <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
      <ShieldAlert className="h-9 w-9 text-slate-300" />
      <h2 className="mt-3 text-[18px] font-bold text-navy-800">Admins only</h2>
      <p className="mt-1.5 max-w-xs text-[14px] text-slate-500">
        You need an admin account to view this page.
      </p>
    </div>
  )
}
