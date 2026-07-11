'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Loader2, ArrowRight, MessageSquare, Phone, Mail, MapPin, Globe, Calendar,
  AlertCircle, Star, Check, Clock, ExternalLink, Hammer,
} from 'lucide-react'

const TABS = ['Overview', 'Communication Log', 'Property Context', 'Admin Notes', 'Activity Log']
const FOUR_HOURS = 4 * 3600 * 1000

export default function EnquiryDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [lead, setLead] = useState(null)
  const [experts, setExperts] = useState([])
  const [tab, setTab] = useState('Overview')
  const [steps, setSteps] = useState(() => new Set())
  const toggleStep = (sid) => setSteps((p) => { const n = new Set(p); n.has(sid) ? n.delete(sid) : n.add(sid); return n })

  const loadExperts = useCallback(async (category, locality) => {
    const qs = new URLSearchParams({ category: category || '', locality: locality || '' })
    const res = await fetch(`/api/admin/experts-match?${qs}`)
    const data = await res.json()
    setExperts(res.ok ? (data.items || []).slice(0, 3) : [])
  }, [])

  useEffect(() => {
    let alive = true
    fetch(`/api/admin/leads/${id}`).then((r) => r.json()).then((d) => {
      if (!alive) return
      setLead(d.lead || null)
      if (d.lead) loadExperts(d.lead.expertType, d.lead.locality)
    })
    return () => { alive = false }
  }, [id, loadExperts])

  const markLost = async () => {
    await fetch(`/api/admin/leads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'cancelled' }) })
    router.push('/admin/experts')
  }

  if (!lead) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>

  const catLabel = titleCase(lead.expertType || 'Expert')
  const priority = Date.now() - new Date(lead.createdAt).getTime() >= FOUR_HOURS
  const score = Math.min(9.9, 5 + Math.min(4, (Date.now() - new Date(lead.createdAt).getTime()) / 3600e3 * 0.5) + (lead.property ? 0.8 : 0)).toFixed(1)

  return (
    <div className="mx-auto max-w-[1400px]">
      <p className="flex items-center gap-2 text-[13px] text-slate-400">
        <Link href="/admin" className="hover:text-slate-600">Home</Link> ›
        <Link href="/admin/experts" className="hover:text-slate-600">Expert Requests</Link> ›
        <span className="font-semibold text-navy-800">{lead.name} — {catLabel} Request</span>
      </p>

      {/* header card */}
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand/10 text-[16px] font-bold text-brand">{initials(lead.name)}</span>
          <div>
            <p className="text-[19px] font-extrabold text-navy-900">{lead.name}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              <Badge cls="bg-ember/10 text-ember">Expert Request</Badge>
              {priority && <Badge cls="bg-red-100 text-red-600">Priority</Badge>}
              {!lead.user && <Badge cls="bg-slate-100 text-slate-500">First-time user</Badge>}
            </div>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-slate-500">
              <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> +91 {lead.phone}</span>
              {lead.email && <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {lead.email}</span>}
              <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {ago(lead.createdAt)}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button onClick={() => router.push(`/admin/experts/${id}`)} className="inline-flex items-center gap-2 rounded-full bg-navy-800 px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-navy-700">
            Assign Expert <ArrowRight className="h-4 w-4" />
          </button>
          <div className="flex gap-2">
            <a href={`https://wa.me/91${lead.phone}`} target="_blank" title="WhatsApp"><IconBtn icon={MessageSquare} /></a>
            <a href={`tel:+91${lead.phone}`} title="Call"><IconBtn icon={Phone} /></a>
            {lead.email && <a href={`mailto:${lead.email}`} title="Email"><IconBtn icon={Mail} /></a>}
          </div>
          <button onClick={markLost} className="text-[13px] font-semibold text-red-500 hover:underline">Mark as Lost</button>
        </div>
      </div>

      {/* tabs */}
      <div className="mt-5 flex flex-wrap gap-6 border-b border-slate-200">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`pb-3 text-[14px] font-bold transition ${tab === t ? 'border-b-2 border-navy-800 text-navy-800' : 'text-slate-400 hover:text-slate-600'}`}>{t}</button>
        ))}
      </div>

      {tab === 'Overview' ? (
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_340px]">
          {/* main */}
          <div className="space-y-5">
            {/* Enquiry summary */}
            <Card title="Enquiry Summary">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Mini icon={Star} label="Service Required" value={catLabel} />
                <Mini icon={MessageSquare} label="Enquiry Type" value={titleCase(lead.type || 'Enquiry')} />
                <Mini icon={Calendar} label="Timeframe" value={lead.preferredDay || lead.visitDate || 'Flexible'} />
                <Mini icon={MapPin} label="Location" value={lead.locality || '—'} />
                <Mini icon={AlertCircle} label="Priority" value={priority ? 'High Priority' : 'Normal'} valueCls={priority ? 'text-red-600' : 'text-navy-900'} />
                <Mini icon={Globe} label="Budget" value={lead.budget || 'Not specified'} valueCls={lead.budget ? 'text-navy-900' : 'text-slate-400'} />
              </div>
              <p className="mt-4 rounded-xl border-l-4 border-navy-800 bg-slate-50 px-4 py-3.5 text-[13.5px] leading-relaxed text-slate-700">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400">Request Message</span>
                {lead.message ? `“${lead.message}”` : 'No message provided.'}
              </p>
            </Card>

            {/* Requester profile */}
            <Card title="Requester Profile">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <Row label="Phone" value={`+91 ${lead.phone}`} />
                <Row label="Email" value={lead.email || '—'} muted={!lead.email} />
                <Row label="Budget Range" value={lead.budget || 'Not specified'} muted={!lead.budget} />
                <Row label="Account" value={lead.user ? `Member since ${new Date(lead.user.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : 'Guest (not registered)'} />
              </div>
            </Card>

            {/* Recommendations */}
            <Card title="Top Assignment Recommendations" action={<Link href={`/admin/experts/${id}`} className="text-[13px] font-bold text-brand hover:underline">SEE ALL EXPERTS</Link>}>
              {experts.length === 0 ? (
                <p className="text-[13.5px] text-slate-500">No expert recommendations available.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-3">
                  {experts.map((e) => (
                    <div key={e.id} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex items-center gap-2.5">
                        {e.photo ? <img src={e.photo} alt="" className="h-10 w-10 rounded-full object-cover" /> : <span className="grid h-10 w-10 place-items-center rounded-full bg-brand/10 text-[12px] font-bold text-brand">{e.initials}</span>}
                        <div className="min-w-0">
                          <p className="truncate text-[13.5px] font-bold text-navy-800">{e.name}</p>
                          <p className="text-[11.5px] text-slate-400">{e.experience ? `${e.experience} yrs exp` : e.role}</p>
                        </div>
                      </div>
                      <p className="mt-2 text-[13px] font-bold text-emerald-600">{e.matchPct}% <span className="text-[11px] font-medium text-slate-400">MATCH</span></p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Next steps */}
            <Card title="Suggested Next Steps">
              <NextStep id="assign" title="Assign expert within 2 hours" body="Maintain SLA for high-priority leads." checked={steps.has('assign')} onToggle={toggleStep} />
              <NextStep id="verify" title="Trigger verification call" body="Confirm specific site details and budget." checked={steps.has('verify')} onToggle={toggleStep} />
            </Card>
          </div>

          {/* sidebar */}
          <div className="space-y-5">
            <Card title="Enquiry Timeline">
              <ul className="space-y-4">
                <TL color="bg-emerald-500" title="Enquiry Submitted" sub={`${fmt(lead.createdAt)} • Via Web Portal`} />
                <TL color="bg-navy-800" title="Received" sub={`${fmt(lead.createdAt)} • Lead captured`} />
                {lead.status !== 'new' && <TL color="bg-amber-500" title="In Progress" sub={`${statusLabel(lead.status)}`} />}
                <TL color="bg-slate-300" title="Admin Viewed" sub="Just now • By you" last />
              </ul>
            </Card>

            <div className="rounded-2xl bg-navy-800 p-5 text-white">
              <p className="text-[14px] font-bold">Related Enquiries</p>
              {lead.related?.length ? (
                <>
                  <p className="mt-1 text-[12px] text-white/60">{lead.related.length} other enquir{lead.related.length === 1 ? 'y' : 'ies'} from this contact.</p>
                  <div className="mt-3 space-y-2">
                    {lead.related.map((r) => (
                      <div key={r.id} className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2 text-[12.5px]">
                        <span className="font-mono text-white/90">{r.refId || r.id.slice(-6)}</span>
                        <span className="capitalize text-white/60">{r.type}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="mt-1 text-[12.5px] text-white/70">No other enquiries from this contact.</p>
              )}
            </div>

            <Card title="">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Priority Score</p>
              <div className="mt-1 flex items-center justify-between">
                <div className="mr-3 h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-navy-800" style={{ width: `${(score / 10) * 100}%` }} />
                </div>
                <span className="text-[15px] font-extrabold text-navy-900">{score}</span>
              </div>
              <div className="mt-4 space-y-2 text-[13px]">
                <div className="flex justify-between"><span className="text-slate-400">Enquiry ID</span><span className="font-semibold text-navy-800">{lead.refId || '—'}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Referrer</span><span className="font-semibold text-navy-800">—</span></div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[catLabel, priority ? 'High Value' : 'Standard'].map((t) => (
                  <span key={t} className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{t}</span>
                ))}
              </div>
            </Card>
          </div>
        </div>
      ) : tab === 'Property Context' ? (
        <div className="mt-5">
          <Card title="Linked Property">
            {lead.property ? (
              <div className="flex items-center gap-4">
                {lead.property.img && <img src={lead.property.img} alt="" className="h-20 w-28 rounded-xl object-cover" />}
                <div>
                  <p className="text-[16px] font-bold text-navy-800">{lead.property.title}</p>
                  <p className="text-[13px] text-slate-500">{lead.property.category} · {lead.locality}</p>
                  <Link href={`/property/${lead.property.slug}`} target="_blank" className="mt-1 inline-flex items-center gap-1 text-[13px] font-semibold text-brand hover:underline">Open listing <ExternalLink className="h-3.5 w-3.5" /></Link>
                </div>
              </div>
            ) : <p className="text-[13.5px] text-slate-500">No property linked to this enquiry.</p>}
          </Card>
        </div>
      ) : (
        <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <Hammer className="h-8 w-8 text-slate-300" />
          <p className="mt-2 text-[15px] font-bold text-navy-800">{tab}</p>
          <p className="mt-1 text-[13px] text-slate-500">This panel is coming soon.</p>
        </div>
      )}
    </div>
  )
}

function Card({ title, action, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && <h2 className="text-[16px] font-bold text-navy-800">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}
function Mini({ icon: Icon, label, value, valueCls = 'text-navy-900' }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <p className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 flex items-center gap-1.5 text-[13.5px] font-bold ${valueCls}`}><Icon className="h-3.5 w-3.5 text-slate-400" /> {value}</p>
    </div>
  )
}
function Row({ label, value, muted }) {
  return (
    <div>
      <p className="text-[12px] text-slate-400">{label}</p>
      <p className={`mt-0.5 text-[13.5px] font-semibold ${muted ? 'text-slate-400' : 'text-navy-800'}`}>{value}</p>
    </div>
  )
}
function NextStep({ id, title, body, checked, onToggle }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3.5 transition hover:border-slate-300">
      <input type="checkbox" checked={checked} onChange={() => onToggle(id)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand" />
      <div>
        <p className={`text-[14px] font-semibold ${checked ? 'text-slate-400 line-through' : 'text-navy-800'}`}>{title}</p>
        <p className="text-[12.5px] text-slate-500">{body}</p>
      </div>
    </label>
  )
}
function TL({ color, title, sub, last }) {
  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center">
        <span className={`h-3 w-3 rounded-full ${color}`} />
        {!last && <span className="mt-1 w-px flex-1 bg-slate-200" />}
      </div>
      <div className="pb-1">
        <p className="text-[13.5px] font-bold text-navy-800">{title}</p>
        <p className="text-[12px] text-slate-400">{sub}</p>
      </div>
    </li>
  )
}
function Badge({ cls, children }) { return <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${cls}`}>{children}</span> }
function IconBtn({ icon: Icon }) { return <span className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-300"><Icon className="h-4 w-4" /></span> }

function initials(name = '?') { return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() }
function titleCase(s = '') { return String(s).replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) }
function ago(createdAt) {
  const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
  if (mins < 60) return `${mins}m ago`
  const h = Math.floor(mins / 60)
  return h < 24 ? `${h}h ${mins % 60}m ago` : `${Math.floor(h / 24)}d ago`
}
function fmt(dt) { return new Date(dt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) }
function statusLabel(s) { return { contacted: 'Assigned', closed: 'Completed', cancelled: 'Cancelled' }[s] || titleCase(s) }
