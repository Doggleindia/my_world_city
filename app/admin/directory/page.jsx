'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Loader2, Download, ShieldCheck, Plus, Users, TrendingUp, Star, Clock,
  ChevronLeft, ChevronRight, Flag, ClipboardList, AlertCircle, AlertTriangle,
} from 'lucide-react'

const TABS = [['all', 'All'], ['verified', 'Verified'], ['pending', 'Pending'], ['suspended', 'Suspended'], ['top', 'Top Performers']]
const SPEC_COLOR = [
  'bg-amber-50 text-amber-700', 'bg-emerald-50 text-emerald-700', 'bg-blue-50 text-blue-700',
  'bg-rose-50 text-rose-600', 'bg-purple-50 text-purple-700',
]
const AVATAR = ['bg-emerald-100 text-emerald-700', 'bg-blue-100 text-blue-700', 'bg-rose-100 text-rose-600', 'bg-purple-100 text-purple-700', 'bg-amber-100 text-amber-700']

export default function ExpertDirectory() {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('all')
  const [type, setType] = useState('')
  const [locality, setLocality] = useState('')
  const [minExp, setMinExp] = useState('0')
  const [minRating, setMinRating] = useState('0')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(() => new Set())
  const [bulking, setBulking] = useState(false)

  const load = useCallback(async () => {
    const qs = new URLSearchParams({ tab, type, locality, minExp, minRating, page: String(page), limit: '6' })
    if (verifiedOnly) qs.set('verifiedOnly', 'true')
    const res = await fetch(`/api/admin/directory?${qs}`)
    setData(res.ok ? await res.json() : { items: [], counts: {}, cards: {}, resultTotal: 0, pageCount: 1 })
  }, [tab, type, locality, minExp, minRating, verifiedOnly, page])
  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1); setSelected(new Set()) }, [tab, type, locality, minExp, minRating, verifiedOnly])

  const c = data?.counts || {}
  const items = data?.items || []
  const cards = data?.cards || {}

  const toggleSel = (id) => setSelected((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  const allSel = items.length > 0 && items.every((i) => selected.has(i.id))
  const toggleAll = () => setSelected(allSel ? new Set() : new Set(items.map((i) => i.id)))

  const bulkVerify = async () => {
    if (selected.size === 0) return
    setBulking(true)
    await Promise.all([...selected].map((id) => fetch(`/api/admin/directory/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'verified' }) })))
    setSelected(new Set()); setBulking(false); load()
  }

  const exportCsv = () => {
    const header = ['Code', 'Name', 'Type', 'Locality', 'Experience', 'Rating', 'Cases', 'Status']
    const cell = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s }
    const lines = [header.join(',')].concat(items.map((e) => [e.code, e.name, e.cat, e.locality, e.experience ?? '', e.rating, e.cases, e.status].map(cell).join(',')))
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'experts.csv'; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-navy-900">Expert Directory</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[13.5px] text-slate-500">
            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600"><span className="h-2 w-2 rounded-full bg-emerald-500" /> {c.verified ?? 0} verified experts</span>
            <span className="text-slate-300">|</span> {c.pending ?? 0} pending verification
            <span className="text-slate-300">|</span> {c.suspended ?? 0} suspended
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-[13.5px] font-semibold text-navy-800 hover:border-slate-400"><Download className="h-4 w-4" /> Export</button>
          <button onClick={bulkVerify} disabled={selected.size === 0 || bulking} className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-[13.5px] font-semibold text-navy-800 hover:border-slate-400 disabled:opacity-40">{bulking ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Bulk Verify{selected.size > 0 ? ` (${selected.size})` : ''}</button>
          <button onClick={() => router.push('/admin/directory/new')} className="inline-flex items-center gap-2 rounded-full bg-navy-800 px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-navy-700"><Plus className="h-4 w-4" /> Add Expert</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi icon={Users} label="Total Experts" value={c.total} />
        <Kpi icon={TrendingUp} label="Active This Week" value={c.activeWeek} />
        <Kpi icon={Star} label="Top Rated" value={c.topRated} />
        <Kpi icon={Clock} label="Avg Response" value={c.avgResponseHours != null ? `${c.avgResponseHours}h` : '—'} />
      </div>

      {/* tabs */}
      <div className="mt-6 flex flex-wrap gap-6 border-b border-slate-200">
        {TABS.map(([k, l]) => {
          const n = k === 'all' ? c.total : k === 'verified' ? c.verified : k === 'pending' ? c.pending : k === 'suspended' ? c.suspended : c.topRated
          const active = tab === k
          return (
            <button key={k} onClick={() => setTab(k)} className={`pb-3 text-[14px] font-bold transition ${active ? 'border-b-2 border-navy-800 text-navy-800' : 'text-slate-400 hover:text-slate-600'}`}>
              {l} <span className="text-slate-400">({n ?? 0})</span>
            </button>
          )
        })}
      </div>

      {/* filters */}
      <div className="mt-4 flex flex-wrap items-end gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <Filter label="Expert Type"><Select value={type} onChange={setType} options={[['', 'All Types'], ...(data?.types || []).map((t) => [t, t])]} /></Filter>
        <Filter label="Locality"><Select value={locality} onChange={setLocality} options={[['', 'All Localities'], ...(data?.localities || []).map((l) => [l, l])]} /></Filter>
        <Filter label="Experience"><Select value={minExp} onChange={setMinExp} options={[['0', 'Any Years'], ['5', '5+ Years'], ['10', '10+ Years'], ['15', '15+ Years']]} /></Filter>
        <Filter label="Rating"><Select value={minRating} onChange={setMinRating} options={[['0', 'Any'], ['4.5', '4.5 & Above'], ['4', '4.0 & Above'], ['3.5', '3.5 & Above']]} /></Filter>
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-[13px] font-semibold text-slate-600">
          Verified Only
          <button onClick={() => setVerifiedOnly((v) => !v)} className={`relative h-5 w-9 rounded-full transition ${verifiedOnly ? 'bg-emerald-500' : 'bg-slate-300'}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${verifiedOnly ? 'left-[18px]' : 'left-0.5'}`} /></button>
        </label>
      </div>

      {/* table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3.5"><input type="checkbox" checked={allSel} onChange={toggleAll} className="h-4 w-4 rounded border-slate-300 text-brand" /></th>
                <th className="px-3 py-3.5">Expert</th>
                <th className="px-3 py-3.5">Specialty</th>
                <th className="px-3 py-3.5">Locality</th>
                <th className="px-3 py-3.5">Experience</th>
                <th className="px-3 py-3.5">Rating</th>
                <th className="px-3 py-3.5">Response</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!data ? (
                <tr><td colSpan={7}><div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-slate-400" /></div></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7}><div className="flex flex-col items-center py-16 text-center"><Users className="h-8 w-8 text-slate-300" /><p className="mt-2 text-[14px] font-medium text-slate-500">No experts match.</p></div></td></tr>
              ) : items.map((e, i) => (
                <tr key={e.id} onClick={() => router.push(`/admin/directory/${e.id}`)} className="cursor-pointer align-middle hover:bg-slate-50/60">
                  <td className="px-5 py-4" onClick={(ev) => ev.stopPropagation()}><input type="checkbox" checked={selected.has(e.id)} onChange={() => toggleSel(e.id)} className="h-4 w-4 rounded border-slate-300 text-brand" /></td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      {e.photo ? <img src={e.photo} alt="" className="h-9 w-9 rounded-full object-cover" /> : <span className={`grid h-9 w-9 place-items-center rounded-full text-[12px] font-bold ${AVATAR[i % AVATAR.length]}`}>{e.initials}</span>}
                      <div><p className="text-[14px] font-bold text-navy-800">{e.name}</p><p className="text-[11.5px] text-slate-400">ID: {e.code}</p></div>
                    </div>
                  </td>
                  <td className="px-3 py-4"><span className={`inline-block rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide ${SPEC_COLOR[i % SPEC_COLOR.length]}`}>{e.cat}</span></td>
                  <td className="px-3 py-4 text-[13.5px] text-slate-700">{e.locality}</td>
                  <td className="px-3 py-4 text-[13.5px] text-slate-700">{e.experience != null ? `${e.experience} yrs` : '—'}</td>
                  <td className="px-3 py-4"><span className="inline-flex items-center gap-1 text-[13.5px] font-bold text-navy-800"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {e.rating || '—'}{e.ratingCount ? ` (${e.ratingCount})` : ''}</span></td>
                  <td className="px-3 py-4 text-[13.5px] text-slate-600">{e.avgResponseHours}h avg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data && items.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/40 px-4 py-3">
            <span className="text-[13px] text-slate-500">Showing {items.length} of {data.resultTotal} experts</span>
            <div className="flex items-center gap-1.5">
              <PBtn disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></PBtn>
              {Array.from({ length: data.pageCount }, (_, i) => i + 1).slice(0, 5).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`h-8 min-w-8 rounded-full px-2 text-[13px] font-semibold ${p === page ? 'bg-navy-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>{p}</button>
              ))}
              <PBtn disabled={page === data.pageCount} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></PBtn>
            </div>
          </div>
        )}
      </div>

      {/* bottom cards */}
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Card title="Top Performing (30d)" icon={TrendingUp}>
          {(cards.topPerformers || []).map((e) => (
            <div key={e.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2.5">
                {e.photo ? <img src={e.photo} alt="" className="h-8 w-8 rounded-full object-cover" /> : <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-500">{e.initials}</span>}
                <span className="text-[13.5px] font-semibold text-navy-800">{e.name}</span>
              </div>
              <span className="text-[13px] font-bold text-emerald-600">{e.cases} <span className="text-[11px] font-medium text-slate-400">Completed</span></span>
            </div>
          ))}
        </Card>

        <Card title="Expert Coverage Gaps" icon={Flag}>
          {(cards.gaps || []).length === 0 ? <p className="py-4 text-[13px] text-slate-500">Good coverage everywhere 🎉</p> : (cards.gaps || []).map((g) => {
            const Icon = g.severity === 'high' ? AlertCircle : g.severity === 'med' ? AlertTriangle : Flag
            const cls = g.severity === 'high' ? 'border-red-500 bg-red-50 text-red-600' : g.severity === 'med' ? 'border-amber-500 bg-amber-50 text-amber-600' : 'border-slate-300 bg-slate-50 text-slate-500'
            return (
              <div key={g.locality} className={`mb-2 flex items-center justify-between rounded-lg border-l-4 px-3 py-2.5 ${cls}`}>
                <div><p className="text-[13.5px] font-bold text-navy-800">{g.locality}</p><p className="text-[12px] text-slate-500">{g.count} expert{g.count === 1 ? '' : 's'} available</p></div>
                <Icon className="h-4 w-4" />
              </div>
            )
          })}
          <button onClick={() => router.push('/admin/directory/new')} className="mt-2 w-full rounded-full bg-slate-100 py-2.5 text-[13px] font-bold text-navy-800 hover:bg-slate-200">Recruit More Experts →</button>
        </Card>

        <Card title={`Pending Verification (${c.pending ?? 0})`} icon={ClipboardList}>
          {(cards.pending || []).length === 0 ? <p className="py-4 text-[13px] text-slate-500">Nothing pending 🎉</p> : (cards.pending || []).map((e) => (
            <div key={e.id} className="mb-2 flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5">
              <div><p className="text-[13.5px] font-bold text-navy-800">{e.name}</p><p className="text-[11px] uppercase tracking-wide text-slate-400">{e.cat} · submitted {e.submitted}</p></div>
              <button onClick={() => router.push(`/admin/directory/${e.id}`)} className="text-[12.5px] font-bold text-brand hover:underline">REVIEW →</button>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

function Kpi({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand"><Icon className="h-5 w-5" /></span>
      <div><p className="text-[12.5px] text-slate-500">{label}</p>{value == null ? <span className="mt-1 block h-6 w-10 animate-pulse rounded bg-slate-100" /> : <p className="text-[22px] font-extrabold text-navy-900">{value}</p>}</div>
    </div>
  )
}
function Card({ title, icon: Icon, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between"><h3 className="text-[15px] font-bold text-navy-800">{title}</h3><Icon className="h-4 w-4 text-slate-400" /></div>
      {children}
    </div>
  )
}
function Filter({ label, children }) { return <div><p className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-slate-400">{label}</p>{children}</div> }
function Select({ value, onChange, options }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-8 text-[13px] font-semibold text-navy-800 focus:border-brand focus:outline-none">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <ChevronRight className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400" />
    </div>
  )
}
function PBtn({ disabled, onClick, children }) { return <button onClick={onClick} disabled={disabled} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30">{children}</button> }
