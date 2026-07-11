'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import {
  ChevronRight, ChevronDown, Calendar,
  Inbox, UserSearch, ClipboardCheck, MapPin, Layers, TrendingUp,
} from 'lucide-react'

const RANGES = [[1, 'Today'], [7, 'Last 7 days'], [30, 'Last 30 days']]
const STATUS_COLOR = { new: '#d9532a', contacted: '#e2843a', site_visit: '#7c4a1e', qualified: '#1f7a4d', closed: '#12356b', cancelled: '#94a3b8' }
const TYPE_LABEL = { enquiry: 'Enquiry', visit: 'Visit', callback: 'Callback', service: 'Service', expert: 'Expert' }

const CAT_META = [
  { key: 'property', label: 'Property', color: '#1f7a4d' },
  { key: 'build', label: 'Build', color: '#12356b' },
  { key: 'operate', label: 'Operate & manage', color: '#e2843a' },
  { key: 'invest', label: 'Invest', color: '#7c4a1e' },
]

export default function AdminDashboard() {
  const { user } = useAuth()
  const [days, setDays] = useState(1)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/stats?days=${days}`)
      .then((r) => r.json())
      .then((d) => { if (d.ok !== false) { setData(d); setError('') } else setError(d.error || 'Failed to load') })
      .catch(() => setError('Could not load dashboard'))
      .finally(() => setLoading(false))
  }, [days])

  const [greeting, setGreeting] = useState('Welcome')
  useEffect(() => {
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening')
  }, [])

  const firstName = user?.name?.split(' ')[0] || 'Admin'
  const s = data?.stats
  const rangeLabel = RANGES.find(([d]) => d === days)?.[1] || 'Today'
  const enqLabel = days === 1 ? 'Enquiries today' : `Enquiries · ${rangeLabel.toLowerCase()}`
  const delta = s?.rangeDelta

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight text-navy-900 sm:text-[30px]">
            {greeting}, {firstName} <span className="align-middle">👋</span>
          </h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Here’s what’s happening across My World City projects.
          </p>
        </div>
        <div className="relative inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13.5px] font-semibold text-navy-800 shadow-sm">
          <Calendar className="h-4 w-4 text-slate-400" />
          {rangeLabel}
          <ChevronDown className="h-4 w-4 text-slate-400" />
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="absolute inset-0 cursor-pointer opacity-0">
            {RANGES.map(([d, l]) => <option key={d} value={d}>{l}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-[13.5px] font-medium text-red-600">{error}</p>
      )}

      {/* KPI row */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard
          accent="#1f7a4d"
          label={enqLabel}
          value={s?.rangeCount}
          loading={loading}
          sub={delta != null ? `${delta >= 0 ? '+' : ''}${delta}%` : undefined}
          subColor={delta >= 0 ? 'text-emerald-600' : 'text-red-500'}
        />
        <StatCard
          accent="#d9532a"
          label="Unassigned"
          value={s?.unassigned}
          loading={loading}
          sub={s?.unassigned > 0 ? 'Needs attention' : 'All assigned'}
          subColor={s?.unassigned > 0 ? 'text-ember' : 'text-emerald-600'}
        />
        <StatCard accent="#1f5fbf" label="Live properties" value={s?.liveProperties} loading={loading} />
        <StatCard
          accent="#e2843a"
          label="Experts onboarded"
          value={s?.expertsOnboarded}
          loading={loading}
          sub={s?.expertsPending > 0 ? `${s.expertsPending} pending` : undefined}
          subColor="text-amber-600"
        />
        <StatCard accent="#1f7a4d" label="Avg response time" value={s?.avgResponse || '—'} loading={loading} sub={s?.avgResponse ? 'first response' : 'no data yet'} subColor="text-slate-400" />
      </div>

      {/* Chart + Recent activity */}
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[17px] font-bold text-navy-800">Enquiries by types</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {CAT_META.map((c) => (
                <span key={c.key} className="inline-flex items-center gap-1.5 text-[12px] text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} /> {c.label}
                </span>
              ))}
            </div>
          </div>
          <EnquiriesChart days={data?.enquiriesByDay} loading={loading} />
        </Card>

        <Card>
          <h2 className="text-[17px] font-bold text-navy-800">Recent Activity</h2>
          <RecentActivity items={data?.recentActivity} loading={loading} />
        </Card>
      </div>

      {/* Three action cards */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHead title="Unassigned Enquiries" count={s?.unassigned} tone="ember" />
          <div className="mt-4 space-y-2">
            <PreviewList
              loading={loading}
              items={data?.unassignedEnquiries}
              empty="No unassigned enquiries."
              render={(l) => (
                <Link key={l.id} href="/admin/enquiries" className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-3 transition hover:border-slate-200">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-bold text-navy-800">{l.name}</p>
                    <p className="mt-0.5 text-[12.5px] capitalize text-slate-500">{l.type} • {l.locality}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                </Link>
              )}
            />
          </div>
          <CardButton href="/admin/enquiries">Go to Enquiries</CardButton>
        </Card>

        <Card>
          <CardHead title="Expert Requests" count={s?.expertsPending} tone="emerald" />
          <div className="mt-4 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 py-8 text-center">
            <UserSearch className="h-7 w-7 text-slate-300" />
            <p className="mt-2 text-[13.5px] font-semibold text-navy-800">
              {s?.expertsPending > 0 ? `${s.expertsPending} experts pending` : 'No open requests'}
            </p>
            <p className="mt-0.5 px-6 text-[12px] text-slate-500">Assign specialists to enquiries that need them.</p>
          </div>
          <CardButton href="/admin/experts">Assign Experts</CardButton>
        </Card>

        <Card>
          <CardHead title="Pending Approval" count={s?.pendingProperties} tone="amber" />
          <div className="mt-4 flex-1">
            {loading ? (
              <SkeletonRows n={1} />
            ) : data?.pendingApprovals?.length ? (
              <>
                <div className="flex gap-2">
                  {data.pendingApprovals.slice(0, 3).map((p) => (
                    <img key={p.id} src={p.img} alt={p.title} className="h-16 w-1/3 rounded-lg object-cover" />
                  ))}
                </div>
                <p className="mt-3 text-[14px] font-bold text-navy-800">New: {data.pendingApprovals[0].title}</p>
                <p className="mt-0.5 text-[12.5px] text-slate-500">
                  Submitted by {data.pendingApprovals[0].submittedBy} • {data.pendingApprovals[0].when}
                </p>
              </>
            ) : (
              <EmptyBox icon={ClipboardCheck} text="Nothing awaiting review 🎉" />
            )}
          </div>
          <CardButton href="/admin/properties">Review Queue</CardButton>
        </Card>
      </div>

      {/* Top localities */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h2 className="text-[17px] font-bold text-navy-800">Top Localities</h2>
          <TopLocalities items={data?.topLocalities} metric={data?.localityMetric} loading={loading} />
        </Card>

        <Card className="lg:col-span-1">
          <h2 className="text-[17px] font-bold text-navy-800">Enquiries by Stage</h2>
          <BreakdownBars items={data?.statusBreakdown} loading={loading} colorFor={(k) => STATUS_COLOR[k] || '#94a3b8'} labelKey="label" icon={Layers} />
        </Card>
        <Card className="lg:col-span-1">
          <h2 className="text-[17px] font-bold text-navy-800">Enquiries by Type</h2>
          <BreakdownBars items={data?.typeBreakdown} loading={loading} colorFor={() => '#1f5fbf'} labelKey="key" mapLabel={(k) => TYPE_LABEL[k] || k} icon={TrendingUp} />
        </Card>
      </div>
    </div>
  )
}

/* ---------------- pieces ---------------- */

function Card({ children, className = '' }) {
  return (
    <div className={`flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

function StatCard({ accent, label, value, sub, subColor = 'text-emerald-600', loading }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="h-1" style={{ background: accent }} />
      <div className="p-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
        <div className="mt-2 flex items-end gap-2">
          {loading ? (
            <span className="mt-1 h-7 w-16 animate-pulse rounded bg-slate-100" />
          ) : (
            <span className="text-[26px] font-extrabold leading-none text-navy-900">
              {value ?? '—'}
            </span>
          )}
          {sub && !loading && <span className={`pb-0.5 text-[12px] font-semibold ${subColor}`}>{sub}</span>}
        </div>
      </div>
    </div>
  )
}

function CardHead({ title, count, tone }) {
  const toneCls = {
    ember: 'bg-ember/10 text-ember',
    emerald: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
  }[tone]
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[17px] font-bold text-navy-800">{title}</h2>
      {count > 0 && (
        <span className={`grid h-6 min-w-[24px] place-items-center rounded-lg px-2 text-[12px] font-bold ${toneCls}`}>
          {count}
        </span>
      )}
    </div>
  )
}

function CardButton({ href, children }) {
  return (
    <Link
      href={href}
      className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-full bg-navy-800 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-navy-700"
    >
      {children}
    </Link>
  )
}

function PreviewList({ loading, items, empty, render }) {
  if (loading) return <SkeletonRows n={3} />
  if (!items?.length) return <EmptyBox icon={Inbox} text={empty} />
  return items.map(render)
}

function EnquiriesChart({ days, loading }) {
  if (loading) return <div className="mt-6 h-56 animate-pulse rounded-xl bg-slate-100" />
  const data = days || []
  const max = Math.max(1, ...data.map((d) => d.property + d.build + d.operate + d.invest))
  const hasData = data.some((d) => d.property + d.build + d.operate + d.invest > 0)

  return (
    <div className="mt-6">
      <div className="flex h-56 items-end justify-between gap-3">
        {data.map((d, i) => {
          const total = d.property + d.build + d.operate + d.invest
          return (
            <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <div className="flex w-full max-w-[64px] flex-col-reverse overflow-hidden rounded-lg" style={{ height: `${(total / max) * 100}%`, minHeight: total ? 6 : 0 }}>
                {CAT_META.map((c) => {
                  const v = d[c.key]
                  if (!v) return null
                  return <div key={c.key} style={{ height: `${(v / total) * 100}%`, background: c.color }} />
                })}
              </div>
              <span className="text-[12px] font-medium text-slate-400">{d.day}</span>
            </div>
          )
        })}
      </div>
      {!hasData && (
        <p className="mt-3 text-center text-[12.5px] text-slate-400">No enquiries recorded in the last 6 days yet.</p>
      )}
    </div>
  )
}

function RecentActivity({ items, loading }) {
  if (loading) return <div className="mt-4"><SkeletonRows n={4} /></div>
  if (!items?.length) return <div className="mt-4"><EmptyBox icon={Inbox} text="No recent activity." /></div>
  return (
    <ul className="mt-4 space-y-4">
      {items.map((a, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
          <div className="min-w-0">
            <p className="text-[13.5px] font-bold text-navy-800">{a.title}</p>
            <p className="mt-0.5 text-[12.5px] text-slate-500">{a.subtitle}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

function TopLocalities({ items, metric = 'Enquiries', loading }) {
  if (loading) return <div className="mt-5"><SkeletonRows n={4} /></div>
  if (!items?.length) return <div className="mt-5"><EmptyBox icon={MapPin} text="No locality data yet." /></div>
  const max = Math.max(1, ...items.map((l) => l.count))
  return (
    <div className="mt-5 space-y-4">
      {items.map((l) => (
        <div key={l.locality}>
          <div className="flex items-center justify-between">
            <span className="text-[13.5px] font-bold text-navy-800">{l.locality}</span>
            <span className="text-[12.5px] text-slate-500">{l.count} {metric}</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-brand" style={{ width: `${(l.count / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function BreakdownBars({ items, loading, colorFor, labelKey, mapLabel, icon: Icon }) {
  if (loading) return <div className="mt-5"><SkeletonRows n={4} /></div>
  if (!items?.length) return <div className="mt-5"><EmptyBox icon={Icon} text="No enquiries yet." /></div>
  const max = Math.max(1, ...items.map((i) => i.count))
  return (
    <div className="mt-5 space-y-3.5">
      {items.map((i) => {
        const label = mapLabel ? mapLabel(i[labelKey]) : i[labelKey]
        return (
          <div key={String(i.key ?? label)}>
            <div className="flex items-center justify-between">
              <span className="text-[13.5px] font-semibold capitalize text-navy-800">{label}</span>
              <span className="text-[12.5px] text-slate-500">{i.count}</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full" style={{ width: `${(i.count / max) * 100}%`, background: colorFor(i.key) }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function EmptyBox({ icon: Icon, text }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 py-8 text-center">
      <Icon className="h-6 w-6 text-slate-300" />
      <p className="mt-2 px-4 text-[13px] font-medium text-slate-500">{text}</p>
    </div>
  )
}

function SkeletonRows({ n }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
      ))}
    </div>
  )
}
