'use client'

import { useEffect, useState } from 'react'
import { Loader2, MapPin, Building2, Eye, Inbox, Map as MapIcon } from 'lucide-react'

export default function LocalitiesPage() {
  const [items, setItems] = useState(null)
  const [active, setActive] = useState(null)

  useEffect(() => {
    fetch('/api/admin/localities')
      .then((r) => r.json())
      .then((d) => { const list = d.items || []; setItems(list); setActive(list[0] || null) })
      .catch(() => setItems([]))
  }, [])

  return (
    <div className="mx-auto max-w-[1400px]">
      <h1 className="text-[26px] font-extrabold tracking-tight text-navy-900">Localities</h1>
      <p className="mt-1 text-[14px] text-slate-500">Demand and supply across every area you operate in.</p>

      {!items ? (
        <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
      ) : items.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
          <MapIcon className="h-9 w-9 text-slate-300" />
          <p className="mt-3 text-[16px] font-bold text-navy-800">No locality data yet</p>
          <p className="mt-1 text-[13.5px] text-slate-500">Localities appear here once properties are listed against them.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
          {/* list */}
          <div className="space-y-3">
            {items.map((l) => {
              const on = active?.locality === l.locality
              return (
                <button key={l.locality} onClick={() => setActive(l)}
                  className={`flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm transition ${on ? 'border-brand ring-1 ring-brand/30' : 'border-slate-200 hover:border-slate-300'}`}>
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${on ? 'bg-brand text-white' : 'bg-brand/10 text-brand'}`}><MapPin className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[16px] font-bold text-navy-800">{l.locality}</p>
                    <p className="text-[12.5px] text-slate-500">{l.active} live · {l.total} total listings</p>
                  </div>
                  <div className="hidden gap-6 sm:flex">
                    <Stat icon={Eye} value={l.views.toLocaleString()} label="views" />
                    <Stat icon={Inbox} value={l.enquiries} label="enquiries" />
                    <Stat icon={Building2} value={l.avgPrice ? shortPrice(l.avgPrice) : '—'} label="avg price" />
                  </div>
                </button>
              )
            })}
          </div>

          {/* detail / map placeholder */}
          <div className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
            {active && (
              <>
                <h2 className="text-[18px] font-bold text-navy-800">{active.locality}</h2>
                <a
                  href={active.lat != null && active.lng != null ? `https://www.google.com/maps?q=${active.lat},${active.lng}` : `https://www.google.com/maps/search/${encodeURIComponent(active.locality + ' Jaipur')}`}
                  target="_blank"
                  className="mt-4 flex h-52 flex-col items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                >
                  <MapIcon className="h-7 w-7 text-brand" />
                  <p className="mt-2 text-[12.5px] font-semibold text-brand">Open {active.locality} in Google Maps</p>
                  {active.lat != null && active.lng != null && <p className="mt-1 text-[12px]">{active.lat}, {active.lng}</p>}
                </a>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Metric label="Live listings" value={active.active} />
                  <Metric label="Total listings" value={active.total} />
                  <Metric label="Enquiries" value={active.enquiries} />
                  <Metric label="Total views" value={active.views.toLocaleString()} />
                  <Metric label="Avg price" value={active.avgPrice ? shortPrice(active.avgPrice) : '—'} wide />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="text-center">
      <p className="flex items-center justify-center gap-1 text-[14px] font-bold text-navy-800"><Icon className="h-3.5 w-3.5 text-slate-400" /> {value}</p>
      <p className="text-[11px] text-slate-400">{label}</p>
    </div>
  )
}
function Metric({ label, value, wide }) {
  return (
    <div className={`rounded-xl border border-slate-100 bg-slate-50 p-3 ${wide ? 'col-span-2' : ''}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-[18px] font-extrabold text-navy-900">{value}</p>
    </div>
  )
}
function shortPrice(n) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`
  if (n >= 1e5) return `₹${Math.round(n / 1e5)} L`
  return `₹${Math.round(n).toLocaleString()}`
}
