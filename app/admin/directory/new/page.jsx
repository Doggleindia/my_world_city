'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { compressImage } from '@/lib/image'
import {
  Check, ChevronRight, ArrowRight, ArrowLeft, Loader2, Plus, X, Trash2, Camera,
  Contact, Map, Compass, Image as ImageIcon, IdCard, Upload, CheckCircle2, Shield,
} from 'lucide-react'

const STEPS = ['Basic Info', 'Profile & Specialty', 'Verification & Docs', 'Availability & Pricing']
const CATEGORIES = ['Architecture', 'Interior Design', 'Legal', 'Vastu Consultant', 'Surveyor', 'Contractor', 'Solar', 'Govt Liaison']
const AREAS = ['Jagatpura', 'Malviya Nagar', 'Vaishali Nagar', 'Mansarovar', 'C-Scheme', 'Raja Park', 'Bani Park', 'Civil Lines', 'Sitapura']
const SPECIALTIES = ['Residential Design', 'Villa Architecture', 'Modern Elevation', 'Interior Planning', 'Landscaping', 'Sustainable Design', 'Commercial Units']
const DOCS = [['govId', 'Government ID Proof', 'Passport, PAN, or Aadhaar Card', true], ['degree', 'Highest Degree Certificate', 'Educational qualification proof', true], ['registration', 'Registration Certificate', 'Council of Architecture or relevant board', true]]

const empty = {
  name: '', role: '', cat: '', subSpecialty: '', experienceYears: '', companyName: '', firmType: '', featured: false, onboardingSource: 'Direct Application', bio: '',
  phone: '', email: '', whatsapp: true, linkedin: '', serviceAreas: [], specialties: [], photo: '', portfolio: [],
  verification: { legalName: '', pan: '', aadhaar: '', dob: '', docs: {} }, credentials: [{ title: '', institution: '', year: '', verified: true }], verificationStatus: 'pending', internalNotes: '',
  availability: { accountStatus: 'Active & Accepting Bookings', autoAccept: true, workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], startTime: '09:00', endTime: '18:00', avgResponse: 'Under 1 hour' },
  pricing: { feeModel: 'Flat Hourly Rate', amount: '', sla: '', cancellation: 'Flexible (24h full refund)' },
  commission: '15', paymentMethod: 'Direct Bank Transfer', notifPrefs: { whatsapp: true, email: true, sms: false, monthly: true },
}

export default function AddExpertWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(empty)
  const [busy, setBusy] = useState(false)

  useEffect(() => { try { const s = localStorage.getItem('mwc-add-expert'); if (s) setForm({ ...empty, ...JSON.parse(s) }) } catch {} }, [])
  useEffect(() => { const t = setInterval(() => { try { localStorage.setItem('mwc-add-expert', JSON.stringify(form)) } catch {} }, 30000); return () => clearInterval(t) }, [form])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const setIn = (o, k, v) => setForm((f) => ({ ...f, [o]: { ...f[o], [k]: v } }))
  const toggleArr = (k, v) => setForm((f) => ({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] }))

  const submit = async (status) => {
    setBusy(true)
    // Explicit "Save as Draft" wins; otherwise honour the chosen verification radio.
    const effStatus = status || (['verified', 'pending', 'draft'].includes(form.verificationStatus) ? form.verificationStatus : 'pending')
    const res = await fetch('/api/admin/directory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, status: effStatus }) })
    const data = await res.json()
    setBusy(false)
    if (!res.ok) { alert(data.error || 'Could not save'); return }
    try { localStorage.removeItem('mwc-add-expert') } catch {}
    router.push('/admin/directory')
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] font-medium text-slate-400">Home › Experts › Directory › <span className="font-bold text-navy-800">Add New</span></p>
          <h1 className="mt-0.5 text-[22px] font-extrabold text-navy-900">Add New Expert</h1>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[12.5px] font-semibold text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Auto-saving every 30s</span>
      </div>

      {/* stepper */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-[15px] font-bold text-navy-900">Step {step} of 4 · <span className="text-slate-500">{STEPS[step - 1]}</span></p>
        <div className="mt-4 flex items-center">
          {STEPS.map((s, i) => {
            const n = i + 1; const done = n < step; const active = n === step
            return (
              <div key={s} className="flex flex-1 items-center last:flex-none">
                <div className="flex items-center gap-2.5">
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[13px] font-bold ${done ? 'bg-emerald-500 text-white' : active ? 'bg-navy-800 text-white' : 'border border-slate-300 text-slate-400'}`}>{done ? <Check className="h-4 w-4" /> : n}</span>
                  <span className={`hidden text-[13px] font-semibold sm:block ${active ? 'text-navy-800' : done ? 'text-emerald-600' : 'text-slate-400'}`}>{s}</span>
                </div>
                {n < STEPS.length && <div className={`mx-3 h-0.5 flex-1 ${done ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {step === 1 && <Step1 form={form} set={set} />}
        {step === 2 && <Step2 form={form} set={set} setIn={setIn} setForm={setForm} toggleArr={toggleArr} />}
        {step === 3 && <Step3 form={form} set={set} setIn={setIn} setForm={setForm} />}
        {step === 4 && <Step4 form={form} setIn={setIn} setForm={setForm} />}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">
          <button onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1} className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-slate-600 hover:text-navy-800 disabled:opacity-0"><ArrowLeft className="h-4 w-4" /> Back</button>
          <div className="flex items-center gap-4">
            <button onClick={() => submit('draft')} disabled={busy} className="text-[14px] font-semibold text-slate-500 hover:text-navy-800">Save as Draft</button>
            {step < 4 ? (
              <button onClick={() => setStep((s) => s + 1)} className="inline-flex items-center gap-2 rounded-full bg-navy-800 px-6 py-3 text-[14px] font-semibold text-white hover:bg-navy-700">Continue to {STEPS[step]} <ArrowRight className="h-4 w-4" /></button>
            ) : (
              <button onClick={() => submit()} disabled={busy || !form.name.trim()} className="inline-flex items-center gap-2 rounded-full bg-navy-800 px-6 py-3 text-[14px] font-semibold text-white hover:bg-navy-700 disabled:opacity-50">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Review &amp; Publish <ArrowRight className="h-4 w-4" /></>}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Step1({ form, set }) {
  return (
    <div>
      <H title="Basic Info" sub="Start with the essentials — you can edit any of this later." />
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Field label="Full Name *"><input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Jonathan Aris" className={inp} /></Field>
        <Field label="Expert ID"><input value="Auto-assigned on save" disabled className={`${inp} bg-brand/5 text-slate-400`} /></Field>
        <Field label="Professional Title *"><input value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="e.g. Senior Principal Architect" className={inp} /></Field>
        <Field label="Company Name"><input value={form.companyName} onChange={(e) => set('companyName', e.target.value)} placeholder="e.g. Skyline Studio Partners" className={inp} /></Field>
        <Field label="Expert Type *"><Select value={form.cat} onChange={(v) => set('cat', v)} options={[['', 'Select Category'], ...CATEGORIES.map((c) => [c, c])]} /></Field>
        <div>
          <Label>Firm Type</Label>
          <div className="mt-2 flex gap-6">
            {['Corporate', 'Boutique', 'Freelance'].map((t) => (
              <label key={t} className="flex cursor-pointer items-center gap-2 text-[14px] text-slate-700"><input type="radio" checked={form.firmType === t} onChange={() => set('firmType', t)} className="h-4 w-4 text-brand" /> {t}</label>
            ))}
          </div>
        </div>
        <Field label="Sub-specialty"><input value={form.subSpecialty} onChange={(e) => set('subSpecialty', e.target.value)} placeholder="e.g. Sustainable Urban Design" className={inp} /></Field>
        <ToggleCard title="Featured Expert?" sub="List at the top of the directory search" on={form.featured} onClick={() => set('featured', !form.featured)} />
        <Field label="Experience * (Years)"><input value={form.experienceYears} onChange={(e) => set('experienceYears', e.target.value.replace(/\D/g, ''))} placeholder="0" className={inp} /></Field>
        <Field label="Onboarding Source"><Select value={form.onboardingSource} onChange={(v) => set('onboardingSource', v)} options={['Direct Application', 'Referral', 'Recruited', 'Partner Network']} /></Field>
      </div>
      <div className="mt-5">
        <div className="flex items-center justify-between"><Label>Short Bio *</Label><span className="text-[12px] text-slate-400">{form.bio.length}/240</span></div>
        <textarea rows={4} maxLength={240} value={form.bio} onChange={(e) => set('bio', e.target.value)} placeholder="Briefly describe the expert's professional background and philosophy…" className={`${inp} mt-1 resize-none`} />
      </div>
    </div>
  )
}

function Step2({ form, set, setIn, setForm, toggleArr }) {
  const [uploading, setUploading] = useState(false)
  const [customSpec, setCustomSpec] = useState('')
  const upload = async (file, kind) => {
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', await compressImage(file))
      const res = await fetch('/api/upload', { method: 'POST', body: fd }); const d = await res.json()
      if (res.ok) { if (kind === 'photo') set('photo', d.url); else setForm((f) => ({ ...f, portfolio: [...f.portfolio, d.url].slice(0, 12) })) }
    } finally { setUploading(false) }
  }
  return (
    <div>
      <H title="Profile Details & Specialties" sub="Update contact reachability and showcase professional expertise." />
      <SubH icon={Contact}>Contact Information</SubH>
      <div className="grid gap-5 lg:grid-cols-2">
        <Field label="Phone Number *"><input value={form.phone} onChange={(e) => set('phone', e.target.value.replace(/[^\d]/g, ''))} maxLength={10} placeholder="+91 98765 43210" className={inp} /></Field>
        <Field label="Email Address *"><input value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="expert@myworldcity.com" className={inp} /></Field>
        <ToggleCard title="WhatsApp Notifications" sub="Send lead alerts directly to WhatsApp" on={form.whatsapp} onClick={() => set('whatsapp', !form.whatsapp)} />
        <Field label="LinkedIn Profile URL"><input value={form.linkedin} onChange={(e) => set('linkedin', e.target.value)} placeholder="https://linkedin.com/in/username" className={inp} /></Field>
      </div>

      <SubH icon={Map}>Service Areas</SubH>
      <div className="flex flex-wrap gap-2.5">
        {AREAS.map((a) => <Pill key={a} on={form.serviceAreas.includes(a)} onClick={() => toggleArr('serviceAreas', a)}>{a}</Pill>)}
      </div>

      <SubH icon={Compass}>Specialties</SubH>
      <div className="flex flex-wrap gap-2.5">
        {form.specialties.filter((s) => !SPECIALTIES.includes(s)).map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5 rounded-full border border-brand bg-brand/5 px-3.5 py-1.5 text-[13px] font-semibold text-brand">{s}<button onClick={() => toggleArr('specialties', s)}><X className="h-3.5 w-3.5" /></button></span>
        ))}
        {SPECIALTIES.map((s) => <PillTag key={s} on={form.specialties.includes(s)} onClick={() => toggleArr('specialties', s)}>{s}</PillTag>)}
        <form onSubmit={(e) => { e.preventDefault(); if (customSpec.trim()) { toggleArr('specialties', customSpec.trim()); setCustomSpec('') } }} className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-3 py-1.5">
          <input value={customSpec} onChange={(e) => setCustomSpec(e.target.value)} placeholder="Custom Tag" className="w-24 bg-transparent text-[13px] focus:outline-none" />
          <button type="submit"><Plus className="h-3.5 w-3.5 text-slate-400" /></button>
        </form>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-[220px_1fr]">
        <div>
          <SubH icon={Camera} tight>Profile Photo</SubH>
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 hover:border-brand">
            {form.photo ? <img src={form.photo} alt="" className="h-full w-full rounded-2xl object-cover" /> : <><span className="grid h-16 w-16 place-items-center rounded-full bg-slate-200"><Camera className="h-6 w-6" /></span><span className="text-[12.5px] font-medium">Click to upload</span></>}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0], 'photo')} />
          </label>
        </div>
        <div>
          <div className="flex items-center justify-between"><SubH icon={ImageIcon} tight>Portfolio Showcase</SubH><span className="text-[12px] text-slate-400">{form.portfolio.length} / 12 Images</span></div>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
            <label className="grid aspect-square cursor-pointer place-items-center rounded-xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-brand">
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-6 w-6" />}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0], 'portfolio')} />
            </label>
            {form.portfolio.map((src, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-xl border border-slate-200">
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button onClick={() => setForm((f) => ({ ...f, portfolio: f.portfolio.filter((_, j) => j !== i) }))} className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-white"><X className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[12px] text-slate-400">Showcase up to 12 high-quality project renders or site photos.</p>
        </div>
      </div>
    </div>
  )
}

function Step3({ form, set, setIn, setForm }) {
  const v = form.verification
  const setV = (k, val) => setIn('verification', k, val)
  const [uploadingKey, setUploadingKey] = useState('')
  const uploadDoc = async (key, file) => {
    if (!file) return
    setUploadingKey(key)
    try {
      const fd = new FormData(); fd.append('file', await compressImage(file))
      const res = await fetch('/api/upload', { method: 'POST', body: fd }); const d = await res.json()
      if (res.ok) setForm((f) => ({ ...f, verification: { ...f.verification, docs: { ...f.verification.docs, [key]: d.url } } }))
    } finally { setUploadingKey('') }
  }
  const setCred = (i, k, val) => setForm((f) => ({ ...f, credentials: f.credentials.map((c, j) => (j === i ? { ...c, [k]: val } : c)) }))
  return (
    <div>
      <H title="Verification & Credentials" sub="Provide legal identity details and upload supporting documents for expert validation." />
      <SubH icon={IdCard}>Identity Verification</SubH>
      <div className="grid gap-5 lg:grid-cols-2">
        <Field label="Legal Name *"><input value={v.legalName} onChange={(e) => setV('legalName', e.target.value)} placeholder="Full legal name" className={inp} /></Field>
        <Field label="PAN Number *"><input value={v.pan} onChange={(e) => setV('pan', e.target.value.toUpperCase())} placeholder="ABCDE1234F" className={inp} /></Field>
        <Field label="Aadhaar Number"><input value={v.aadhaar} onChange={(e) => setV('aadhaar', e.target.value)} placeholder="XXXX-XXXX-XXXX" className={inp} /></Field>
        <Field label="Date of Birth"><input type="date" value={v.dob} onChange={(e) => setV('dob', e.target.value)} className={inp} /></Field>
      </div>

      <SubH icon={Upload}>Document Uploads</SubH>
      <div className="space-y-2.5">
        {DOCS.map(([key, name, desc, req]) => {
          const up = v.docs?.[key]
          return (
            <div key={key} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-brand"><IdCard className="h-4 w-4" /></span><div><p className="text-[14px] font-bold text-navy-800">{name} {req && <span className="text-red-500">*</span>}</p><p className="text-[12px] text-slate-400">{desc}</p></div></div>
              {up ? <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Uploaded</span>
                : <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-300 px-4 py-1.5 text-[13px] font-semibold text-navy-800 hover:border-brand">{uploadingKey === key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Upload<input type="file" accept="image/*" className="hidden" onChange={(e) => uploadDoc(key, e.target.files?.[0])} /></label>}
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex items-center justify-between"><SubH icon={Shield} tight>Credentials to Display Publicly</SubH><button onClick={() => setForm((f) => ({ ...f, credentials: [...f.credentials, { title: '', institution: '', year: '', verified: true }] }))} className="text-[13px] font-bold text-brand">+ Add Row</button></div>
      <div className="space-y-2">
        {form.credentials.map((cr, i) => (
          <div key={i} className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_1fr_80px_60px_40px]">
            <input value={cr.title} onChange={(e) => setCred(i, 'title', e.target.value)} placeholder="Title (B.Arch)" className={inpSm} />
            <input value={cr.institution} onChange={(e) => setCred(i, 'institution', e.target.value)} placeholder="Institution" className={inpSm} />
            <input value={cr.year} onChange={(e) => setCred(i, 'year', e.target.value)} placeholder="Year" className={inpSm} />
            <button onClick={() => setCred(i, 'verified', !cr.verified)} className={`relative h-6 w-11 rounded-full ${cr.verified ? 'bg-emerald-500' : 'bg-slate-300'}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${cr.verified ? 'left-[22px]' : 'left-0.5'}`} /></button>
            <button onClick={() => setForm((f) => ({ ...f, credentials: f.credentials.filter((_, j) => j !== i) }))} className="grid h-9 w-9 place-items-center rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <Label>Verification Status</Label>
          <div className="mt-2 space-y-2">
            {[['verified', 'Verify Now', 'Profile will go live immediately'], ['pending', 'Pending Review', 'Compliance team needs to check'], ['draft', 'Save as Draft', 'Keep in incomplete state']].map(([val, t, d]) => (
              <label key={val} className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 ${form.verificationStatus === val ? 'border-brand bg-brand/5' : 'border-slate-200'}`}>
                <input type="radio" checked={form.verificationStatus === val} onChange={() => set('verificationStatus', val)} className="mt-0.5 h-4 w-4 text-brand" />
                <div><p className="text-[13.5px] font-bold text-navy-800">{t}</p><p className="text-[12px] text-slate-500">{d}</p></div>
              </label>
            ))}
          </div>
        </div>
        <div>
          <Label>Internal Notes</Label>
          <textarea rows={5} value={form.internalNotes} onChange={(e) => set('internalNotes', e.target.value)} placeholder="Add internal observations about document authenticity or missing credentials…" className={`${inp} mt-1 resize-none`} />
          <p className="mt-1 text-[12px] text-slate-400">These notes are only visible to the admin team.</p>
        </div>
      </div>
    </div>
  )
}

function Step4({ form, setIn, setForm }) {
  const a = form.availability; const pr = form.pricing; const np = form.notifPrefs
  const setA = (k, v) => setIn('availability', k, v)
  const setPr = (k, v) => setIn('pricing', k, v)
  const toggleDay = (d) => setForm((f) => ({ ...f, availability: { ...f.availability, workingDays: f.availability.workingDays.includes(d) ? f.availability.workingDays.filter((x) => x !== d) : [...f.availability.workingDays, d] } }))
  return (
    <div>
      <H title="Availability & Financial Terms" sub="Define the expert's working hours, consultation fees, and revenue sharing model." />
      <SubH>Availability</SubH>
      <div className="grid gap-5 lg:grid-cols-2">
        <Field label="Account Status"><Select value={a.accountStatus} onChange={(v) => setA('accountStatus', v)} options={['Active & Accepting Bookings', 'Active (Manual approval)', 'Paused', 'Suspended']} /></Field>
        <ToggleCard title="Auto-Accept Bookings" sub="Skip manual approval for available slots" on={a.autoAccept} onClick={() => setA('autoAccept', !a.autoAccept)} />
      </div>
      <div className="mt-4">
        <Label>Working Days</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <button key={d} onClick={() => toggleDay(d)} className={`rounded-full px-4 py-2 text-[13px] font-semibold ${a.workingDays.includes(d) ? 'bg-emerald-100 text-emerald-700' : 'border border-slate-200 text-slate-500'}`}>{d}</button>
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Field label="Start Time"><input type="time" value={a.startTime} onChange={(e) => setA('startTime', e.target.value)} className={inp} /></Field>
        <Field label="End Time"><input type="time" value={a.endTime} onChange={(e) => setA('endTime', e.target.value)} className={inp} /></Field>
        <Field label="Avg. Response Time"><Select value={a.avgResponse} onChange={(v) => setA('avgResponse', v)} options={['Under 1 hour', '1-2 hours', '2-4 hours', 'Same day']} /></Field>
      </div>

      <SubH>Pricing / Consultation Fee</SubH>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Fee Model"><Select value={pr.feeModel} onChange={(v) => setPr('feeModel', v)} options={['Flat Hourly Rate', 'Per Project', 'Per Visit', 'Retainer']} /></Field>
        <Field label="Amount (₹)"><input value={pr.amount} onChange={(e) => setPr('amount', e.target.value.replace(/\D/g, ''))} placeholder="0.00" className={inp} /></Field>
      </div>
      <Field label="Service Level Agreement (SLA)"><textarea rows={3} value={pr.sla} onChange={(e) => setPr('sla', e.target.value)} placeholder="Define the commitment level (e.g. Detailed report within 24hrs)…" className={`${inp} resize-none`} /></Field>
      <Field label="Cancellation Policy"><Select value={pr.cancellation} onChange={(v) => setPr('cancellation', v)} options={['Flexible (24h full refund)', 'Moderate (48h 50%)', 'Strict (No refund)']} /></Field>

      <SubH>Commission &amp; Revenue</SubH>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="MWC Commission (%)"><input value={form.commission} onChange={(e) => setForm((f) => ({ ...f, commission: e.target.value.replace(/\D/g, '') }))} className={inp} /></Field>
        <Field label="Payment Method"><Select value={form.paymentMethod} onChange={(v) => setForm((f) => ({ ...f, paymentMethod: v }))} options={['Direct Bank Transfer', 'UPI', 'Cheque', 'Wallet']} /></Field>
      </div>

      <SubH>Notification Preferences</SubH>
      <div className="grid gap-3 sm:grid-cols-2">
        {[['whatsapp', 'WhatsApp Alerts'], ['email', 'Email Notifications'], ['sms', 'SMS Reminders'], ['monthly', 'Monthly Reports']].map(([k, l]) => (
          <label key={k} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-[14px] font-semibold text-navy-800">
            {l}
            <input type="checkbox" checked={np[k]} onChange={() => setIn('notifPrefs', k, !np[k])} className="h-4 w-4 rounded border-slate-300 text-brand" />
          </label>
        ))}
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-xl bg-brand/5 p-4">
        <Shield className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
        <div><p className="text-[14px] font-bold text-navy-800">Expert Verification Required</p><p className="text-[12.5px] text-slate-500">Financial terms defined here only become active once the expert's bank account has been verified. Verification typically takes 24–48 business hours.</p></div>
      </div>
    </div>
  )
}

/* shared */
const inp = 'w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[14px] text-slate-800 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20'
const inpSm = 'w-full rounded-lg border border-slate-200 px-2.5 py-2 text-[13px] focus:border-brand focus:outline-none'
function H({ title, sub }) { return <div><h2 className="text-[22px] font-extrabold text-navy-900">{title}</h2><p className="mt-1 text-[14px] text-slate-500">{sub}</p></div> }
function SubH({ icon: Icon, children, tight }) { return <h3 className={`${tight ? 'mb-2' : 'mb-3 mt-8'} flex items-center gap-2 text-[16px] font-bold text-navy-800`}>{Icon ? <Icon className="h-4 w-4 text-brand" /> : <span className="h-4 w-1 rounded bg-brand" />}{children}</h3> }
function Label({ children }) { return <span className="block text-[12.5px] font-semibold text-slate-600">{children}</span> }
function Field({ label, children }) { return <label className="block"><Label>{label}</Label><div className="mt-1">{children}</div></label> }
function Select({ value, onChange, options }) {
  const opts = options.map((o) => (Array.isArray(o) ? o : [o, o]))
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-8 text-[14px] text-slate-800 focus:border-brand focus:outline-none">{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
      <ChevronRight className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400" />
    </div>
  )
}
function ToggleCard({ title, sub, on, onClick }) {
  return (
    <div className={`flex items-center justify-between rounded-xl border p-4 ${on ? 'border-brand/30 bg-brand/5' : 'border-slate-200 border-dashed'}`}>
      <div><p className="text-[14px] font-bold text-navy-800">{title}</p>{sub && <p className="text-[12px] text-slate-500">{sub}</p>}</div>
      <button onClick={onClick} className={`relative h-6 w-11 shrink-0 rounded-full ${on ? 'bg-brand' : 'bg-slate-300'}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} /></button>
    </div>
  )
}
function Pill({ on, onClick, children }) { return <button onClick={onClick} className={`rounded-lg px-4 py-2 text-[13px] font-semibold transition ${on ? 'bg-navy-800 text-white' : 'border border-slate-200 text-slate-600 hover:border-slate-300'}`}>{children}</button> }
function PillTag({ on, onClick, children }) { return <button onClick={onClick} className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition ${on ? 'border-brand bg-brand/5 text-brand' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>{children}</button> }
