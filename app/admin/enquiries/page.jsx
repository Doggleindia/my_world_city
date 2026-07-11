'use client'

import { Suspense, useEffect, useMemo, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Loader2, ChevronDown, ChevronRight, ChevronLeft, Calendar, UserPlus,
  Globe, AlertCircle, Inbox,
} from 'lucide-react'
import { useAdminStats } from '../layout'

const CAT_META = {
  solution: { label: 'SOLUTION', cls: 'bg-emerald-50 text-emerald-600' },
  property: { label: 'PROPERTY', cls: 'bg-blue-50 text-blue-600' },
  service: { label: 'SERVICE', cls: 'bg-amber-50 text-amber-700' },
  expert: { label: 'EXPERT', cls: 'bg-rose-50 text-rose-500' },
}

const STATUS_META = {
  new: { label: 'New', dot: 'bg-navy-800', cls: 'bg-slate-100 text-navy-800' },
  contacted: { label: 'Contacted', dot: 'bg-amber-500', cls: 'bg-amber-50 text-amber-600' },
  site_visit: { label: 'Site Visit', dot: 'bg-purple-500', cls: 'bg-purple-50 text-purple-600' },
  qualified: { label: 'Qualified', dot: 'bg-emerald-500', cls: 'bg-emerald-50 text-emerald-600' },
  closed: { label: 'Closed', dot: 'bg-slate-400', cls: 'bg-slate-100 text-slate-500' },
}
const STATUS_ORDER = ['new', 'contacted', 'site_visit', 'qualified', 'closed']

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-600', 'bg-purple-100 text-purple-700', 'bg-navy-800 text-white',
]
const PAGE_SIZE = 10

const CAT_TITLE = {
  solution: 'Solution Enquiries',
  property: 'Property Enquiries',
  service: 'Service Enquiries',
  general: 'General Enquiries',
}

export default function AdminEnquiriesPage() {
  return (
    <Suspense fallback={<Center />}>
      <AdminEnquiries />
    </Suspense>
  )
}

function AdminEnquiries() {
  const params = useSearchParams()
  const cat = params.get('cat')
  const stats = useAdminStats()

  const [items, setItems] = useState(null)
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState('all')
  const [range, setRange] = useState('7d')
  const [page, setPage] = useState(1)

  const [error, setError] = useState('')
  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/leads')
      const data = await res.json()
      setItems(res.ok ? data.items : [])
      setTotal(res.ok ? data.total : 0)
      setError(res.ok ? '' : (data.error || 'Failed to load'))
    } catch {
      setItems([]); setError('Could not reach the server.')
    }
  }, [])
  useEffect(() => { load() }, [load])

  const setLeadStatus = async (id, next) => {
    setItems((prev) => prev.map((l) => (l.id === id ? { ...l, status: next } : l)))
    await fetch(`/api/admin/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    stats?.refresh?.()
  }

  const all = items || []

  // Our lead taxonomy has no distinct "general" bucket — plain enquiries fall
  // under "solution", so the General nav item aliases to it.
  const effCat = cat === 'general' ? 'solution' : cat

  // Client-side filtering (status + date + sidebar category).
  const filtered = useMemo(() => {
    const now = Date.now()
    const cutoff = range === 'today' ? startOfDay() : range === '30d' ? now - 30 * 864e5 : range === '7d' ? now - 7 * 864e5 : 0
    return all.filter((l) => {
      if (effCat && l.category !== effCat) return false
      if (status !== 'all' && l.status !== status) return false
      if (cutoff && new Date(l.createdAt).getTime() < cutoff) return false
      return true
    })
  }, [all, effCat, status, range])

  useEffect(() => { setPage(1) }, [status, range, cat])

  // KPIs scope to the current category (or everything on All Enquiries).
  const base = useMemo(() => (effCat ? all.filter((l) => l.category === effCat) : all), [all, effCat])
  const kpis = useMemo(() => ({
    newToday: base.filter((l) => new Date(l.createdAt).getTime() >= startOfDay()).length,
    unassigned: base.filter((l) => l.status === 'new').length,
    assigned: base.filter((l) => l.status !== 'new').length,
    solution: all.filter((l) => l.category === 'solution').length,
    property: all.filter((l) => l.category === 'property').length,
  }), [all, base])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const clearFilters = () => { setStatus('all'); setRange('all') }

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* Breadcrumb / title */}
      <div>
        <h1 className="text-[24px] font-extrabold tracking-tight text-navy-900">
          {cat ? CAT_TITLE[cat] || 'Enquiries' : 'All Enquiries'}
        </h1>
        <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-slate-400">
          Enquiries <ChevronRight className="h-3.5 w-3.5" /> <span className="text-brand">Overview</span>
        </p>
      </div>

      {/* KPI cards */}
      {cat ? (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Kpi label="New Today" value={items ? kpis.newToday : null} sub="+12%" subCls="text-emerald-600" />
          <Kpi label="Assigned" value={items ? kpis.assigned : null} icon={kpis.assigned > 0 ? AlertCircle : null} iconCls="text-emerald-600" valueCls="text-emerald-600" />
          <Kpi label="Unassigned" value={items ? kpis.unassigned : null} icon={kpis.unassigned > 0 ? AlertCircle : null} valueCls="text-red-600" />
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          <Kpi label="New Today" value={items ? kpis.newToday : null} sub="+12%" subCls="text-emerald-600" />
          <Kpi label="Unassigned" value={items ? kpis.unassigned : null} icon={kpis.unassigned > 0 ? AlertCircle : null} valueCls="text-red-600" />
          <Kpi label="Solution Enquiries" value={items ? kpis.solution : null} />
          <Kpi label="Property Enquiries" value={items ? kpis.property : null} />
          <Kpi label="Avg Response" value="—" sub="soon" subCls="text-slate-400" />
        </div>
      )}

      {/* Active tab */}
      <div className="mt-6 border-b border-slate-200">
        <span className="inline-block border-b-2 border-brand pb-3 text-[15px] font-bold text-navy-800">
          {cat ? CAT_TITLE[cat] || 'Enquiries' : 'All Enquiries'}
        </span>
      </div>

      {/* Filter bar */}
      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <Dropdown label="Status" value={status} onChange={setStatus} options={[['all', 'All'], ...STATUS_ORDER.map((s) => [s, STATUS_META[s].label])]} />
        <Dropdown label="Date" value={range} onChange={setRange} options={[['today', 'Today'], ['7d', 'Last 7 Days'], ['30d', 'Last 30 Days'], ['all', 'All time']]} icon={Calendar} />
        <button onClick={clearFilters} className="text-[13.5px] font-semibold text-brand hover:underline">
          Clear Filters
        </button>
        <span className="ml-auto text-[13px] text-slate-500">
          Showing <span className="font-bold text-navy-800">{filtered.length}</span> of {(effCat ? base.length : total).toLocaleString()}
        </span>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3.5">Contact Name</th>
                {!cat && <th className="px-3 py-3.5">Type</th>}
                <th className="px-3 py-3.5">About</th>
                <th className="px-3 py-3.5">Locality</th>
                <th className="px-3 py-3.5">Received</th>
                <th className="px-3 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!items ? (
                <tr><td colSpan={cat ? 5 : 6}><Center /></td></tr>
              ) : pageItems.length === 0 ? (
                <tr><td colSpan={cat ? 5 : 6}>
                  <div className="flex flex-col items-center py-16 text-center">
                    <Inbox className={`h-8 w-8 ${error ? 'text-red-300' : 'text-slate-300'}`} />
                    <p className={`mt-2 text-[14px] font-medium ${error ? 'text-red-600' : 'text-slate-500'}`}>{error || 'No enquiries match these filters.'}</p>
                  </div>
                </td></tr>
              ) : (
                pageItems.map((l) => <Row key={l.id} l={l} showType={!cat} onStatus={setLeadStatus} />)
              )}
            </tbody>
          </table>
        </div>

        {items && pageItems.length > 0 && (
          <Pager page={page} pageCount={pageCount} onPage={setPage} />
        )}
      </div>
    </div>
  )
}

function Row({ l, showType, onStatus }) {
  const cat = CAT_META[l.category] || { label: l.type.toUpperCase(), cls: 'bg-slate-100 text-slate-600' }
  const rec = received(l.createdAt)
  const initials = (l.name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  const color = AVATAR_COLORS[hash(l.name) % AVATAR_COLORS.length]

  return (
    <tr className="align-middle hover:bg-slate-50/60">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-bold ${color}`}>{initials}</span>
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-navy-800">{l.name}</p>
            <p className="text-[12px] text-slate-400">+91 {l.phone}</p>
          </div>
        </div>
      </td>
      {showType && (
        <td className="px-3 py-4">
          <span className={`inline-block rounded-full px-2.5 py-1 text-[10.5px] font-bold tracking-wide ${cat.cls}`}>{cat.label}</span>
        </td>
      )}
      <td className="px-3 py-4">
        <p className="text-[13.5px] font-semibold text-navy-800">{l.about.primary}</p>
        {l.about.secondary && <p className="text-[12px] text-slate-400">{l.about.secondary}</p>}
      </td>
      <td className="px-3 py-4 text-[13.5px] text-slate-600">{l.locality || '—'}</td>
      <td className="px-3 py-4">
        <p className="text-[13px] font-semibold text-navy-800">{rec.time}</p>
        <p className="text-[12px] text-slate-400">{rec.day}</p>
      </td>
      <td className="px-3 py-4"><StatusPill status={l.status} onChange={(s) => onStatus(l.id, s)} /></td>
    </tr>
  )
}

function StatusPill({ status, onChange }) {
  const meta = STATUS_META[status] || STATUS_META.new
  return (
    <div className={`relative inline-flex items-center gap-1.5 rounded-full py-1 pl-2.5 pr-6 text-[11px] font-bold uppercase tracking-wide ${meta.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
      <ChevronDown className="pointer-events-none absolute right-2 h-3 w-3 opacity-60" />
      <select
        value={status}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label="Change status"
      >
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s}>{STATUS_META[s].label}</option>
        ))}
      </select>
    </div>
  )
}

function Kpi({ label, value, sub, subCls = 'text-slate-400', valueCls = 'text-navy-900', icon: Icon, iconCls = 'text-red-500' }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[12.5px] font-medium text-slate-500">{label}</p>
      <div className="mt-2 flex items-center gap-1.5">
        {value == null ? (
          <span className="h-6 w-12 animate-pulse rounded bg-slate-100" />
        ) : (
          <span className={`text-[22px] font-extrabold leading-none ${valueCls}`}>{value}</span>
        )}
        {Icon && <Icon className={`h-4 w-4 ${iconCls}`} />}
        {sub && value != null && <span className={`text-[12px] font-semibold ${subCls}`}>{sub}</span>}
      </div>
    </div>
  )
}

function Dropdown({ label, value, onChange, options, icon: Icon }) {
  return (
    <div className="relative inline-flex items-center gap-1.5 rounded-full border border-slate-200 py-2 pl-3.5 pr-8 text-[13px] font-semibold text-slate-600">
      {Icon && <Icon className="h-3.5 w-3.5 text-slate-400" />}
      <span>{label}: {options.find(([v]) => v === value)?.[1] ?? 'All'}</span>
      <ChevronDown className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-slate-400" />
      <select value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  )
}

function FakePill({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 py-2 pl-3.5 pr-3 text-[13px] font-semibold text-slate-400" title="Not tracked yet">
      {Icon && <Icon className="h-3.5 w-3.5" />} {label}
    </span>
  )
}

function Pager({ page, pageCount, onPage }) {
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).slice(
    Math.max(0, Math.min(page - 3, pageCount - 5)),
    Math.max(5, Math.min(page + 2, pageCount)),
  )
  return (
    <div className="flex items-center justify-between gap-1.5 border-t border-slate-100 bg-slate-50/40 px-4 py-3">
      <span className="text-[13px] font-medium text-slate-500">Page {page} of {pageCount}</span>
      <div className="flex items-center gap-1.5">
      <PagerBtn disabled={page === 1} onClick={() => onPage(page - 1)}><ChevronLeft className="h-4 w-4" /></PagerBtn>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={`h-8 min-w-8 rounded-lg px-2 text-[13px] font-semibold transition ${
            p === page ? 'bg-navy-800 text-white' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          {p}
        </button>
      ))}
      <PagerBtn disabled={page === pageCount} onClick={() => onPage(page + 1)}><ChevronRight className="h-4 w-4" /></PagerBtn>
      </div>
    </div>
  )
}
function PagerBtn({ disabled, onClick, children }) {
  return (
    <button onClick={onClick} disabled={disabled} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:opacity-30">
      {children}
    </button>
  )
}

function Center() {
  return <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-slate-400" /></div>
}

/* helpers */
function startOfDay() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}
function received(dt) {
  const d = new Date(dt)
  const now = new Date()
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const y = new Date(now)
  y.setDate(now.getDate() - 1)
  const day = d.toDateString() === now.toDateString() ? 'Today'
    : d.toDateString() === y.toDateString() ? 'Yesterday'
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return { time, day }
}
function hash(s = '') {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}
