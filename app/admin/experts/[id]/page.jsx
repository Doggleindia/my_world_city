'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { X, ArrowRight, Loader2, Check, Star, Users } from 'lucide-react'
import { useAdminStats } from '../../layout'

const FOUR_HOURS = 4 * 3600 * 1000

export default function ExpertMatchWorkspace() {
  const { id } = useParams()
  const router = useRouter()
  const stats = useAdminStats()

  const [lead, setLead] = useState(null)
  const [experts, setExperts] = useState(null)
  const [needsSeed, setNeedsSeed] = useState(false)
  const [browseAll, setBrowseAll] = useState(false)
  const [assigning, setAssigning] = useState(null)
  const [seeding, setSeeding] = useState(false)

  const loadExperts = useCallback(async (category, locality) => {
    const qs = new URLSearchParams({ category: category || '', locality: locality || '' })
    const res = await fetch(`/api/admin/experts-match?${qs}`)
    const data = await res.json()
    setExperts(res.ok ? data.items : [])
    setNeedsSeed(!!data.needsSeed)
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

  const back = () => router.push('/admin/experts')

  const seedExperts = async () => {
    setSeeding(true)
    await fetch('/api/admin/seed', { method: 'POST' })
    await loadExperts(lead?.expertType, lead?.locality)
    setSeeding(false)
  }

  const assign = async (expertId) => {
    setAssigning(expertId)
    await fetch(`/api/admin/leads/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assignedExpert: expertId }),
    })
    stats?.refresh?.()
    back()
  }

  if (!lead) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>

  const catLabel = titleCase(lead.expertType || 'Expert')
  const firstName = (lead.name || '').split(' ')[0] || 'user'
  const wait = waitInfo(lead.createdAt)
  const shown = browseAll ? experts : experts?.slice(0, 3)

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[15px] font-medium">
          <span className="text-slate-400">Expert Requests</span>
          <span className="text-slate-300">›</span>
          <span className="font-bold text-navy-800">{lead.name} — {catLabel} Request</span>
          {wait.priority && <span className="rounded bg-red-600 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">Priority</span>}
        </p>
        <button onClick={back} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[440px_1fr]">
        {/* LEFT */}
        <div className="flex h-fit flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-[18px] font-extrabold text-navy-900">Request Details</h2>

          <div className="mt-4 flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand/10 text-[14px] font-bold text-brand">{initials(lead.name)}</span>
            <div>
              <p className="flex items-center gap-2 text-[16px] font-bold text-navy-900">
                {lead.name}
                {!lead.user && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-semibold text-slate-500">First-time user</span>}
              </p>
              {lead.email && <p className="text-[12.5px] text-slate-500">{lead.email}</p>}
            </div>
          </div>

          <p className="mt-5 text-[11px] font-bold uppercase tracking-wide text-slate-400">Service Required</p>
          <span className="mt-2 inline-block rounded-full bg-ember/10 px-3 py-1.5 text-[14px] font-bold text-ember">{catLabel}</span>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <Field label="Project Context" value={lead.property?.title || lead.locality || '—'} />
            <Field label="Timeline" value={lead.preferredDay || lead.visitDate || 'Flexible'} />
            <Field label="Budget Range" value={lead.budget || 'Not specified'} muted={!lead.budget} />
            <Field label="Status" value={statusLabel(lead.status)} valueCls="text-emerald-600" />
          </div>

          {lead.property && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Linked Property</p>
              <div className="mt-2 flex items-center gap-3">
                {lead.property.img && <img src={lead.property.img} alt="" className="h-12 w-16 rounded-lg object-cover" />}
                <div>
                  <p className="text-[14px] font-bold text-navy-800">{lead.property.title}</p>
                  <Link href={`/property/${lead.property.slug}`} target="_blank" className="text-[12px] font-semibold text-brand hover:underline">View listing →</Link>
                </div>
              </div>
            </div>
          )}

          <Link href={`/admin/experts/${id}/detail`} className="mt-5 flex items-center justify-center gap-2 rounded-full bg-navy-800 py-3.5 text-[15px] font-semibold text-white transition hover:bg-navy-700">
            Open Full Enquiry Detail <ArrowRight className="h-[18px] w-[18px]" />
          </Link>
        </div>

        {/* RIGHT */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-[14px] font-semibold text-slate-500">Match &amp; Assign</span>
            <div className="flex rounded-full bg-slate-100 p-1">
              <button onClick={() => setBrowseAll(false)} className={`rounded-full px-4 py-2 text-[12.5px] font-bold ${!browseAll ? 'bg-navy-800 text-white' : 'text-slate-500'}`}>
                SUGGESTED MATCHES ({Math.min(3, experts?.length || 0)})
              </button>
              <button onClick={() => setBrowseAll(true)} className={`rounded-full px-4 py-2 text-[12.5px] font-bold ${browseAll ? 'bg-navy-800 text-white' : 'text-slate-400'}`}>
                BROWSE FULL DIRECTORY
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {experts == null ? (
              <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-slate-300" /></div>
            ) : needsSeed ? (
              <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 py-16 text-center">
                <Users className="h-8 w-8 text-slate-300" />
                <p className="mt-2 text-[14px] font-semibold text-navy-800">No experts in the directory yet</p>
                <p className="mt-1 max-w-xs text-[13px] text-slate-500">Seed the sample experts and localities to start matching.</p>
                <button onClick={seedExperts} disabled={seeding} className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                  {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Seed sample experts'}
                </button>
              </div>
            ) : shown.length === 0 ? (
              <p className="py-10 text-center text-[14px] text-slate-500">No experts available for this category.</p>
            ) : (
              shown.map((e) => <ExpertCard key={e.id} e={e} firstName={firstName} onAssign={() => assign(e.id)} assigning={assigning === e.id} disabled={assigning != null} />)
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ExpertCard({ e, firstName, onAssign, assigning, disabled }) {
  return (
    <div className={`rounded-2xl border p-5 transition ${e.topMatch ? 'border-2 border-emerald-400 bg-emerald-50/40' : 'border-slate-200'}`}>
      <div className="flex items-start gap-4">
        {e.photo ? (
          <img src={e.photo} alt={e.name} className="h-14 w-14 shrink-0 rounded-full object-cover" />
        ) : (
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand/10 text-[15px] font-bold text-brand">{e.initials}</span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="flex flex-wrap items-center gap-2 text-[16px] font-bold text-navy-900">
                {e.name}
                <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${e.topMatch ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-700'}`}>
                  {e.topMatch ? `Top Match — ${e.matchPct}%` : `${e.matchPct}% match`}
                </span>
              </p>
              <p className="mt-1 text-[13.5px] text-slate-600">
                {e.role}{e.experience ? ` • ${e.experience} yrs exp` : ''} • {e.location}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[13px] font-bold text-navy-900">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {e.rating}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <LocalityChip kind={e.localityMatch} />
            {e.typeMatch && <Chip ok>Type</Chip>}
            <Chip ok>Available now</Chip>
          </div>
        </div>
      </div>
      <button onClick={onAssign} disabled={disabled} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-navy-800 py-3 text-[14px] font-semibold text-white transition hover:bg-navy-700 disabled:opacity-50">
        {assigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Assign to {firstName} <ArrowRight className="h-4 w-4" /></>}
      </button>
    </div>
  )
}

function LocalityChip({ kind }) {
  if (kind === 'match') return <Chip ok>Locality</Chip>
  if (kind === 'adjacent') return <Chip ok>Adjacent locality</Chip>
  return <Chip bad>Different locality</Chip>
}
function Chip({ ok, bad, children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[12px] font-medium ${ok ? 'border-emerald-200 text-emerald-700' : bad ? 'border-red-200 text-red-500' : 'border-slate-200 text-slate-500'}`}>
      {ok ? <Check className="h-3.5 w-3.5" /> : bad ? <X className="h-3.5 w-3.5" /> : null}{children}
    </span>
  )
}
function Field({ label, value, muted, valueCls }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-[14.5px] font-bold ${valueCls || (muted ? 'text-slate-400' : 'text-navy-900')}`}>{value}</p>
    </div>
  )
}

function waitInfo(createdAt) {
  const ms = Date.now() - new Date(createdAt).getTime()
  return { priority: ms >= FOUR_HOURS }
}
function statusLabel(s) {
  return { new: 'Active Request', contacted: 'Assigned', closed: 'Completed', cancelled: 'Cancelled' }[s] || titleCase(s)
}
function initials(name = '?') { return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() }
function titleCase(s = '') { return String(s).replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) }
