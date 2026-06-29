'use client'

import { useState } from 'react'
import { BadgeCheck, MessageCircle, Mail, Link2, Share2, Download } from 'lucide-react'
import EnquiryModal from './EnquiryModal'

export default function ContactCard({ property }) {
  const { agent } = property
  const [modalTab, setModalTab] = useState(null) // null = closed, else active tab

  const openWith = (tab) => setModalTab(tab)
  const close = () => setModalTab(null)

  return (
    <div className="lg:sticky lg:top-24">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        {/* Agent */}
        <div className="flex items-center gap-3">
          <img src={agent.avatar} alt={agent.name} className="h-11 w-11 rounded-full object-cover" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold text-navy-800">{agent.name}</span>
              <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-brand">
                {agent.role}
              </span>
            </div>
            <p className="mt-0.5 flex items-center gap-1 text-[12px] text-slate-500">
              <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" /> {agent.responds}
            </p>
          </div>
        </div>

        {/* Primary actions */}
        <button
          onClick={() => openWith('Enquire')}
          className="mt-4 w-full rounded-lg bg-brand py-3 text-[14px] font-semibold text-white transition hover:bg-brand-700"
        >
          Enquire now
        </button>
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

        {/* Share */}
        <p className="mt-6 text-[11px] font-bold uppercase tracking-wide text-slate-400">
          Share this property
        </p>
        <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-emerald-600">
          <MessageCircle className="h-[18px] w-[18px]" /> WhatsApp
        </button>

        <div className="mt-2.5 space-y-2.5">
          <ShareRow icon={Mail} label="Email" />
          <ShareRow icon={Link2} label="Copy link" />
          <ShareRow icon={Share2} label="Share" />
        </div>
      </div>

      <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-3 text-[14px] font-semibold text-slate-700 transition hover:border-slate-400">
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

function ShareRow({ icon: Icon, label }) {
  return (
    <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand/[0.07] py-2.5 text-[13.5px] font-semibold text-slate-600 transition hover:bg-brand/10">
      <Icon className="h-[17px] w-[17px] text-slate-500" /> {label}
    </button>
  )
}
