'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  Loader2, Route, Download, AlertTriangle, ChevronRight, ChevronDown, ArrowRight, Inbox,
} from 'lucide-react'
import { useAdminStats } from '../layout'
import RequestDrawer from '@/components/admin/RequestDrawer'

const TABS = [
  { key: 'new', label: 'Needs Routing' },
  { key: 'contacted', label: 'Routed to Partners' },
  { key: 'closed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

const SERVICE_COLORS = [
  'bg-amber-50 text-amber-700', 'bg-emerald-50 text-emerald-700', 'bg-blue-50 text-blue-700',
  'bg-rose-50 text-rose-600', 'bg-purple-50 text-purple-700', 'bg-cyan-50 text-cyan-700',
]
const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-600', 'bg-purple-100 text-purple-700',
]

const FOUR_HOURS = 4 * 3600 * 1000

export default function ServiceQueuePage() {
  const stats = useAdminStats()
  const [items, setItems] = useState(null)
  const [tab, setTab] = useState('new')
  const [service, setService] = useState('all')
  const [locality, setLocality] = useState('all')
  const [wait, setWait] = useState('all')
  const [contact, setContact] = useState('all')
  const [hasProp, setHasProp] = useState(false)
  const [sort, setSort] = useState('newest')
  const [selected, setSelected] = useState(() => new Set())
  const [busy, setBusy] = useState(false)
  const [detailId, setDetailId] = useState(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/leads')
    const data = await res.json()
    setItems(res.ok ? data.items.filter((l) => l.category === 'service') : [])
  }, [])
  useEffect(() => { load() }, [load])

  const all = items || []
  const inTab = useMemo(() => all.filter((l) => l.status === tab), [all, tab])

  const serviceChips = useMemo(() => {
    const counts = {}
    for (const l of inTab) {
      const k = l.serviceKey || 'general'
      counts[k] = (counts[k] || 0) + 1
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [inTab])

  const localities = useMemo(
    () => [...new Set(all.map((l) => l.locality).filter(Boolean))].sort(),
    [all],
  )

  const rows = useMemo(() => {
    let r = inTab.filter((l) => {
      if (service !== 'all' && (l.serviceKey || 'general') !== service) return false
      if (locality !== 'all' && l.locality !== locality) return false
      if (contact !== 'all' && l.preferredTime !== contact) return false
      if (hasProp && !l.hasProperty) return false
      if (wait !== 'all') {
        const ms = Date.now() - new Date(l.createdAt).getTime()
        if (wait === 'lt1' && ms >= 3600e3) return false
        if (wait === '1to4' && (ms < 3600e3 || ms >= FOUR_HOURS)) return false
        if (wait === 'gt4' && ms < FOUR_HOURS) return false
      }
      return true
    })
    r = [...r].sort((a, b) => {
      const ta = new Date(a.createdAt).getTime()
      const tb = new Date(b.createdAt).getTime()
      return sort === 'oldest' || sort === 'longest' ? ta - tb : tb - ta
    })
    return r
  }, [inTab, service, locality, contact, hasProp, wait, sort])

  useEffect(() => { setSelected(new Set()) }, [tab, service, locality, wait, contact, hasProp])

  const delayed = rows.filter((l) => Date.now() - new Date(l.createdAt).getTime() >= FOUR_HOURS).length
  const pending = all.filter((l) => l.status === 'new').length
  const assignedToday = all.filter((l) => l.status !== 'new' && sameDay(l.updatedAt)).length
  const routedMs = all.filter((l) => l.status !== 'new').map((l) => new Date(l.updatedAt).getTime() - new Date(l.createdAt).getTime())
  const avgRouting = routedMs.length ? avgDur(routedMs) : null

  const route = async (ids) => {
    setBusy(true)
    setItems((prev) => prev.map((l) => (ids.includes(l.id) ? { ...l, status: 'contacted' } : l)))
    await Promise.all(
      ids.map((id) =>
        fetch(`/api/admin/leads/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'contacted' }),
        }),
      ),
    )
    setSelected(new Set())
    setBusy(false)
    stats?.refresh?.()
  }

  const toggleSel = (id) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  const allSelected = rows.length > 0 && rows.every((l) => selected.has(l.id))
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(rows.map((l) => l.id)))

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* breadcrumb */}
      <p className="flex items-center gap-1.5 text-[13px] text-slate-400">
        Enquiries <ChevronRight className="h-3.5 w-3.5" /> <span className="text-brand">Service</span>
      </p>

      {/* header */}
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-tight text-navy-900">Admin Routing Queue</h1>
          <p className="mt-1 text-[13.5px] text-slate-500">
            <span className="font-bold text-red-600">{pending} pending routing</span> · {assignedToday} assigned today · avg routing time {avgRouting || '—'}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => route([...selected])}
            disabled={selected.size === 0 || busy}
            className="inline-flex items-center gap-2 rounded-full bg-navy-800 px-4 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-navy-700 disabled:opacity-40"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Route className="h-4 w-4" />}
            Bulk Route{selected.size > 0 ? ` (${selected.size})` : ''}
          </button>
          <button
            onClick={() => exportCsv(rows)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-[13.5px] font-semibold text-navy-800 transition hover:border-slate-400"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* tabs */}
      <div className="mt-5 flex flex-wrap gap-6 border-b border-slate-200">
        {TABS.map((t) => {
          const count = all.filter((l) => l.status === t.key).length
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 pb-3 text-[14px] font-bold transition ${
                active ? 'border-b-2 border-navy-800 text-navy-800' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {t.label}
              <span className={`rounded-full px-2 py-0.5 text-[11px] ${active ? 'bg-navy-800 text-white' : 'bg-slate-200 text-slate-500'}`}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* service chips */}
      <div className="mt-4 flex flex-wrap gap-2.5">
        <Chip active={service === 'all'} onClick={() => setService('all')}>All ({inTab.length})</Chip>
        {serviceChips.map(([k, n]) => (
          <Chip key={k} active={service === k} onClick={() => setService(k)}>
            {titleCase(k)} ({n})
          </Chip>
        ))}
      </div>

      {/* filters */}
      <div className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <Select label="Locality" value={locality} onChange={setLocality} options={[['all', 'All Localities'], ...localities.map((l) => [l, l])]} />
        <Select label="Wait Time" value={wait} onChange={setWait} options={[['all', 'Any Duration'], ['lt1', '< 1 hour'], ['1to4', '1–4 hours'], ['gt4', '> 4 hours']]} />
        <Select label="Preferred Contact" value={contact} onChange={setContact} options={[['all', 'Anytime'], ['Morning', 'Morning'], ['Afternoon', 'Afternoon'], ['Evening', 'Evening']]} />
        <label className="flex items-center gap-2 text-[13px] font-medium text-slate-600">
          <input type="checkbox" checked={hasProp} onChange={(e) => setHasProp(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand" />
          Has Related Property
        </label>
        <div className="ml-auto">
          <Select label="Sort By" value={sort} onChange={setSort} options={[['newest', 'Newest'], ['oldest', 'Oldest'], ['longest', 'Longest wait']]} plain />
        </div>
      </div>

      {/* delay alert */}
      {delayed > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold text-red-700">{delayed} request{delayed === 1 ? '' : 's'} waiting more than 4 hours.</p>
            <p className="text-[13px] text-red-600">Route these immediately to maintain SLA.</p>
          </div>
          <button onClick={() => { setWait('gt4') }} className="text-[13.5px] font-bold text-red-700 underline">View All Delays</button>
        </div>
      )}

      {/* table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3.5"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand" /></th>
                <th className="px-3 py-3.5">Requester</th>
                <th className="px-3 py-3.5">Service Needed</th>
                <th className="px-3 py-3.5">Request Summary</th>
                <th className="px-3 py-3.5">Locality</th>
                <th className="px-3 py-3.5">Contact Time</th>
                <th className="px-3 py-3.5">Received</th>
                <th className="px-3 py-3.5">Wait Time</th>
                <th className="px-3 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!items ? (
                <tr><td colSpan={9}><div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-slate-400" /></div></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={9}>
                  <div className="flex flex-col items-center py-16 text-center">
                    <Inbox className="h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-[14px] font-medium text-slate-500">Nothing in this queue.</p>
                  </div>
                </td></tr>
              ) : (
                rows.map((l) => (
                  <Row
                    key={l.id}
                    l={l}
                    selected={selected.has(l.id)}
                    onSelect={() => toggleSel(l.id)}
                    onRoute={() => route([l.id])}
                    onOpen={() => setDetailId(l.id)}
                    routable={tab === 'new'}
                    busy={busy}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RequestDrawer id={detailId} onClose={() => setDetailId(null)} />
    </div>
  )
}

function Row({ l, selected, onSelect, onRoute, onOpen, routable, busy }) {
  const initials = (l.name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  const color = AVATAR_COLORS[hash(l.name) % AVATAR_COLORS.length]
  const svcColor = SERVICE_COLORS[hash(l.serviceKey || 'general') % SERVICE_COLORS.length]
  const w = waitInfo(l.createdAt)
  const sid = `SR-${String(l.refId || l.id).replace(/\D/g, '').slice(-4).padStart(4, '0')}`

  return (
    <tr onClick={onOpen} className="cursor-pointer align-middle hover:bg-slate-50/60">
      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
        <input type="checkbox" checked={selected} onChange={onSelect} className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand" />
      </td>
      <td className="px-3 py-4">
        <div className="flex items-center gap-3">
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-bold ${color}`}>{initials}</span>
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-navy-800">{l.name}</p>
            <p className="text-[11.5px] text-slate-400">ID: #{sid}</p>
          </div>
        </div>
      </td>
      <td className="px-3 py-4">
        <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${svcColor}`}>{titleCase(l.serviceKey || 'General')}</span>
      </td>
      <td className="max-w-[180px] truncate px-3 py-4 text-[13.5px] text-slate-600">{l.message || l.about?.primary || '—'}</td>
      <td className="px-3 py-4 text-[13.5px] font-medium text-navy-800">{l.locality || '—'}</td>
      <td className="px-3 py-4 text-[13.5px] text-slate-600">{l.preferredTime || 'Anytime'}</td>
      <td className="px-3 py-4 text-[13px] text-slate-500">{ago(l.createdAt)}</td>
      <td className="px-3 py-4">
        <div className="flex items-center gap-2">
          <span className={`text-[14px] font-bold ${w.color}`}>{w.label}</span>
          {w.priority && <span className="rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">Priority</span>}
        </div>
      </td>
      <td className="px-3 py-4 text-right">
        {routable ? (
          <button
            onClick={(e) => { e.stopPropagation(); onRoute() }}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full bg-navy-800 px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-navy-700 disabled:opacity-50"
          >
            Route <ArrowRight className="h-3.5 w-3.5" />
          </button>
        ) : (
          <span className="text-[12.5px] font-semibold capitalize text-slate-400">{l.status.replace('_', ' ')}</span>
        )}
      </td>
    </tr>
  )
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
        active ? 'bg-navy-800 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
      }`}
    >
      {children}
    </button>
  )
}

function Select({ label, value, onChange, options, plain }) {
  return (
    <div className="relative">
      {!plain && <p className="mb-0.5 text-[10.5px] font-bold uppercase tracking-wide text-slate-400">{label}</p>}
      <div className="relative inline-flex items-center rounded-lg pr-6 text-[13.5px] font-semibold text-navy-800">
        {plain && <span className="mr-1 text-slate-400">{label}:</span>}
        <span>{options.find(([v]) => v === value)?.[1]}</span>
        <ChevronDown className="pointer-events-none absolute right-1 h-4 w-4 text-slate-400" />
        <select value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0">
          {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
    </div>
  )
}

/* helpers */
function waitInfo(createdAt) {
  const ms = Date.now() - new Date(createdAt).getTime()
  const mins = Math.floor(ms / 60000)
  const priority = ms >= FOUR_HOURS
  const label = mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`
  const color = priority ? 'text-red-600' : mins >= 60 ? 'text-amber-600' : 'text-emerald-600'
  return { label, color, priority }
}
function ago(createdAt) {
  const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`
}
function sameDay(dt) {
  if (!dt) return false
  const d = new Date(dt)
  const n = new Date()
  return d.toDateString() === n.toDateString()
}
function avgDur(arr) {
  const mins = Math.round(arr.reduce((s, v) => s + v, 0) / arr.length / 60000)
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  return h < 48 ? `${h}h ${mins % 60}m` : `${Math.floor(h / 24)}d`
}
function titleCase(s = '') {
  return String(s).replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
function hash(s = '') {
  let h = 0
  for (let i = 0; i < String(s).length; i++) h = (h * 31 + String(s).charCodeAt(i)) >>> 0
  return h
}
function exportCsv(rows) {
  const header = ['Name', 'Phone', 'Service', 'Summary', 'Locality', 'Contact Time', 'Received', 'Status']
  const cell = (v) => {
    const s = String(v ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [header.join(',')].concat(
    rows.map((r) =>
      [r.name, r.phone, titleCase(r.serviceKey || 'General'), r.message || '', r.locality || '', r.preferredTime || '', new Date(r.createdAt).toISOString(), r.status].map(cell).join(','),
    ),
  )
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'service-requests.csv'
  a.click()
  URL.revokeObjectURL(url)
}
