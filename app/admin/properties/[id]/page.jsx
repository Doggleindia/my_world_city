'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { compressImage } from '@/lib/image'
import {
  Loader2, ChevronRight, MapPin, Upload, Phone, Mail, Clock, Check,
} from 'lucide-react'
import { useAdminStats } from '../../layout'

const AMENITIES = ['Clubhouse', 'Security', 'Gated Community', 'Swimming Pool', 'Gym', 'Lift', 'Power Backup', 'Water 24×7', 'Landscaped Park', 'Solar Panels']
const CATEGORIES = ['Residential', 'Commercial', 'Industrial', 'Farm & Agri']

export default function PropertyEditor() {
  const { id } = useParams()
  const router = useRouter()
  const stats = useAdminStats()
  const [p, setP] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetch(`/api/admin/properties/${id}`).then((r) => r.json()).then((d) => setP(d.property || null))
  }, [id])

  const set = (k, v) => setP((s) => ({ ...s, [k]: v }))
  const setLoc = (k, v) => setP((s) => ({ ...s, location: { ...s.location, [k]: v } }))
  const setDet = (k, v) => setP((s) => ({ ...s, details: { ...s.details, [k]: v } }))
  const toggleAmenity = (a) => setP((s) => ({ ...s, amenities: s.amenities.includes(a) ? s.amenities.filter((x) => x !== a) : [...s.amenities, a] }))

  const save = useCallback(async (patch) => {
    setSaving(true)
    const body = patch || {
      title: p.title, category: p.category, subType: p.subType, price: p.price === '' ? undefined : Number(p.price),
      address: p.address, pincode: p.pincode, description: p.description,
      location: p.location, amenities: p.amenities, gallery: p.gallery,
      featured: p.featured, verified: p.verified, flagged: p.flagged, details: p.details,
    }
    const res = await fetch(`/api/admin/properties/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setSaving(false)
    if (res.ok) { setToast('Saved'); stats?.refresh?.(); setTimeout(() => setToast(''), 1800) }
    return res.ok
  }, [p, id, stats])

  const uploadPhoto = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', await compressImage(file))
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const d = await res.json()
      if (res.ok) setP((s) => s.gallery.main ? { ...s, gallery: { ...s.gallery, thumbs: [...s.gallery.thumbs, d.url].slice(0, 20) } } : { ...s, gallery: { ...s.gallery, main: d.url } })
    } finally { setUploading(false) }
  }

  const del = async () => {
    if (!confirm('Delete this property permanently?')) return
    await fetch(`/api/admin/properties/${id}`, { method: 'DELETE' })
    stats?.refresh?.(); router.push('/admin/properties')
  }

  if (!p) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>

  const statusMeta = { active: ['LIVE', 'bg-emerald-100 text-emerald-700'], pending: ['PENDING', 'bg-amber-100 text-amber-700'], rejected: ['REJECTED', 'bg-red-100 text-red-600'] }[p.status] || [p.status.toUpperCase(), 'bg-slate-100 text-slate-600']

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[14px] font-medium">
          <Link href="/admin/properties" className="text-slate-400 hover:text-slate-600">All Properties</Link>
          <ChevronRight className="h-4 w-4 text-slate-300" />
          <span className="font-bold text-navy-800">{p.title} ({p.code})</span>
          <span className={`rounded px-2 py-0.5 text-[10.5px] font-bold ${statusMeta[1]}`}>{statusMeta[0]}</span>
        </p>
        <div className="flex items-center gap-2.5">
          <button onClick={() => save({ status: p.status === 'active' ? 'pending' : 'active' }).then(() => setP((s) => ({ ...s, status: s.status === 'active' ? 'pending' : 'active' })))} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-[13.5px] font-semibold text-navy-800 hover:border-slate-400">
            {p.status === 'active' ? 'Unpublish' : 'Publish'}
          </button>
          <button onClick={del} className="rounded-full border border-red-300 px-4 py-2 text-[13.5px] font-semibold text-red-600 hover:bg-red-50">Delete</button>
          <button onClick={() => save()} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-navy-800 px-5 py-2 text-[13.5px] font-semibold text-white hover:bg-navy-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : toast ? <><Check className="h-4 w-4" /> {toast}</> : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* MAIN FORM */}
        <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Section title="Basic Info">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Property Title"><input value={p.title} onChange={(e) => set('title', e.target.value)} className={inp} /></Field>
              <Field label="Property ID"><input value={p.code} disabled className={`${inp} bg-slate-50 text-slate-400`} /></Field>
              <Field label="Type">
                <select value={p.category} onChange={(e) => set('category', e.target.value)} className={inp}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
              </Field>
              <Field label="Sub-type"><input value={p.subType} onChange={(e) => set('subType', e.target.value)} placeholder="e.g. Villa" className={inp} /></Field>
            </div>
            <div className="mt-4 flex flex-wrap gap-8">
              <Toggle label="Featured" on={p.featured} onClick={() => set('featured', !p.featured)} />
              <Toggle label="Verified" on={p.verified} onClick={() => set('verified', !p.verified)} />
              <Toggle label="Flagged" on={p.flagged} onClick={() => set('flagged', !p.flagged)} />
            </div>
          </Section>

          <Section title="Location">
            <Field label="Full Address"><input value={p.address} onChange={(e) => set('address', e.target.value)} className={inp} /></Field>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field label="City"><input value={p.location.city} onChange={(e) => setLoc('city', e.target.value)} className={inp} /></Field>
              <Field label="Pincode"><input value={p.pincode} onChange={(e) => set('pincode', e.target.value)} className={inp} /></Field>
              <Field label="Locality"><input value={p.location.locality} onChange={(e) => setLoc('locality', e.target.value)} className={inp} /></Field>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
              <a
                href={p.location.lat && p.location.lng ? `https://www.google.com/maps?q=${p.location.lat},${p.location.lng}` : `https://www.google.com/maps/search/${encodeURIComponent([p.location.locality, p.location.city].filter(Boolean).join(' '))}`}
                target="_blank"
                className="flex h-40 items-center justify-center bg-slate-100 text-[13.5px] font-semibold text-brand transition hover:bg-slate-200"
              >
                <MapPin className="mr-2 h-5 w-5" /> Open location in Google Maps
              </a>
              <div className="grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100">
                <Field label="Latitude" pad><input value={p.location.lat} onChange={(e) => setLoc('lat', e.target.value)} className={inpBare} /></Field>
                <Field label="Longitude" pad><input value={p.location.lng} onChange={(e) => setLoc('lng', e.target.value)} className={inpBare} /></Field>
              </div>
            </div>
          </Section>

          <Section title="Property Details">
            <div className="grid gap-4 sm:grid-cols-4">
              <Field label="Bedrooms"><input value={p.details.bedrooms} onChange={(e) => setDet('bedrooms', e.target.value)} className={inp} /></Field>
              <Field label="Bathrooms"><input value={p.details.bathrooms} onChange={(e) => setDet('bathrooms', e.target.value)} className={inp} /></Field>
              <Field label="Parking"><input value={p.details.parking} onChange={(e) => setDet('parking', e.target.value)} placeholder="2 Covered" className={inp} /></Field>
              <Field label="Facing"><input value={p.details.facing} onChange={(e) => setDet('facing', e.target.value)} placeholder="East" className={inp} /></Field>
              <Field label="Carpet Area"><input value={p.details.carpetArea} onChange={(e) => setDet('carpetArea', e.target.value)} placeholder="1850 sqft" className={inp} /></Field>
              <Field label="Built-up Area"><input value={p.details.builtUpArea} onChange={(e) => setDet('builtUpArea', e.target.value)} placeholder="2100 sqft" className={inp} /></Field>
              <Field label="Age"><input value={p.details.age} onChange={(e) => setDet('age', e.target.value)} placeholder="2 Years" className={inp} /></Field>
              <Field label="Possession"><input value={p.details.possession} onChange={(e) => setDet('possession', e.target.value)} placeholder="Ready to move" className={inp} /></Field>
            </div>
          </Section>

          <Section title="Description & Amenities">
            <Field label="Public Description"><textarea rows={5} value={p.description} onChange={(e) => set('description', e.target.value)} className={`${inp} resize-none`} /></Field>
            <p className="mt-4 mb-2 text-[13px] font-semibold text-slate-500">Amenities</p>
            <div className="flex flex-wrap gap-2.5">
              {AMENITIES.map((a) => {
                const on = p.amenities.includes(a)
                return (
                  <button key={a} onClick={() => toggleAmenity(a)} className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition ${on ? 'bg-navy-800 text-white' : 'border border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                    {on && <Check className="h-3.5 w-3.5" />}{a}
                  </button>
                )
              })}
            </div>
          </Section>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Photos ({1 + (p.gallery.thumbs?.length || 0) - (p.gallery.main ? 0 : 1)})</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[p.gallery.main, ...(p.gallery.thumbs || [])].filter(Boolean).slice(0, 4).map((src, i) => (
                <img key={i} src={src} alt="" className="h-24 w-full rounded-lg object-cover" />
              ))}
            </div>
            <label className="mt-3 flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-5 text-slate-500 hover:border-brand hover:text-brand">
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
              <span className="text-[12.5px] font-medium">Upload New</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadPhoto(e.target.files?.[0])} />
            </label>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Pricing &amp; Valuation</p>
            <Field label="Listed Price" pad><input value={p.price} onChange={(e) => set('price', e.target.value)} className={inp} /></Field>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Field label="Price / sqft"><input value={p.details.priceSqft} onChange={(e) => setDet('priceSqft', e.target.value)} className={inp} /></Field>
              <Field label="Booking"><input value={p.details.booking} onChange={(e) => setDet('booking', e.target.value)} className={inp} /></Field>
            </div>
            <div className="mt-3"><Toggle label="Negotiable" on={p.details.negotiable} onClick={() => setDet('negotiable', !p.details.negotiable)} /></div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Activity</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div><p className="text-[11px] uppercase tracking-wide text-slate-400">Views</p><p className="text-[24px] font-extrabold text-navy-900">{p.views.toLocaleString()}</p></div>
              <div><p className="text-[11px] uppercase tracking-wide text-slate-400">Enquiries</p><p className="text-[24px] font-extrabold text-navy-900">{p.enquiries}</p></div>
            </div>
          </div>

          {p.owner && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-brand/10 text-[13px] font-bold text-brand">{(p.owner.name || 'O').slice(0, 2).toUpperCase()}</span>
                <div>
                  <p className="text-[15px] font-bold text-navy-900">{p.owner.name}</p>
                  <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">OWNER</span>
                </div>
              </div>
              <div className="mt-3 space-y-1.5 text-[13px] text-slate-600">
                {p.owner.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-slate-400" /> +91 {p.owner.phone}</p>}
                {p.owner.email && <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-slate-400" /> {p.owner.email}</p>}
                <p className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-slate-400" /> Response time ~2 hrs</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const inp = 'w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[14px] text-slate-800 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20'
const inpBare = 'w-full bg-transparent text-[14px] font-semibold text-navy-800 focus:outline-none'

function Section({ title, children }) {
  return (
    <div>
      <h2 className="mb-4 text-[17px] font-bold text-navy-800">{title}</h2>
      {children}
    </div>
  )
}
function Field({ label, children, pad }) {
  return (
    <label className={`block ${pad ? 'p-3' : ''}`}>
      <span className="mb-1 block text-[12px] font-semibold text-slate-500">{label}</span>
      {children}
    </label>
  )
}
function Toggle({ label, on, onClick }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[13.5px] font-semibold text-slate-700">{label}</span>
      <button onClick={onClick} className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-brand' : 'bg-slate-300'}`} aria-pressed={on}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  )
}
