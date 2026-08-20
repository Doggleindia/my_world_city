'use client'

import { useState } from 'react'
import { BadgeCheck, Download, Phone } from 'lucide-react'
import EnquiryModal from './EnquiryModal'
import ShareCard from './ShareCard'

export default function ContactCard({ property }) {
  const { agent } = property
  const [modalTab, setModalTab] = useState(null) // null = closed, else active tab

  const openWith = (tab) => setModalTab(tab)
  const close = () => setModalTab(null)

  const onDownload = () => window.print()

  return (
    <div className="lg:sticky lg:top-24">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        {property.priceLabel && (
          <div className="mb-4 border-b border-slate-100 pb-4">
            <p className="text-[24px] font-extrabold text-navy-900">{property.priceLabel}</p>
            {property.negotiable && <p className="text-[12.5px] font-semibold text-emerald-600">Negotiable</p>}
          </div>
        )}
        {/* Agent */}
        <div className="flex items-center gap-3">
          {agent.avatar ? (
            <img src={agent.avatar} alt={agent.name} className="h-11 w-11 rounded-full object-cover" />
          ) : (
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand/10 text-[13px] font-bold text-brand">{agent.initials || 'O'}</span>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold text-navy-800">{agent.name}</span>
              <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-brand">
                {agent.role}
              </span>
            </div>
            {agent.responds && (
              <p className="mt-0.5 flex items-center gap-1 text-[12px] text-slate-500">
                <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" /> {agent.responds}
              </p>
            )}
          </div>
        </div>

        {/* Primary actions */}
        <button
          onClick={() => openWith('Enquire')}
          className="mt-4 w-full rounded-lg bg-brand py-3 text-[14px] font-semibold text-white transition hover:bg-brand-700"
        >
          Enquire now
        </button>
        {agent.phone && (
          <a
            href={`tel:+91${agent.phone}`}
            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 py-3 text-[14px] font-semibold text-slate-700 transition hover:border-slate-400"
          >
            <Phone className="h-4 w-4" /> Call owner
          </a>
        )}
        <button
          onClick={() => openWith('Schedule visit')}
          className="mt-2.5 w-full rounded-lg border border-slate-300 py-3 text-[14px] font-semibold text-slate-700 transition hover:border-slate-400"
        >
          Schedule a visit
        </button>
        <button
          onClick={() => openWith('Request callback')}
          className="mt-2.5 w-full rounded-lg border border-slate-300 py-3 text-[14px] font-semibold text-slate-700 transition hover:border-slate-400"
        >
          Request callback
        </button>
      </div>

      {/* Sharing lives in its own card now */}
      <ShareCard property={property} />

      <button
        onClick={onDownload}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-3 text-[14px] font-semibold text-slate-700 transition hover:border-slate-400"
      >
        Download (PDF) <Download className="h-[18px] w-[18px]" />
      </button>

      <EnquiryModal
        open={modalTab !== null}
        tab={modalTab ?? 'Enquire'}
        onTabChange={setModalTab}
        onClose={close}
        property={property}
      />
    </div>
  )
}
