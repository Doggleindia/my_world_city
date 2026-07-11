'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, Download, Plus, ChevronDown, ChevronLeft, ChevronRight, Loader2, Building2,
} from 'lucide-react'

const STATUSES = [['all', 'All'], ['live', 'Live'], ['pending', 'Pending'], ['rejected', 'Rejected']]
const TYPES = ['Residential', 'Commercial', 'Industrial', 'Farm & Agri']

const STATUS_DOT = {
  active: ['Live', 'text-emerald-600', 'bg-emerald-500'],
  pending: ['Pending', 'text-amber-600', 'bg-amber-500'],
  rejected: ['Rejected', 'text-red-600', 'bg-red-500'],
  draft: ['Draft', 'text-slate-500', 'bg-slate-400'],
  sold: ['Sold', 'text-blue-600', 'bg-blue-500'],
}
const TYPE_BADGE = {
  Residential: 'bg-blue-100 text-blue-700',
  Commercial: 'bg-emerald-100 text-emerald-700',
  Industrial: 'bg-amber-100 text-amber-700',
  'Farm & Agri': 'bg-lime-100 text-lime-700',
}
const PRICE_RANGES = [['', 'Any price'], ['a', 'Under ₹50L'], ['b', '₹50L – ₹1Cr'], ['c', '₹1Cr – ₹3Cr'], ['d', '₹3Cr+']]
const PRICE_BOUNDS = { a: [0, 5000000], b: [5000000, 10000000], c: [10000000, 30000000], d: [30000000, 0] }

export default function AdminProperties() {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('')
  const [verified, setVerified] = useState(false)
  const [featured, setFeatured] = useState(false)
  const [locality, setLocality] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(() => new Set())
  const [bulking, setBulking] = useState(false)

  const load = useCallback(async () => {
    const qs = new URLSearchParams({ status, type, locality, q, sort, page: String(page), limit: '12' })
    if (verified) qs.set('verified', 'true')
    if (featured) qs.set('featured', 'true')
    const [min, max] = PRICE_BOUNDS[priceRange] || []
    if (min) qs.set('minPrice', String(min))
    if (max) qs.set('maxPrice', String(max))
    const res = await fetch(`/api/admin/properties?${qs}`)
    const json = await res.json()
    setData(res.ok ? json : { items: [], counts: {}, resultTotal: 0, pageCount: 1, localities: [] })
  }, [status, type, locality, priceRange, q, sort, page, verified, featured])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1); setSelected(new Set()) }, [status, type, locality, priceRange, q, sort, verified, featured])

  const items = data?.items || []
  const counts = data?.counts || {}
  const pageCount = data?.pageCount || 1

  const toggleSel = (id) => setSelected((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  const allSel = items.length > 0 && items.every((i) => selected.has(i.id))
  const toggleAll = () => setSelected(allSel ? new Set() : new Set(items.map((i) => i.id)))

  const bulkPatch = async (body) => {
    if (selected.size === 0) return
    setBulking(true)
    await Promise.all([...selected].map((id) => fetch(`/api/admin/properties/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })))
    setSelected(new Set()); setBulking(false); load()
  }
  const bulkDelete = async () => {
    if (selected.size === 0 || !confirm(`Delete ${selected.size} propert${selected.size === 1 ? 'y' : 'ies'}?`)) return
    setBulking(true)
    await Promise.all([...selected].map((id) => fetch(`/api/admin/properties/${id}`, { method: 'DELETE' })))
    setSelected(new Set()); setBulking(false); load()
  }

  const exportCsv = () => {
    const header = ['Code', 'Title', 'Owner', 'Type', 'Locality', 'Price', 'Status', 'Views']
    const cell = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s }
    const lines = [header.join(',')].concat(items.map((i) => [i.code, i.title, i.owner, i.category, i.locality, i.priceLabel || i.price || '', i.flagged ? 'Flagged' : i.status, i.views].map(cell).join(',')))
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'properties.csv'; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-extrabold tracking-tight text-navy-900">All Properties</h1>
          <p className="mt-1 text-[14px] text-slate-500">
            {(counts.total ?? 0).toLocaleString()} total · {counts.pending ?? 0} pending · {counts.flagged ?? 0} flagged
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-[13.5px] font-semibold text-navy-800 hover:border-slate-400">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button onClick={() => router.push('/admin/properties/new')} className="inline-flex items-center gap-2 rounded-full bg-navy-800 px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-navy-700">
            <Plus className="h-4 w-4" /> Add Property
          </button>
        </div>
      </div>

      {/* filter card */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by property name, ID, owner…"
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-[13.5px] focus:border-brand focus:bg-white focus:outline-none" />
          </div>
          <Select value={locality} onChange={setLocality} options={[['', 'All localities'], ...(data?.localities || []).map((l) => [l, l])]} />
          <Select value={priceRange} onChange={setPriceRange} options={PRICE_RANGES} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2.5">
          <span className="text-[12px] font-bold uppercase tracking-wide text-slate-400">Status:</span>
          {STATUSES.map(([v, l]) => (
            <Chip key={v} active={status === v} onClick={() => setStatus(v)}>{l}</Chip>
          ))}
          <span className="ml-2 text-[12px] font-bold uppercase tracking-wide text-slate-400">Type:</span>
          {TYPES.map((t) => (
            <Chip key={t} active={type === t} onClick={() => setType(type === t ? '' : t)}>{t}</Chip>
          ))}
          <label className="ml-2 flex items-center gap-2 text-[13px] font-medium text-slate-600">
            <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand" /> Verified Only
          </label>
          <label className="flex items-center gap-2 text-[13px] font-medium text-slate-600">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand" /> Featured Only
          </label>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-[13px] text-slate-500">Showing {(data?.resultTotal ?? 0).toLocaleString()} results found</span>
          <div className="flex items-center gap-3">
            <button onClick={() => { setStatus('all'); setType(''); setLocality(''); setPriceRange(''); setVerified(false); setFeatured(false); setQ('') }} className="text-[13.5px] font-bold text-brand hover:underline">Clear all</button>
            <span className="text-[13px] text-slate-500">Sort by:</span>
            <Select value={sort} onChange={setSort} options={[['newest', 'Newest First'], ['price_asc', 'Price: Low'], ['price_desc', 'Price: High'], ['popular', 'Most Viewed']]} plain />
          </div>
        </div>
      </div>

      {/* bulk action bar */}
      {selected.size > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3">
          <span className="text-[13.5px] font-bold text-navy-800">{selected.size} selected</span>
          <button onClick={() => bulkPatch({ status: 'active' })} disabled={bulking} className="rounded-full bg-emerald-500 px-3.5 py-1.5 text-[12.5px] font-semibold text-white hover:bg-emerald-600 disabled:opacity-50">Approve / Publish</button>
          <button onClick={() => bulkPatch({ verified: true })} disabled={bulking} className="rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-[12.5px] font-semibold text-navy-800 hover:border-brand disabled:opacity-50">Verify</button>
          <button onClick={() => bulkPatch({ featured: true })} disabled={bulking} className="rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-[12.5px] font-semibold text-navy-800 hover:border-brand disabled:opacity-50">Feature</button>
          <button onClick={() => bulkPatch({ flagged: true })} disabled={bulking} className="rounded-full border border-amber-300 bg-white px-3.5 py-1.5 text-[12.5px] font-semibold text-amber-600 hover:bg-amber-50 disabled:opacity-50">Flag</button>
          <button onClick={bulkDelete} disabled={bulking} className="rounded-full border border-red-300 bg-white px-3.5 py-1.5 text-[12.5px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">Delete</button>
          {bulking && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          <button onClick={() => setSelected(new Set())} className="ml-auto text-[12.5px] font-semibold text-slate-500 hover:text-navy-800">Clear selection</button>
        </div>
      )}

      {/* table */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3.5"><input type="checkbox" checked={allSel} onChange={toggleAll} className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand" /></th>
                <th className="px-3 py-3.5">Property</th>
                <th className="px-3 py-3.5">ID / Owner</th>
                <th className="px-3 py-3.5">Type</th>
                <th className="px-3 py-3.5">Locality</th>
                <th className="px-3 py-3.5">Price</th>
                <th className="px-3 py-3.5">Status</th>
                <th className="px-3 py-3.5">Engagement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!data ? (
                <tr><td colSpan={8}><div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-slate-400" /></div></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={8}><div className="flex flex-col items-center py-16 text-center"><Building2 className="h-8 w-8 text-slate-300" /><p className="mt-2 text-[14px] font-medium text-slate-500">No properties match.</p></div></td></tr>
              ) : (
                items.map((i) => {
                  const [label, textCls, dotCls] = i.flagged ? ['Flagged', 'text-red-600', 'bg-red-500'] : (STATUS_DOT[i.status] || ['—', 'text-slate-500', 'bg-slate-400'])
                  const sel = selected.has(i.id)
                  return (
                    <tr key={i.id} onClick={() => router.push(`/admin/properties/${i.id}`)} className={`cursor-pointer align-middle transition ${sel ? 'bg-brand/5' : 'hover:bg-slate-50/60'}`}>
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={sel} onChange={() => toggleSel(i.id)} className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand" />
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          {i.img ? <img src={i.img} alt="" className="h-11 w-14 rounded-lg object-cover" /> : <div className="grid h-11 w-14 place-items-center rounded-lg bg-slate-100"><Building2 className="h-5 w-5 text-slate-300" /></div>}
                          <div className="min-w-0">
                            <p className="truncate text-[14px] font-bold text-navy-800">{i.title}</p>
                            <p className="text-[12px] text-slate-400">{ago(i.createdAt)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <p className="text-[13px] font-bold text-brand">{i.code}</p>
                        <p className="text-[12.5px] text-slate-500">{i.owner}</p>
                      </td>
                      <td className="px-3 py-4"><span className={`inline-block rounded px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide ${TYPE_BADGE[i.category] || 'bg-slate-100 text-slate-600'}`}>{i.category}</span></td>
                      <td className="px-3 py-4 text-[13.5px] text-slate-600">{i.locality}</td>
                      <td className="px-3 py-4 text-[14px] font-bold text-navy-900">{i.priceLabel || (i.price ? `₹${i.price.toLocaleString()}` : '—')}</td>
                      <td className="px-3 py-4"><span className={`inline-flex items-center gap-1.5 text-[13px] font-semibold ${textCls}`}><span className={`h-2 w-2 rounded-full ${dotCls}`} />{label}</span></td>
                      <td className="px-3 py-4 text-[13.5px] text-slate-500">{i.views.toLocaleString()} views</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {data && items.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/40 px-4 py-3">
            <span className="text-[13px] text-slate-500">Showing {items.length} of {(data.resultTotal ?? 0).toLocaleString()} properties</span>
            <div className="flex items-center gap-1.5">
              <PBtn disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></PBtn>
              {pageWindow(page, pageCount).map((p, idx) => p === '…'
                ? <span key={idx} className="px-1 text-slate-400">…</span>
                : <button key={idx} onClick={() => setPage(p)} className={`h-8 min-w-8 rounded-lg px-2 text-[13px] font-semibold ${p === page ? 'bg-navy-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>{p}</button>)}
              <PBtn disabled={page === pageCount} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></PBtn>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Chip({ active, onClick, children }) {
  return <button onClick={onClick} className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition ${active ? 'bg-navy-800 text-white' : 'border border-slate-200 text-slate-600 hover:border-slate-300'}`}>{children}</button>
}
function Select({ value, onChange, options, plain, disabledHint }) {
  const current = options.find(([v]) => v === value)?.[1] ?? options[0][1]
  return (
    <div className={`relative inline-flex items-center rounded-full pr-8 text-[13px] font-semibold text-navy-800 ${plain ? '' : 'border border-slate-200 py-2.5 pl-4'} ${disabledHint ? 'text-slate-400' : ''}`}>
      <span>{current}</span>
      <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-slate-400" />
      {!disabledHint && <select value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0">{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>}
    </div>
  )
}
function PBtn({ disabled, onClick, children }) {
  return <button onClick={onClick} disabled={disabled} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30">{children}</button>
}
function pageWindow(page, count) {
  if (count <= 5) return Array.from({ length: count }, (_, i) => i + 1)
  const out = [1]
  if (page > 3) out.push('…')
  for (let p = Math.max(2, page - 1); p <= Math.min(count - 1, page + 1); p++) out.push(p)
  if (page < count - 2) out.push('…')
  out.push(count)
  return out
}
function ago(dt) {
  const mins = Math.floor((Date.now() - new Date(dt).getTime()) / 60000)
  if (mins < 60) return `${mins} min ago`
  const h = Math.floor(mins / 60)
  if (h < 24) return `${h} hr${h === 1 ? '' : 's'} ago`
  const d = Math.floor(h / 24)
  return d < 7 ? `${d} day${d === 1 ? '' : 's'} ago` : `${Math.floor(d / 7)} week${Math.floor(d / 7) === 1 ? '' : 's'} ago`
}
