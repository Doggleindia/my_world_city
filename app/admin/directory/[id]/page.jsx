'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Loader2, ChevronRight, Star, Phone, Mail, MapPin, ExternalLink, Check, Trash2,
} from 'lucide-react'

const STATUS_META = {
  verified: ['Verified', 'bg-emerald-100 text-emerald-700'],
  pending: ['Pending', 'bg-amber-100 text-amber-700'],
  suspended: ['Suspended', 'bg-red-100 text-red-600'],
  draft: ['Draft', 'bg-slate-100 text-slate-600'],
}
const CATEGORIES = ['Architecture', 'Interior Design', 'Legal', 'Vastu Consultant', 'Surveyor', 'Contractor', 'Solar', 'Govt Liaison']

export default function ExpertDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [e, setE] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetch(`/api/admin/directory/${id}`).then((r) => r.json()).then((d) => setE(d.expert || null))
  }, [id])

  const set = (k, v) => setE((s) => ({ ...s, [k]: v }))

  const save = useCallback(async (patch) => {
    setSaving(true)
    const body = patch || {
      name: e.name, role: e.role, cat: e.cat, specialty: e.specialty, location: e.location,
      intro: e.intro, phone: e.phone, email: e.email, experienceYears: e.experienceYears,
      serviceAreas: e.serviceAreas, specialties: e.specialties, featured: e.featured, rating: e.rating, cases: e.cases,
    }
    const res = await fetch(`/api/admin/directory/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setSaving(false)
    if (res.ok) { setToast('Saved'); setTimeout(() => setToast(''), 1600) }
    return res.ok
  }, [e, id])

  const setStatus = async (status) => { await save({ status }); setE((s) => ({ ...s, status, verified: status === 'verified' })) }

  const del = async () => {
    if (!confirm('Delete this expert permanently?')) return
    await fetch(`/api/admin/directory/${id}`, { method: 'DELETE' })
    router.push('/admin/directory')
  }

  if (!e) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>

  const [label, cls] = STATUS_META[e.status] || STATUS_META.pending

  return (
    <div className="mx-auto max-w-[1200px]">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[14px] font-medium">
          <Link href="/admin/directory" className="text-slate-400 hover:text-slate-600">Expert Directory</Link>
          <ChevronRight className="h-4 w-4 text-slate-300" />
          <span className="font-bold text-navy-800">{e.name} ({e.code})</span>
          <span className={`rounded px-2 py-0.5 text-[10.5px] font-bold ${cls}`}>{label}</span>
        </p>
        <div className="flex items-center gap-2.5">
          {e.status !== 'verified' && <button onClick={() => setStatus('verified')} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-emerald-600"><Check className="h-4 w-4" /> Verify</button>}
          {e.status !== 'suspended' && <button onClick={() => setStatus('suspended')} className="rounded-full border border-amber-300 px-4 py-2 text-[13.5px] font-semibold text-amber-600 hover:bg-amber-50">Suspend</button>}
          {e.status === 'suspended' && <button onClick={() => setStatus('pending')} className="rounded-full border border-slate-300 px-4 py-2 text-[13.5px] font-semibold text-navy-800 hover:border-slate-400">Reinstate</button>}
          <button onClick={del} className="rounded-full border border-red-300 px-4 py-2 text-[13.5px] font-semibold text-red-600 hover:bg-red-50">Delete</button>
          <button onClick={() => save()} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-navy-800 px-5 py-2 text-[13.5px] font-semibold text-white hover:bg-navy-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : toast ? <><Check className="h-4 w-4" /> {toast}</> : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* left profile card */}
        <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          {e.photo ? <img src={e.photo} alt="" className="mx-auto h-24 w-24 rounded-full object-cover" /> : <span className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-brand/10 text-[24px] font-bold text-brand">{e.initials}</span>}
          <p className="mt-3 text-[19px] font-extrabold text-navy-900">{e.name}</p>
          <p className="text-[13.5px] text-slate-500">{e.role}</p>
          {e.featured && <span className="mt-2 inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">★ Featured</span>}

          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
            <Metric value={e.rating || '—'} label="Rating" icon={Star} />
            <Metric value={e.cases} label="Cases" />
            <Metric value={e.assigned} label="Assigned" />
          </div>

          <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-left text-[13px] text-slate-600">
            {e.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-slate-400" /> +91 {e.phone}</p>}
            {e.email && <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-slate-400" /> {e.email}</p>}
            {e.location && <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {e.location}</p>}
          </div>

          <Link href={`/experts/${e.slug}`} target="_blank" className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-slate-300 py-2.5 text-[13px] font-semibold text-navy-800 hover:border-brand">
            View public profile <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* right edit form */}
        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="mb-4 text-[16px] font-bold text-navy-800">Profile</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name"><input value={e.name} onChange={(ev) => set('name', ev.target.value)} className={inp} /></Field>
              <Field label="Professional Title"><input value={e.role} onChange={(ev) => set('role', ev.target.value)} className={inp} /></Field>
              <Field label="Expert Type"><select value={e.cat} onChange={(ev) => set('cat', ev.target.value)} className={inp}>{[e.cat, ...CATEGORIES.filter((c) => c !== e.cat)].map((c) => <option key={c}>{c}</option>)}</select></Field>
              <Field label="Sub-specialty"><input value={e.specialty} onChange={(ev) => set('specialty', ev.target.value)} className={inp} /></Field>
              <Field label="Experience (years)"><input value={e.experienceYears} onChange={(ev) => set('experienceYears', ev.target.value.replace(/\D/g, ''))} className={inp} /></Field>
              <Field label="Primary Locality"><input value={e.location} onChange={(ev) => set('location', ev.target.value)} className={inp} /></Field>
              <Field label="Phone"><input value={e.phone} onChange={(ev) => set('phone', ev.target.value.replace(/\D/g, ''))} maxLength={10} className={inp} /></Field>
              <Field label="Email"><input value={e.email} onChange={(ev) => set('email', ev.target.value)} className={inp} /></Field>
            </div>
            <Field label="Bio"><textarea rows={3} value={e.intro} onChange={(ev) => set('intro', ev.target.value)} className={`${inp} resize-none`} /></Field>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <h2 className="mb-3 text-[16px] font-bold text-navy-800">Service Areas</h2>
            <TagEditor tags={e.serviceAreas} onChange={(t) => set('serviceAreas', t)} placeholder="Add area…" />
          </div>
          <div className="border-t border-slate-100 pt-5">
            <h2 className="mb-3 text-[16px] font-bold text-navy-800">Specialties</h2>
            <TagEditor tags={e.specialties} onChange={(t) => set('specialties', t)} placeholder="Add specialty…" />
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-5">
            <div><p className="text-[14px] font-bold text-navy-800">Featured Expert</p><p className="text-[12px] text-slate-500">List at the top of the directory search.</p></div>
            <button onClick={() => set('featured', !e.featured)} className={`relative h-6 w-11 rounded-full ${e.featured ? 'bg-brand' : 'bg-slate-300'}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${e.featured ? 'left-[22px]' : 'left-0.5'}`} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Metric({ value, label, icon: Icon }) {
  return (
    <div>
      <p className="flex items-center justify-center gap-1 text-[18px] font-extrabold text-navy-900">{Icon && <Icon className="h-4 w-4 fill-amber-400 text-amber-400" />}{value}</p>
      <p className="text-[11px] text-slate-400">{label}</p>
    </div>
  )
}
function Field({ label, children }) { return <label className="block"><span className="mb-1 block text-[12px] font-semibold text-slate-500">{label}</span>{children}</label> }
const inp = 'w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[14px] text-slate-800 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20'

function TagEditor({ tags, onChange, placeholder }) {
  const [v, setV] = useState('')
  return (
    <div className="flex flex-wrap gap-2">
      {(tags || []).map((t) => (
        <span key={t} className="inline-flex items-center gap-1.5 rounded-full border border-brand bg-brand/5 px-3 py-1.5 text-[13px] font-semibold text-brand">
          {t}<button onClick={() => onChange(tags.filter((x) => x !== t))}><Trash2 className="h-3 w-3" /></button>
        </span>
      ))}
      <form onSubmit={(ev) => { ev.preventDefault(); if (v.trim() && !tags.includes(v.trim())) { onChange([...tags, v.trim()]); setV('') } }}>
        <input value={v} onChange={(ev) => setV(ev.target.value)} placeholder={placeholder} className="rounded-full border border-dashed border-slate-300 px-3 py-1.5 text-[13px] focus:border-brand focus:outline-none" />
      </form>
    </div>
  )
}
