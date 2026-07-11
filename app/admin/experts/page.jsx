'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, UserPlus, ChevronDown, ChevronLeft, ChevronRight, ArrowRight, Inbox } from 'lucide-react'
import { useAdminStats } from '../layout'

const TABS = [
  { key: 'new', label: 'Needs Assignment' },
  { key: 'contacted', label: 'Assigned' },
  { key: 'closed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]
const TYPE_COLORS = [
  'bg-amber-100 text-amber-700', 'bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-600', 'bg-purple-100 text-purple-700',
]
const AVATAR_COLORS = TYPE_COLORS
const FOUR_HOURS = 4 * 3600 * 1000
const PAGE_SIZE = 7

export default function ExpertRequestsQueue() {
  const stats = useAdminStats()
  const router = useRouter()
  const [items, setItems] = useState(null)
  const [tab, setTab] = useState('new')
  const [type, setType] = useState('all')
  const [locality, setLocality] = useState('all')
  const [wait, setWait] = useState('all')
  const [urgency, setUrgency] = useState('all')
  const [sort, setSort] = useState('newest')
  const [selected, setSelected] = useState(() => new Set())
  const [page, setPage] = useState(1)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/leads')
    const data = await res.json()
    setItems(res.ok ? data.items.filter((l) => l.category === 'expert') : [])
  }, [])
  useEffect(() => { load() }, [load])

  const all = items || []
  const inTab = useMemo(() => all.filter((l) => l.status === tab), [all, tab])
  const types = useMemo(() => [...new Set(all.map((l) => l.expertType).filter(Boolean))].sort(), [all])
  const localities = useMemo(() => [...new Set(all.map((l) => l.locality).filter(Boolean))].sort(), [all])

  const rows = useMemo(() => {
    let r = inTab.filter((l) => {
      if (type !== 'all' && l.expertType !== type) return false
      if (locality !== 'all' && l.locality !== locality) return false
      const ms = Date.now() - new Date(l.createdAt).getTime()
      if (wait === 'lt1' && ms >= 3600e3) return false
      if (wait === '1to4' && (ms < 3600e3 || ms >= FOUR_HOURS)) return false
      if (wait === 'gt4' && ms < FOUR_HOURS) return false
      if (urgency === 'priority' && ms < FOUR_HOURS) return false
      if (urgency === 'normal' && ms >= FOUR_HOURS) return false
      return true
    })
    r = [...r].sort((a, b) => {
      const ta = new Date(a.createdAt).getTime(); const tb = new Date(b.createdAt).getTime()
      return sort === 'oldest' ? ta - tb : tb - ta
    })
    return r
  }, [inTab, type, locality, wait, urgency, sort])

  useEffect(() => { setPage(1); setSelected(new Set()) }, [tab, type, locality, wait, urgency])

  const unassigned = all.filter((l) => l.status === 'new').length
  const assignedToday = all.filter((l) => l.status !== 'new' && sameDay(l.updatedAt)).length
  const avgWait = avgMs(all.filter((l) => l.status === 'new').map((l) => Date.now() - new Date(l.createdAt).getTime()))
  const avgAssign = avgMs(all.filter((l) => l.status !== 'new').map((l) => new Date(l.updatedAt).getTime() - new Date(l.createdAt).getTime()))
  const settled = all.filter((l) => l.status !== 'new')
  const matchRate = settled.length ? Math.round((all.filter((l) => ['qualified', 'closed'].includes(l.status)).length / settled.length) * 100) : null
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Bulk-assign each selected request to its best-matching expert.
  const bulkAssign = async () => {
    if (selected.size === 0) return
    setBusy(true)
    const ids = [...selected]
    await Promise.all(ids.map(async (id) => {
      const l = all.find((x) => x.id === id)
      let body = { status: 'contacted' }
      try {
        const qs = new URLSearchParams({ category: l?.expertType || '', locality: l?.locality || '' })
        const res = await fetch(`/api/admin/experts-match?${qs}`)
        const data = await res.json()
        if (res.ok && data.items?.[0]) body = { assignedExpert: data.items[0].id }
      } catch { /* fall back to just marking assigned */ }
      await fetch(`/api/admin/leads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }))
    setItems((prev) => prev.map((l) => (ids.includes(l.id) ? { ...l, status: 'contacted' } : l)))
    setSelected(new Set()); setBusy(false); stats?.refresh?.()
  }

  const toggleSel = (id) => setSelected((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  const allSel = pageRows.length > 0 && pageRows.every((l) => selected.has(l.id))
  const toggleAll = () => setSelected(allSel ? new Set() : new Set(pageRows.map((l) => l.id)))

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[30px] font-extrabold tracking-tight text-navy-900">Queue Management</h1>
          <p className="mt-1 text-[14px] text-slate-500">{unassigned} waiting for assignment · avg wait time {avgWait || '—'}</p>
        </div>
        <button onClick={bulkAssign} disabled={selected.size === 0 || busy}
          className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-brand-700 disabled:opacity-40">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          Bulk Assign{selected.size > 0 ? ` (${selected.size})` : ''}
        </button>
      </div>

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Unassigned" value={items ? unassigned : null} />
        <Kpi label="Assigned Today" value={items ? assignedToday : null} />
        <Kpi label="Avg Assignment Time" value={items ? (avgAssign || '—') : null} />
        <Kpi label="Match Success Rate" value={items ? (matchRate != null ? `${matchRate}%` : '—') : null} valueCls="text-emerald-600" />
      </div>

      {/* tabs */}
      <div className="mt-6 flex flex-wrap gap-6 border-b border-slate-200">
        {TABS.map((t) => {
          const count = all.filter((l) => l.status === t.key).length
          const active = tab === t.key
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 pb-3 text-[15px] font-bold transition ${active ? 'border-b-2 border-navy-800 text-navy-800' : 'text-slate-400 hover:text-slate-600'}`}>
              {t.label}
              <span className={`rounded-full px-2 py-0.5 text-[11px] ${active ? 'bg-navy-800 text-white' : 'bg-slate-200 text-slate-500'}`}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* filters */}
      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <span className="text-[13px] font-bold text-slate-500">Filters:</span>
        <Dropdown label="Expert Type" value={type} onChange={setType} options={[['all', 'All'], ...types.map((t) => [t, titleCase(t)])]} />
        <Dropdown label="Locality" value={locality} onChange={setLocality} options={[['all', 'All'], ...localities.map((l) => [l, l])]} />
        <Dropdown label="Wait Time" value={wait} onChange={setWait} options={[['all', 'Any'], ['lt1', '< 1 hour'], ['1to4', '1–4 hours'], ['gt4', '> 4 hours']]} />
        <Dropdown label="Urgency" value={urgency} onChange={setUrgency} options={[['all', 'All'], ['priority', 'Priority'], ['normal', 'Normal']]} />
        <button onClick={() => { setType('all'); setLocality('all'); setWait('all'); setUrgency('all') }} className="text-[13.5px] font-semibold text-brand hover:underline">Clear All</button>
        <div className="ml-auto flex items-center gap-2 text-[13px] text-slate-500">
          Sort by:
          <Dropdown value={sort} onChange={setSort} options={[['newest', 'Newest First'], ['oldest', 'Oldest First']]} plain />
        </div>
      </div>

      {/* table */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3.5"><input type="checkbox" checked={allSel} onChange={toggleAll} className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand" /></th>
                <th className="px-3 py-3.5">Requester</th>
                <th className="px-3 py-3.5">Expert Needed</th>
                <th className="px-3 py-3.5">Property Context</th>
                <th className="px-3 py-3.5">Locality</th>
                <th className="px-3 py-3.5">Received</th>
                <th className="px-3 py-3.5">Wait Time</th>
                <th className="px-3 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!items ? (
                <tr><td colSpan={8}><div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-slate-400" /></div></td></tr>
              ) : pageRows.length === 0 ? (
                <tr><td colSpan={8}><div className="flex flex-col items-center py-16 text-center"><Inbox className="h-8 w-8 text-slate-300" /><p className="mt-2 text-[14px] font-medium text-slate-500">Nothing in this queue.</p></div></td></tr>
              ) : (
                pageRows.map((l, i) => (
                  <Row key={l.id} l={l} i={i} selected={selected.has(l.id)}
                    onSelect={() => toggleSel(l.id)}
                    onAssign={() => router.push(`/admin/experts/${l.id}`)}
                    routable={tab === 'new'} />
                ))
              )}
            </tbody>
          </table>
        </div>
        {items && rows.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/40 px-4 py-3">
            <span className="text-[13px] text-slate-500">
              Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, rows.length)} of {rows.length} requests
            </span>
            <div className="flex items-center gap-1.5">
              <PBtn disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></PBtn>
              {Array.from({ length: pageCount }, (_, i) => i + 1).slice(0, 5).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`h-8 min-w-8 rounded-full px-2 text-[13px] font-semibold ${p === page ? 'bg-navy-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>{p}</button>
              ))}
              <PBtn disabled={page === pageCount} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></PBtn>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ l, i, selected, onSelect, onAssign, routable }) {
  const initials = (l.name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  const color = AVATAR_COLORS[hash(l.name) % AVATAR_COLORS.length]
  const typeColor = TYPE_COLORS[hash(l.expertType || 'x') % TYPE_COLORS.length]
  const w = waitInfo(l.createdAt)
  return (
    <tr className="align-middle hover:bg-slate-50/60">
      <td className="px-4 py-4"><input type="checkbox" checked={selected} onChange={onSelect} className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand" /></td>
      <td className="px-3 py-4">
        <div className="flex items-center gap-3">
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-bold ${color}`}>{initials}</span>
          <p className="text-[14px] font-bold text-navy-800">{l.name}</p>
        </div>
      </td>
      <td className="px-3 py-4"><span className={`inline-block rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${typeColor}`}>{titleCase(l.expertType || 'General')}</span></td>
      <td className="max-w-[180px] px-3 py-4 text-[13.5px] text-slate-600">{l.message || l.propertyTitle || '—'}</td>
      <td className="px-3 py-4 text-[13.5px] text-slate-600">{l.locality || '—'}</td>
      <td className="px-3 py-4 text-[13px] text-slate-500">{ago(l.createdAt)}</td>
      <td className="px-3 py-4">
        <div className="flex items-center gap-2">
          <span className={`text-[13.5px] font-bold ${w.color}`}>{w.label}</span>
          {w.priority && <span className="rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">Priority</span>}
        </div>
      </td>
      <td className="px-3 py-4 text-right">
        <button onClick={onAssign} className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-brand-700">
          Assign Expert <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  )
}

function Kpi({ label, value, valueCls = 'text-navy-900' }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      {value == null ? <span className="mt-2 block h-8 w-16 animate-pulse rounded bg-slate-100" />
        : <p className={`mt-2 text-[30px] font-extrabold leading-none ${valueCls}`}>{value}</p>}
    </div>
  )
}

function Dropdown({ label, value, onChange, options, plain }) {
  const current = options.find(([v]) => v === value)?.[1]
  return (
    <div className={`relative inline-flex items-center gap-1 rounded-full py-2 pr-7 text-[13px] font-semibold text-navy-800 ${plain ? '' : 'border border-slate-200 pl-3.5'}`}>
      {plain ? (
        <span>{current}</span>
      ) : (
        <span>{label}{current && current !== 'All' && current !== 'Any' ? `: ${current}` : ''}</span>
      )}
      <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-400" />
      <select value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  )
}
function PBtn({ disabled, onClick, children }) {
  return <button onClick={onClick} disabled={disabled} className="grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30">{children}</button>
}

function waitInfo(createdAt) {
  const ms = Date.now() - new Date(createdAt).getTime()
  const mins = Math.floor(ms / 60000)
  const label = mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`
  const color = ms >= FOUR_HOURS ? 'text-red-600' : mins >= 60 ? 'text-amber-600' : 'text-slate-600'
  return { label, color, priority: ms >= FOUR_HOURS }
}
function ago(createdAt) {
  const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const h = Math.floor(mins / 60)
  return h < 24 ? `${h} hr${h === 1 ? '' : 's'} ago` : `${Math.floor(h / 24)}d ago`
}
function sameDay(dt) { if (!dt) return false; return new Date(dt).toDateString() === new Date().toDateString() }
function avgMs(arr) {
  if (!arr.length) return null
  const mins = Math.round(arr.reduce((s, v) => s + v, 0) / arr.length / 60000)
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  return h < 48 ? `${h}h ${mins % 60}m` : `${Math.floor(h / 24)}d`
}
function titleCase(s = '') { return String(s).replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) }
function hash(s = '') { let h = 0; for (let i = 0; i < String(s).length; i++) h = (h * 31 + String(s).charCodeAt(i)) >>> 0; return h }
