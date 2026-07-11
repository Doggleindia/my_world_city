'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  X, ChevronRight, ArrowRight, Loader2, Phone, Check, Clock, CalendarX,
  Scale, Landmark, Building2, Star, ExternalLink, Users,
} from 'lucide-react'
import { useAdminStats } from '../../layout'
import RequestDetailBody from '@/components/admin/RequestDetailBody'

const CAT_ICON = { legal: Scale, govt_liaison: Landmark, architect: Building2 }
const FOUR_HOURS = 4 * 3600 * 1000

export default function ServiceRequestWorkspace() {
  const { id } = useParams()
  const router = useRouter()
  const stats = useAdminStats()

  const [lead, setLead] = useState(null)
  const [partners, setPartners] = useState(null)
  const [needsSeed, setNeedsSeed] = useState(false)
  const [browseAll, setBrowseAll] = useState(false)
  const [routingId, setRoutingId] = useState(null)
  const [seeding, setSeeding] = useState(false)

  const loadPartners = useCallback(async (serviceKey, locality) => {
    const qs = new URLSearchParams({ category: serviceKey || '', locality: locality || '' })
    const res = await fetch(`/api/admin/partners?${qs}`)
    const data = await res.json()
    setPartners(res.ok ? data.items : [])
    setNeedsSeed(!!data.needsSeed)
  }, [])

  useEffect(() => {
    let alive = true
    fetch(`/api/admin/leads/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return
        setLead(d.lead || null)
        if (d.lead) loadPartners(d.lead.serviceKey, d.lead.locality)
      })
    return () => { alive = false }
  }, [id, loadPartners])

  const back = () => router.push('/admin/service')

  const routeTo = async (partnerId) => {
    setRoutingId(partnerId || 'generic')
    await fetch(`/api/admin/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partnerId ? { routedPartner: partnerId } : { status: 'contacted' }),
    })
    stats?.refresh?.()
    back()
  }

  const seed = async () => {
    setSeeding(true)
    await fetch('/api/admin/partners', { method: 'POST' })
    await loadPartners(lead?.serviceKey, lead?.locality)
    setSeeding(false)
  }

  if (!lead) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
  }

  const catLabel = titleCase(lead.serviceKey || 'Service')
  const wait = waitInfo(lead.createdAt)
  const shown = browseAll ? partners : partners?.slice(0, 3)

  return (
    <div className="mx-auto max-w-[1500px]">
      {/* header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[14px] font-medium text-slate-500">
          <span className="text-slate-400">Service Requests</span>
          <ChevronRight className="h-4 w-4 text-slate-300" />
          <span className="font-bold text-navy-800">{lead.name} — {catLabel} Request</span>
        </p>
        <div className="flex items-center gap-3">
          {wait.priority && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-[12.5px] font-bold text-red-600">
              <span className="h-2 w-2 rounded-full bg-red-500" /> PRIORITY — waiting {wait.label}
            </span>
          )}
          <button onClick={back} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[440px_1fr]">
        {/* LEFT — request details */}
        <div className="flex h-fit flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <h2 className="text-[18px] font-extrabold text-navy-900">Request Details</h2>
            <button onClick={back} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="px-6 py-5">
            <RequestDetailBody lead={lead} />
          </div>
          <div className="border-t border-slate-100 px-6 py-5">
            <button
              onClick={() => routeTo(partners?.[0]?.id || null)}
              disabled={routingId != null}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-navy-800 py-3.5 text-[15px] font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
            >
              {routingId === 'generic' ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Route to Partner <ArrowRight className="h-[18px] w-[18px]" /></>}
            </button>
            <a
              href={`tel:+91${lead.phone}`}
              className="mt-3 flex items-center justify-center gap-1.5 rounded-full border border-slate-300 py-3 text-[14px] font-semibold text-slate-700 transition hover:border-slate-400"
            >
              <Phone className="h-4 w-4" /> Reply Directly
            </a>
          </div>
        </div>

        {/* RIGHT — partner suggestions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {partners == null ? (
            <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-slate-300" /></div>
          ) : needsSeed ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 py-16 text-center">
              <Users className="h-8 w-8 text-slate-300" />
              <h3 className="mt-3 text-[16px] font-bold text-navy-800">No partners onboarded yet</h3>
              <p className="mt-1 max-w-xs text-[13.5px] text-slate-500">Add a sample set of verified partners to start routing requests.</p>
              <button onClick={seed} disabled={seeding} className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Seed sample partners'}
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setBrowseAll(false)}
                  className={`rounded-full px-5 py-2.5 text-[13px] font-bold tracking-wide transition ${!browseAll ? 'bg-navy-800 text-white' : 'border border-slate-200 text-slate-600'}`}
                >
                  SUGGESTED PARTNERS ({Math.min(3, partners.length)})
                </button>
                <button
                  onClick={() => setBrowseAll(true)}
                  className={`rounded-full px-5 py-2.5 text-[13px] font-bold tracking-wide transition ${browseAll ? 'bg-navy-800 text-white' : 'border border-slate-200 text-slate-600'}`}
                >
                  BROWSE ALL {catLabel.toUpperCase()} PARTNERS ({partners.length})
                </button>
              </div>
              <p className="mt-4 text-[13.5px] text-slate-500">
                Best-fit verified {catLabel} partners based on locality, availability, and past performance.
              </p>

              <div className="mt-5 space-y-4">
                {shown.map((p) => (
                  <PartnerCard key={p.id} p={p} onRoute={() => routeTo(p.id)} routing={routingId === p.id} disabled={routingId != null} />
                ))}
              </div>

              {!browseAll && partners.length > 3 && (
                <div className="mt-6 border-t border-slate-100 pt-5 text-center">
                  <button onClick={() => setBrowseAll(true)} className="inline-flex items-center gap-1.5 text-[14px] font-bold text-brand hover:underline">
                    Not the right fit? Browse all {partners.length} {catLabel} partners <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function PartnerCard({ p, onRoute, routing, disabled }) {
  const Icon = CAT_ICON[p.category] || Building2
  return (
    <div className={`rounded-2xl border p-5 transition ${p.topMatch ? 'border-2 border-emerald-500' : 'border-slate-200'}`}>
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500">
          <Icon className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[16px] font-bold text-navy-900">{p.name}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className={`rounded px-2 py-0.5 text-[10.5px] font-bold tracking-wide ${p.topMatch ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {p.topMatch ? `TOP MATCH — ${p.matchPct}%` : `${p.matchPct}% MATCH`}
                </span>
                {p.verified && (
                  <span className="rounded-full border border-emerald-300 px-2 py-0.5 text-[10.5px] font-bold tracking-wide text-emerald-600">VERIFIED</span>
                )}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="flex items-center gap-1 text-[15px] font-bold text-navy-900">
                <Star className={`h-4 w-4 ${p.topMatch ? 'fill-emerald-500 text-emerald-500' : 'fill-amber-400 text-amber-400'}`} /> {p.rating}
              </p>
              <p className="text-[11.5px] text-slate-400">{p.cases} CASES</p>
            </div>
          </div>

          <p className="mt-2 text-[13.5px] text-slate-600">
            {p.specialty} · {p.experience} yrs experience · {p.locality} · Team of {p.teamSize}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <LocalityChip kind={p.localityMatch} />
            {p.specialtyMatch && <Chip ok>Service specialty</Chip>}
            <AvailabilityChip availability={p.availability} label={p.availabilityLabel} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-[13px] text-slate-400">{p.avgResponseHours}h avg response</span>
        <button
          onClick={onRoute}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-full bg-navy-800 px-5 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-navy-700 disabled:opacity-50"
        >
          {routing ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Route to this Partner <ArrowRight className="h-4 w-4" /></>}
        </button>
      </div>
    </div>
  )
}

function LocalityChip({ kind }) {
  if (kind === 'match') return <Chip ok>Locality match</Chip>
  if (kind === 'adjacent') return <Chip ok>Adjacent locality</Chip>
  return <Chip bad>Different locality</Chip>
}
function AvailabilityChip({ availability, label }) {
  if (availability === 'now') return <Chip ok>{label}</Chip>
  const Icon = availability === 'tomorrow' ? CalendarX : Clock
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-[12px] font-medium text-slate-500">
      <Icon className="h-3.5 w-3.5" /> {label}
    </span>
  )
}
function Chip({ ok, bad, children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-medium ${ok ? 'bg-emerald-50 text-emerald-700' : bad ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'}`}>
      {ok ? <Check className="h-3.5 w-3.5" /> : bad ? <X className="h-3.5 w-3.5" /> : null}
      {children}
    </span>
  )
}

function waitInfo(createdAt) {
  const ms = Date.now() - new Date(createdAt).getTime()
  const mins = Math.floor(ms / 60000)
  const label = mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`
  return { label, priority: ms >= FOUR_HOURS }
}
function titleCase(s = '') {
  return String(s).replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
