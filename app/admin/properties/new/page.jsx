'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { compressImage } from '@/lib/image'
import {
  Check, ChevronRight, ArrowRight, ArrowLeft, Loader2, UploadCloud, Trash2, Plus,
  MapPin, Video, FileText, CheckCircle2, Copy, Star, Share2, Send, BarChart3, X,
} from 'lucide-react'

const STEPS = ['Basic Info', 'Location', 'Details', 'Media', 'Pricing & Owner']
const CATEGORIES = ['Residential', 'Commercial', 'Industrial', 'Farm & Agri']
const AMENITIES = ['Clubhouse', '24×7 Security', 'Power Backup', 'Gym', 'Swimming Pool', 'Garden', 'Sports Courts', 'Kids Play Area', 'Visitor Parking']
const FACINGS = ['', 'East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West']
const AGES = ['', 'New / Under construction', '0-1 Years', '1-3 Years', '3-5 Years', '5-10 Years', '10+ Years']
const POSSESSION = ['', 'Ready to move', 'Under construction', 'New launch']
const FURNISHING = ['', 'Unfurnished', 'Semi-furnished', 'Fully furnished']
const OWNERSHIP = ['', 'Freehold', 'Leasehold', 'Co-operative', 'Power of Attorney']
const TITLE_STATUS = ['', 'Clear', 'Under verification', 'Disputed']
const LEGAL_DOCS = [
  ['titleDeed', 'Title Deed', 'Original ownership verification', true],
  ['saleDeed', 'Sale Deed', 'Latest transaction record', true],
  ['rera', 'RERA Certificate', 'Regulatory authority registration', false],
  ['noc', 'NOC Certificate', 'No-Objection clearance from board', false],
  ['buildingPlan', 'Building Plan', 'Approved structural blueprint', false],
]

const emptyForm = {
  title: '', category: 'Residential', subType: '', status: 'draft', listingType: 'buy',
  verified: false, featured: false, rera: false, reraNumber: '', listedDate: '', description: '',
  address: '', pincode: '', location: { locality: '', city: 'Jaipur', lat: '', lng: '', landmark: '' },
  details: { bedrooms: '', bathrooms: '', balconies: '', parking: '', totalFloors: '', floorNumber: '', facing: '', age: '', possession: '', furnishing: '', ownership: '', titleStatus: '', carpetArea: '', builtUpArea: '', superArea: '', priceSqft: '', booking: '', maintenance: '' },
  amenities: [], landmarks: [{ name: '', distance: '', unit: 'km', type: 'School' }],
  photos: [], meta: { videoUrl: '', floorPlan: '', legalDocs: {}, contactPrefs: { showPhone: true, showEmail: false }, routing: 'concierge', listingExpiry: '90', autoRenew: true, notifyLowPerf: true, displayFormat: 'absolute' },
  price: '', negotiable: true,
  owner: { name: '', phone: '', email: '', ownerType: 'Individual', pan: '', isRegistered: false },
}

export default function AddPropertyWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(emptyForm)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const saved = useRef(false)

  // restore + autosave draft to localStorage
  useEffect(() => {
    try { const s = localStorage.getItem('mwc-add-property'); if (s) setForm({ ...emptyForm, ...JSON.parse(s) }) } catch {}
  }, [])
  useEffect(() => {
    const t = setInterval(() => { try { localStorage.setItem('mwc-add-property', JSON.stringify(form)) } catch {} }, 30000)
    return () => clearInterval(t)
  }, [form])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const setIn = (obj, k, v) => setForm((f) => ({ ...f, [obj]: { ...f[obj], [k]: v } }))

  const buildPayload = (status) => ({
    ...form, status,
    rera: !!form.reraNumber.trim(),
    price: form.price === '' ? undefined : Number(form.price),
    priceLabel: priceLabel(Number(form.price)),
    gallery: { main: form.photos[0]?.url || '', thumbs: form.photos.slice(1).map((p) => p.url) },
    details: { ...form.details, negotiable: form.negotiable },
    meta: { ...form.meta, ownerType: form.owner.ownerType, pan: form.owner.pan, captions: form.photos.map((p) => p.caption || '') },
  })

  const submit = async (status) => {
    setBusy(true)
    const res = await fetch('/api/admin/properties', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buildPayload(status)) })
    const data = await res.json()
    setBusy(false)
    if (!res.ok) { alert(data.error || 'Could not save'); return null }
    saved.current = true
    try { localStorage.removeItem('mwc-add-property') } catch {}
    return data
  }

  const saveDraft = async () => { const r = await submit('draft'); if (r) router.push(`/admin/properties/${r.id}`) }
  const publish = async () => { const r = await submit('active'); if (r) setResult(r) }

  if (result) return <Success result={result} form={form} onAnother={() => { setResult(null); setForm(emptyForm); setStep(1) }} />

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-[14px] font-medium text-slate-400">
          <Link href="/admin" className="hover:text-slate-600">Home</Link> <ChevronRight className="h-4 w-4" />
          <Link href="/admin/properties" className="hover:text-slate-600">Properties</Link> <ChevronRight className="h-4 w-4" />
          <span className="font-bold text-navy-800 underline">Add New</span>
        </p>
        <p className="text-[13px] text-slate-400">Step {step} of 5 · <span className="font-semibold text-navy-800">{STEPS[step - 1]}</span> · <span className="text-emerald-600">Auto-saving ✓</span></p>
      </div>

      {/* stepper */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center">
          {STEPS.map((s, i) => {
            const n = i + 1
            const done = n < step; const active = n === step
            return (
              <div key={s} className="flex flex-1 items-center last:flex-none">
                <div className="flex items-center gap-2.5">
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[13px] font-bold ${done ? 'bg-emerald-500 text-white' : active ? 'bg-navy-800 text-white' : 'border border-slate-300 text-slate-400'}`}>
                    {done ? <Check className="h-4 w-4" /> : n}
                  </span>
                  <span className={`hidden text-[13.5px] font-semibold sm:block ${active ? 'text-navy-800' : done ? 'text-slate-600' : 'text-slate-400'}`}>{s}</span>
                </div>
                {n < STEPS.length && <div className={`mx-3 h-0.5 flex-1 ${done ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
              </div>
            )
          })}
        </div>
      </div>

      {/* body */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {step === 1 && <Step1 form={form} set={set} setIn={setIn} />}
        {step === 2 && <Step2 form={form} set={set} setIn={setIn} />}
        {step === 3 && <Step3 form={form} set={set} setIn={setIn} setForm={setForm} />}
        {step === 4 && <Step4 form={form} setForm={setForm} setIn={setIn} />}
        {step === 5 && <Step5 form={form} set={set} setIn={setIn} />}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">
          <button onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}
            className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-slate-600 hover:text-navy-800 disabled:opacity-0">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-4">
            <button onClick={saveDraft} disabled={busy} className="text-[14px] font-semibold text-slate-500 hover:text-navy-800">Save as Draft</button>
            {step < 5 ? (
              <button onClick={() => setStep((s) => s + 1)} className="inline-flex items-center gap-2 rounded-full bg-navy-800 px-6 py-3 text-[14px] font-semibold text-white hover:bg-navy-700">
                Continue to {STEPS[step]} <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <div className="flex flex-col items-end gap-1.5">
                <button onClick={publish} disabled={busy || !canPublish(form)} className="inline-flex items-center gap-2 rounded-full bg-navy-800 px-6 py-3 text-[14px] font-semibold text-white hover:bg-navy-700 disabled:opacity-50">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Publish <ArrowRight className="h-4 w-4" /></>}
                </button>
                {!canPublish(form) && <span className="text-[12px] text-slate-400">Add a property title and a valid owner name + 10-digit phone to publish.</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------- Steps ---------------- */

function Step1({ form, set, setIn }) {
  return (
    <div>
      <H title="Basic Information" sub="Start by providing the essential identification and classification details for this listing." />
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Field label="Property Title"><input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Luxury 3BHK Penthouse in Malviya Nagar" className={inp} /></Field>
        <Field label="Property ID (System Generated)"><input value="Auto-assigned on save" disabled className={`${inp} bg-brand/5 text-slate-400`} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Property Type"><Select value={form.category} onChange={(v) => set('category', v)} options={CATEGORIES} /></Field>
          <Field label="Sub-type"><input value={form.subType} onChange={(e) => set('subType', e.target.value)} placeholder="Apartment" className={inp} /></Field>
        </div>
        <Field label="Listing Status"><Select value={form.status} onChange={(v) => set('status', v)} options={[['draft', 'Draft'], ['pending', 'Pending Review'], ['active', 'Active']]} /></Field>
        <div>
          <Label>Listing Intent</Label>
          <div className="mt-2 flex gap-6">
            {[['buy', 'For Sale'], ['rent', 'For Rent']].map(([v, l]) => (
              <label key={v} className="flex cursor-pointer items-center gap-2 text-[14px] font-medium text-slate-700">
                <input type="radio" checked={form.listingType === v} onChange={() => set('listingType', v)} className="h-4 w-4 text-brand focus:ring-brand" /> {l}
              </label>
            ))}
          </div>
        </div>
        <ToggleCard title="Verified by MWC?" sub="Physical inspection completed" on={form.verified} onClick={() => set('verified', !form.verified)} />
        <ToggleCard title="Featured Listing?" sub="Promote this on the homepage" on={form.featured} onClick={() => set('featured', !form.featured)} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="RERA Number"><input value={form.reraNumber} onChange={(e) => set('reraNumber', e.target.value)} placeholder="RAJ-RERA-2024-…" className={inp} /></Field>
          <Field label="Listed Date"><input type="date" value={form.listedDate} onChange={(e) => set('listedDate', e.target.value)} className={inp} /></Field>
        </div>
      </div>
      <div className="mt-5">
        <div className="flex items-center justify-between"><Label>Short Description</Label><span className="text-[12px] text-slate-400">{form.description.length}/200</span></div>
        <textarea rows={4} maxLength={200} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Briefly describe the key selling points of this property…" className={`${inp} mt-1 resize-none`} />
      </div>
    </div>
  )
}

function Step2({ form, set, setIn }) {
  return (
    <div>
      <H title="Location & Address" sub="Provide precise location data to help buyers find the property easily on our maps." />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <Field label="Full Address"><textarea rows={3} value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Enter house number, street, and colony name…" className={`${inp} resize-none`} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Locality"><input value={form.location.locality} onChange={(e) => setIn('location', 'locality', e.target.value)} placeholder="Locality" className={inp} /></Field>
            <Field label="Landmark"><input value={form.location.landmark} onChange={(e) => setIn('location', 'landmark', e.target.value)} placeholder="e.g. Near Akshaya Patra Temple" className={inp} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="City"><input value={form.location.city} onChange={(e) => setIn('location', 'city', e.target.value)} className={`${inp} bg-brand/5`} /></Field>
            <Field label="Pincode"><input value={form.pincode} onChange={(e) => set('pincode', e.target.value)} placeholder="3020XX" className={inp} /></Field>
          </div>
          <div className="border-t border-slate-100 pt-4">
            <Label>Exact Coordinates</Label>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <input value={form.location.lat} onChange={(e) => setIn('location', 'lat', e.target.value)} placeholder="LAT 26.9124" className={inp} />
              <input value={form.location.lng} onChange={(e) => setIn('location', 'lng', e.target.value)} placeholder="LONG 75.7873" className={inp} />
            </div>
          </div>
        </div>
        <a
          href={form.location.lat && form.location.lng ? `https://www.google.com/maps?q=${form.location.lat},${form.location.lng}` : `https://www.google.com/maps/search/${encodeURIComponent([form.location.locality, form.location.city].filter(Boolean).join(' '))}`}
          target="_blank"
          className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-500 transition hover:bg-slate-200"
        >
          <MapPin className="h-8 w-8 text-brand" />
          <p className="mt-2 text-[13.5px] font-semibold text-brand">Open in Google Maps</p>
          <p className="text-[12px]">Enter coordinates for a precise pin</p>
        </a>
      </div>
    </div>
  )
}

function Step3({ form, set, setIn, setForm }) {
  const setDet = (k, v) => setIn('details', k, v)
  const toggleAmenity = (a) => setForm((f) => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a] }))
  const setLand = (i, k, v) => setForm((f) => ({ ...f, landmarks: f.landmarks.map((l, j) => (j === i ? { ...l, [k]: v } : l)) }))
  const addLand = () => setForm((f) => ({ ...f, landmarks: [...f.landmarks, { name: '', distance: '', unit: 'km', type: 'School' }] }))
  const delLand = (i) => setForm((f) => ({ ...f, landmarks: f.landmarks.filter((_, j) => j !== i) }))
  return (
    <div>
      <H title="Property Details & Specifications" sub="Provide comprehensive technical data and inventory specifications for the property listing." />
      <SubH>Core Specifications</SubH>
      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="Bedrooms"><input value={form.details.bedrooms} onChange={(e) => setDet('bedrooms', e.target.value)} placeholder="e.g. 3" className={inp} /></Field>
        <Field label="Bathrooms"><input value={form.details.bathrooms} onChange={(e) => setDet('bathrooms', e.target.value)} placeholder="e.g. 2" className={inp} /></Field>
        <Field label="Balconies"><input value={form.details.balconies} onChange={(e) => setDet('balconies', e.target.value)} placeholder="e.g. 1" className={inp} /></Field>
        <Field label="Parking Spaces"><input value={form.details.parking} onChange={(e) => setDet('parking', e.target.value)} placeholder="e.g. 2" className={inp} /></Field>
        <Field label="Total Floors"><input value={form.details.totalFloors} onChange={(e) => setDet('totalFloors', e.target.value)} placeholder="Max Floors" className={inp} /></Field>
        <Field label="Floor Number"><input value={form.details.floorNumber} onChange={(e) => setDet('floorNumber', e.target.value)} placeholder="Unit Floor" className={inp} /></Field>
        <Field label="Facing"><Select value={form.details.facing} onChange={(v) => setDet('facing', v)} options={FACINGS.map((f) => [f, f || 'Select Direction'])} /></Field>
        <Field label="Age of Property"><Select value={form.details.age} onChange={(v) => setDet('age', v)} options={AGES.map((f) => [f, f || 'Select Age'])} /></Field>
        <Field label="Possession Status"><Select value={form.details.possession} onChange={(v) => setDet('possession', v)} options={POSSESSION.map((f) => [f, f || 'Select Status'])} /></Field>
        <Field label="Furnishing"><Select value={form.details.furnishing} onChange={(v) => setDet('furnishing', v)} options={FURNISHING.map((f) => [f, f || 'Select Furnishing'])} /></Field>
        <Field label="Ownership Type"><Select value={form.details.ownership} onChange={(v) => setDet('ownership', v)} options={OWNERSHIP.map((f) => [f, f || 'Select Ownership'])} /></Field>
        <Field label="Title Status"><Select value={form.details.titleStatus} onChange={(v) => setDet('titleStatus', v)} options={TITLE_STATUS.map((f) => [f, f || 'Select Status'])} /></Field>
      </div>

      <SubH>Area Measurement</SubH>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Carpet Area"><input value={form.details.carpetArea} onChange={(e) => setDet('carpetArea', e.target.value)} placeholder="Value (sq ft)" className={inp} /></Field>
        <Field label="Built-up Area"><input value={form.details.builtUpArea} onChange={(e) => setDet('builtUpArea', e.target.value)} placeholder="Value (sq ft)" className={inp} /></Field>
        <Field label="Super Area"><input value={form.details.superArea} onChange={(e) => setDet('superArea', e.target.value)} placeholder="Value (sq ft)" className={inp} /></Field>
      </div>

      <div className="mt-6 flex items-center justify-between"><SubH inline>Amenities &amp; Features</SubH><span className="text-[12px] text-slate-400">Select all that apply</span></div>
      <div className="flex flex-wrap gap-2.5">
        {AMENITIES.map((a) => {
          const on = form.amenities.includes(a)
          return <button key={a} onClick={() => toggleAmenity(a)} className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${on ? 'bg-navy-800 text-white' : 'border border-slate-200 text-slate-600 hover:border-slate-300'}`}>{a}</button>
        })}
      </div>

      <SubH>Proximity &amp; Landmarks</SubH>
      <div className="space-y-3">
        {form.landmarks.map((l, i) => (
          <div key={i} className="grid grid-cols-1 items-end gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 sm:grid-cols-[1fr_100px_90px_1fr_40px]">
            <Field label="Landmark Name"><input value={l.name} onChange={(e) => setLand(i, 'name', e.target.value)} placeholder="e.g. Apollo Hospital" className={inpSm} /></Field>
            <Field label="Distance"><input value={l.distance} onChange={(e) => setLand(i, 'distance', e.target.value)} placeholder="0.0" className={inpSm} /></Field>
            <Field label="Unit"><Select value={l.unit} onChange={(v) => setLand(i, 'unit', v)} options={['km', 'm', 'min']} sm /></Field>
            <Field label="Type"><Select value={l.type} onChange={(v) => setLand(i, 'type', v)} options={['School', 'Hospital', 'Metro', 'Mall', 'Airport', 'Office Hub']} sm /></Field>
            <button onClick={() => delLand(i)} className="mb-1 grid h-9 w-9 place-items-center rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        <button onClick={addLand} className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-4 py-2 text-[13px] font-semibold text-navy-800 hover:border-brand"><Plus className="h-4 w-4" /> Add another landmark</button>
      </div>
    </div>
  )
}

function Step4({ form, setForm, setIn }) {
  const [uploading, setUploading] = useState(false)
  const addPhotos = async (files) => {
    setUploading(true)
    for (const file of Array.from(files || []).slice(0, 15)) {
      try {
        const fd = new FormData(); fd.append('file', await compressImage(file))
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const d = await res.json()
        if (res.ok) setForm((f) => ({ ...f, photos: [...f.photos, { url: d.url, caption: '' }].slice(0, 15) }))
      } catch {}
    }
    setUploading(false)
  }
  const setCaption = (i, v) => setForm((f) => ({ ...f, photos: f.photos.map((p, j) => (j === i ? { ...p, caption: v } : p)) }))
  const delPhoto = (i) => setForm((f) => ({ ...f, photos: f.photos.filter((_, j) => j !== i) }))
  const uploadDoc = async (key, file) => {
    if (!file) return
    const fd = new FormData(); fd.append('file', await compressImage(file))
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const d = await res.json()
    if (res.ok) setForm((f) => ({ ...f, meta: { ...f.meta, legalDocs: { ...f.meta.legalDocs, [key]: d.url } } }))
  }
  const count = form.photos.length
  return (
    <div>
      <div className="flex items-center justify-between">
        <div><h2 className="text-[19px] font-bold text-navy-800">Property Gallery</h2><p className="text-[13.5px] text-slate-500">Upload high-resolution images. JPG, PNG supported.</p></div>
        <span className="rounded-lg bg-brand/10 px-3 py-1 text-[12.5px] font-bold text-brand">{count} / 15 Photos</span>
      </div>
      {count < 8 && <p className="mt-3 rounded-lg bg-red-50 px-4 py-2.5 text-[13px] font-medium text-red-600">Add at least 8 photos to publish this listing on the public marketplace.</p>}

      <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 py-10 text-slate-500 hover:border-brand hover:text-brand">
        {uploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <UploadCloud className="h-8 w-8" />}
        <span className="text-[14px] font-semibold">Drag &amp; drop photos or click to browse</span>
        <span className="text-[12.5px]">Support for multi-file upload up to 2MB each (dev)</span>
        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addPhotos(e.target.files)} />
      </label>

      {count > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {form.photos.map((p, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-slate-200">
              <div className="relative">
                <img src={p.url} alt="" className="h-28 w-full object-cover" />
                {i === 0 && <span className="absolute left-2 top-2 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">★ Cover</span>}
                <button onClick={() => delPhoto(i)} className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white"><X className="h-3 w-3" /></button>
              </div>
              <input value={p.caption} onChange={(e) => setCaption(i, e.target.value)} placeholder="Add caption…" className="w-full border-t border-slate-100 px-2 py-1.5 text-[12px] focus:outline-none" />
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <h3 className="flex items-center gap-2 text-[15px] font-bold text-navy-800"><Video className="h-4 w-4" /> Video Tour</h3>
          <input value={form.meta.videoUrl} onChange={(e) => setIn('meta', 'videoUrl', e.target.value)} placeholder="Paste YouTube or Vimeo URL" className={`${inp} mt-2`} />
        </div>
        <div>
          <h3 className="flex items-center gap-2 text-[15px] font-bold text-navy-800"><FileText className="h-4 w-4" /> Floor Plan</h3>
          <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-[13px] text-slate-500 hover:border-brand">
            <UploadCloud className="h-4 w-4" /> {form.meta.floorPlan ? 'Floor plan uploaded ✓' : 'Upload Floor Plan Image'}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadDoc('floorPlan', e.target.files?.[0])} />
          </label>
        </div>
      </div>

      <SubH>Legal Documents</SubH>
      <div className="space-y-2.5">
        {LEGAL_DOCS.map(([key, name, desc, req]) => {
          const up = form.meta.legalDocs?.[key]
          return (
            <div key={key} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className={`grid h-9 w-9 place-items-center rounded-lg ${up ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}><FileText className="h-4 w-4" /></span>
                <div><p className="text-[14px] font-bold text-navy-800">{name} {req && <span className="text-red-500">*</span>}</p><p className="text-[12px] text-slate-400">{desc}</p></div>
              </div>
              {up ? <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Uploaded</span>
                : <label className="cursor-pointer rounded-full border border-slate-300 px-4 py-1.5 text-[13px] font-semibold text-navy-800 hover:border-brand"><input type="file" accept="image/*" className="hidden" onChange={(e) => uploadDoc(key, e.target.files?.[0])} />Upload</label>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Step5({ form, set, setIn }) {
  const o = form.owner
  const setOwner = (k, v) => setIn('owner', k, v)
  const cp = form.meta.contactPrefs
  return (
    <div>
      <div className="flex items-center justify-between">
        <div><h2 className="text-[16px] font-bold text-brand">Section A: Owner Information</h2><p className="text-[13.5px] text-slate-500">Link this property to a new or existing owner profile.</p></div>
        <ToggleInline label="Is owner already registered?" on={o.isRegistered} onClick={() => setOwner('isRegistered', !o.isRegistered)} />
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Owner Full Name *"><input value={o.name} onChange={(e) => setOwner('name', e.target.value)} placeholder="e.g. Ramesh Kumar" className={inp} /></Field>
        <Field label="Primary Phone *">
          <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 focus-within:border-brand">
            <span className="border-r border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] font-semibold text-slate-600">+91</span>
            <input value={o.phone} onChange={(e) => setOwner('phone', e.target.value.replace(/\D/g, ''))} maxLength={10} placeholder="9876543210" className="w-full px-3 py-2.5 text-[14px] focus:outline-none" />
          </div>
        </Field>
        <Field label="Email Address"><input value={o.email} onChange={(e) => setOwner('email', e.target.value)} placeholder="ramesh@example.com" className={inp} /></Field>
        <Field label="Owner Type"><Select value={o.ownerType} onChange={(v) => setOwner('ownerType', v)} options={['Individual', 'Builder', 'Dealer', 'Company']} /></Field>
        <Field label="PAN Number"><input value={o.pan} onChange={(e) => setOwner('pan', e.target.value.toUpperCase())} placeholder="ABCDE1234F" className={`${inp} sm:col-span-2`} /></Field>
      </div>

      <div className="mt-8 border-t border-slate-100 pt-6">
        <h2 className="text-[16px] font-bold text-brand">Section B: Pricing Details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Listed Price *"><input value={form.price} onChange={(e) => set('price', e.target.value.replace(/[^\d]/g, ''))} placeholder="₹ 0.00" className={inp} />{form.price && <span className="mt-1 block text-[12px] font-semibold text-brand">{priceLabel(Number(form.price))}</span>}</Field>
          <Field label="Display Format"><Select value={form.meta.displayFormat} onChange={(v) => setIn('meta', 'displayFormat', v)} options={[['absolute', 'Absolute Value (Full Amount)'], ['short', 'Short (₹1.42 Cr)']]} /></Field>
          <Field label="Price Per Sq Ft"><input value={form.details.priceSqft} onChange={(e) => setIn('details', 'priceSqft', e.target.value)} placeholder="₹ 4,250" className={inp} /></Field>
          <Field label="Booking Amount"><input value={form.details.booking} onChange={(e) => setIn('details', 'booking', e.target.value)} placeholder="₹ Token amount" className={inp} /></Field>
          <ToggleCard title="Price is Negotiable?" on={form.negotiable} onClick={() => set('negotiable', !form.negotiable)} />
          <Field label="Maintenance / Month"><input value={form.details.maintenance} onChange={(e) => setIn('details', 'maintenance', e.target.value)} placeholder="e.g. 5,000" className={inp} /></Field>
        </div>
      </div>

      <div className="mt-8 grid gap-8 border-t border-slate-100 pt-6 sm:grid-cols-2">
        <div>
          <h2 className="text-[16px] font-bold text-brand">Section C: Contact Prefs</h2>
          <div className="mt-3 space-y-3">
            <ToggleInline label="Show phone publicly on listing" on={cp.showPhone} onClick={() => setIn('meta', 'contactPrefs', { ...cp, showPhone: !cp.showPhone })} />
            <ToggleInline label="Show email publicly on listing" on={cp.showEmail} onClick={() => setIn('meta', 'contactPrefs', { ...cp, showEmail: !cp.showEmail })} />
          </div>
          <Label className="mt-4">Enquiry Routing</Label>
          <div className="mt-2 space-y-2">
            {[['owner', 'Directly to Owner'], ['concierge', 'To MWC Concierge (Recommended)'], ['both', 'Both (Parallel notification)']].map(([v, l]) => (
              <label key={v} className="flex cursor-pointer items-center gap-2 text-[13.5px] text-slate-700"><input type="radio" checked={form.meta.routing === v} onChange={() => setIn('meta', 'routing', v)} className="h-4 w-4 text-brand focus:ring-brand" /> {l}</label>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-[16px] font-bold text-brand">Section D: Visibility Prefs</h2>
          <Field label="Listing Expiry"><Select value={form.meta.listingExpiry} onChange={(v) => setIn('meta', 'listingExpiry', v)} options={[['30', '30 Days'], ['90', '90 Days (Standard)'], ['180', '180 Days'], ['0', 'Never']]} /></Field>
          <div className="mt-3 space-y-3">
            <ToggleInline label="Auto-renew after expiry?" on={form.meta.autoRenew} onClick={() => setIn('meta', 'autoRenew', !form.meta.autoRenew)} />
            <ToggleInline label="Notify me of low performance" on={form.meta.notifyLowPerf} onClick={() => setIn('meta', 'notifyLowPerf', !form.meta.notifyLowPerf)} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Success({ result, form, onAnother }) {
  const url = `myworldcity.com/property/${result.slug}`
  return (
    <div className="mx-auto max-w-[1000px] py-8 text-center">
      <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-600 text-white"><Check className="h-10 w-10" /></span>
      <h1 className="mt-6 text-[34px] font-extrabold text-navy-900">Property Published Successfully</h1>
      <p className="mt-2 text-[15px] text-slate-500">{form.title || 'This property'} is now live on My World City and visible to buyers.</p>

      <div className="mt-8 grid gap-4 text-left sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Property ID</p>
          <p className="mt-1 text-[22px] font-extrabold text-navy-900">{result.code}</p>
          <span className="mt-2 inline-block rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-bold text-white">Active Listing</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Live URL</p>
          <p className="mt-1 truncate text-[13px] font-semibold text-brand">{url}</p>
          <button onClick={() => navigator.clipboard?.writeText(`https://${url}`)} className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-slate-300 py-2 text-[13px] font-semibold text-navy-800 hover:border-brand"><Copy className="h-3.5 w-3.5" /> Copy link</button>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Listing</p>
          <p className="mt-1 text-[18px] font-extrabold text-navy-900">{form.category}{form.subType ? ` · ${form.subType}` : ''}</p>
          <p className="mt-2 text-[12.5px] font-semibold text-emerald-600">{form.location.locality ? `Live in ${form.location.locality}` : 'Now live'}</p>
        </div>
      </div>

      <p className="mt-8 text-[12px] font-bold uppercase tracking-wide text-slate-400">Suggested Next Actions</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <NextAction icon={Star} title="Add to Featured Listings" body="Highlight this on the homepage for maximum visibility." cta="Promote Now" href={`/admin/properties/${result.id}`} />
        <NextAction icon={Share2} title="Share on Social Media" body="Post to Instagram and Facebook Marketplace instantly." cta="Create Post" />
        <NextAction icon={Send} title="Send to Interested Buyers" body="Notify buyers watching this locality and category." cta="Notify Leads" />
        <NextAction icon={BarChart3} title="View Analytics" body="Track views, clicks, and saved interest in real-time." cta="Open Dashboard" href={`/admin/properties/${result.id}`} />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link href={`/admin/properties/${result.id}`} className="inline-flex items-center gap-2 rounded-full bg-navy-800 px-6 py-3 text-[14px] font-semibold text-white hover:bg-navy-700">Go to Property Detail <ArrowRight className="h-4 w-4" /></Link>
        <button onClick={onAnother} className="rounded-full border border-slate-300 px-6 py-3 text-[14px] font-semibold text-navy-800 hover:border-slate-400">Add Another Property</button>
        <Link href="/admin/properties" className="text-[14px] font-semibold text-navy-800 hover:underline">Back to All Properties</Link>
      </div>
    </div>
  )
}

/* ---------------- shared ---------------- */
const inp = 'w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[14px] text-slate-800 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20'
const inpSm = 'w-full rounded-lg border border-slate-200 px-2.5 py-2 text-[13px] focus:border-brand focus:outline-none'

function H({ title, sub }) { return <div><h2 className="text-[22px] font-extrabold text-navy-900">{title}</h2><p className="mt-1 text-[14px] text-slate-500">{sub}</p></div> }
function SubH({ children, inline }) { return <h3 className={`${inline ? '' : 'mb-3 mt-8'} flex items-center gap-2 text-[16px] font-bold text-navy-800 ${inline ? '' : 'mb-3'}`}><span className="h-4 w-1 rounded bg-brand" />{children}</h3> }
function Label({ children, className = '' }) { return <span className={`block text-[12.5px] font-semibold text-slate-600 ${className}`}>{children}</span> }
function Field({ label, children }) { return <label className="block"><Label>{label}</Label><div className="mt-1">{children}</div></label> }
function Select({ value, onChange, options, sm }) {
  const opts = options.map((o) => (Array.isArray(o) ? o : [o, o]))
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`w-full appearance-none rounded-lg border border-slate-200 bg-white ${sm ? 'px-2.5 py-2 text-[13px]' : 'px-3 py-2.5 text-[14px]'} text-slate-800 focus:border-brand focus:outline-none`}>
        {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <ChevronRight className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400" />
    </div>
  )
}
function ToggleCard({ title, sub, on, onClick }) {
  return (
    <div className={`flex items-center justify-between rounded-xl border p-4 ${on ? 'border-brand/30 bg-brand/5' : 'border-slate-200'}`}>
      <div><p className="text-[14.5px] font-bold text-navy-800">{title}</p>{sub && <p className="text-[12px] text-slate-500">{sub}</p>}</div>
      <Switch on={on} onClick={onClick} />
    </div>
  )
}
function ToggleInline({ label, on, onClick }) {
  return <div className="flex items-center justify-between gap-3"><span className="text-[13.5px] font-medium text-slate-700">{label}</span><Switch on={on} onClick={onClick} /></div>
}
function Switch({ on, onClick }) {
  return <button onClick={onClick} className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-brand' : 'bg-slate-300'}`} aria-pressed={on}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} /></button>
}
function NextAction({ icon: Icon, title, body, cta, href }) {
  const inner = (
    <div className={`flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left ${href ? 'transition hover:border-brand/40' : ''}`}>
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand"><Icon className="h-5 w-5" /></span>
      <p className="mt-3 text-[16px] font-bold text-navy-800">{title}</p>
      <p className="mt-1 flex-1 text-[13px] text-slate-500">{body}</p>
      {href
        ? <span className="mt-3 inline-flex items-center gap-1 text-[13.5px] font-bold text-brand">{cta} <ArrowRight className="h-3.5 w-3.5" /></span>
        : <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[12px] font-semibold text-slate-400">Coming soon</span>}
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

function canPublish(form) {
  return !!form.title.trim() && !!form.owner.name.trim() && /^[6-9]\d{9}$/.test(form.owner.phone)
}

function priceLabel(n) {
  if (!n) return ''
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`
  if (n >= 1e5) return `₹${Math.round(n / 1e5)} L`
  return `₹${n.toLocaleString()}`
}
