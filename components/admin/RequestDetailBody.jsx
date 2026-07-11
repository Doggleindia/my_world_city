'use client'

import Link from 'next/link'
import { MapPin, Scale } from 'lucide-react'

// The inner content of a request's detail view — shared by the quick drawer and
// the full routing workspace so they stay identical.
export default function RequestDetailBody({ lead, showMore }) {
  const memberSince = lead.user?.memberSince
    ? new Date(lead.user.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null
  const roleBadge = lead.user?.roles?.includes('admin')
    ? 'ADMIN'
    : lead.user?.roles?.includes('owner')
      ? 'PROPERTY OWNER'
      : lead.user
        ? 'REGISTERED USER'
        : 'GUEST'

  return (
    <div>
      {/* Requester card */}
      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand/10 text-[16px] font-bold text-brand">
          {initials(lead.name)}
        </span>
        <div className="min-w-0">
          <p className="text-[17px] font-bold text-navy-900">{lead.name}</p>
          <p className="text-[13px] text-slate-500">
            {memberSince ? `Member since ${memberSince}` : 'Guest enquiry'}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {lead.user?.verified && (
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-700">VERIFIED IDENTITY</span>
            )}
            <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-blue-700">{roleBadge}</span>
          </div>
        </div>
      </div>

      {/* Service type + locality */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <InfoCard label="Service Type" icon={Scale} value={titleCase(lead.serviceKey || lead.category || 'General')} />
        <InfoCard label="Locality" icon={MapPin} value={lead.locality || '—'} />
      </div>

      {/* Message */}
      <p className="mt-5 text-[11px] font-bold uppercase tracking-wide text-slate-400">Request Message</p>
      <div className="mt-2 rounded-xl border-l-4 border-navy-800 bg-slate-50 px-4 py-3.5 text-[14px] leading-relaxed text-slate-700">
        {lead.message ? `“${lead.message}”` : 'No message provided.'}
      </div>

      {/* Detail rows */}
      <dl className="mt-5">
        <DetailRow label="Preferred Contact Time" value={lead.preferredTime || 'Anytime'} />
        <DetailRow label="Budget Range" value={lead.budget || 'Not specified'} muted={!lead.budget} />
        <DetailRow
          label="Related Property"
          value={
            lead.property ? (
              <Link href={`/property/${lead.property.slug}`} className="font-bold text-brand underline" target="_blank">
                {lead.property.title} ({lead.property.category})
              </Link>
            ) : 'None'
          }
        />
        {showMore && (
          <>
            <DetailRow label="Reference" value={lead.refId || '—'} />
            <DetailRow label="Phone" value={`+91 ${lead.phone}`} />
            <DetailRow label="Email" value={lead.email || '—'} />
            <DetailRow label="Received" value={new Date(lead.createdAt).toLocaleString('en-IN')} />
          </>
        )}
      </dl>
    </div>
  )
}

function InfoCard({ label, icon: Icon, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-ember" />
        <span className="text-[15px] font-bold leading-tight text-navy-900">{value}</span>
      </div>
    </div>
  )
}

function DetailRow({ label, value, muted }) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-slate-100 py-3.5 last:border-0">
      <dt className="text-[14px] text-slate-500">{label}</dt>
      <dd className={`text-right text-[14px] font-bold ${muted ? 'text-slate-400' : 'text-navy-900'}`}>{value}</dd>
    </div>
  )
}

function initials(name = '?') {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}
function titleCase(s = '') {
  return String(s).replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
