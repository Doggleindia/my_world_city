'use client'

import { useState } from 'react'
import { Navigation } from 'lucide-react'
import { iconFor } from './icons'

// Location band: a map of the property with a Map / Satellite toggle, and the
// nearby connections beside it. Uses Google's keyless embed, so there is
// nothing to configure.
export default function PropertyLocation({ query, nearby = [] }) {
  const [mode, setMode] = useState('map')
  if (!query) return null
  const q = encodeURIComponent(query)

  return (
    <section className="bg-[#f1f1f1]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h2 className="text-[26px] font-semibold text-navy-900 sm:text-[30px]">Location</h2>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div className="relative min-w-0 overflow-hidden border border-slate-300 bg-white">
            <iframe
              key={mode}
              title={`Map of ${query}`}
              src={`https://www.google.com/maps?q=${q}&t=${mode === 'satellite' ? 'k' : 'm'}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[300px] w-full border-0 sm:h-[360px]"
            />
            {/* Map / Satellite switch, top-left like the design */}
            <div className="absolute left-4 top-4 flex shadow-md">
              {[['map', 'Map'], ['satellite', 'Satellite']].map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setMode(k)}
                  className={`px-4 py-1.5 text-[13px] font-semibold transition ${
                    mode === k ? 'bg-cyan text-navy-900' : 'bg-white text-navy-900 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-w-0">
            {nearby.length > 0 && (
              <>
                <h3 className="text-[13px] font-bold text-navy-900">Nearby Connections</h3>
                <ul className="mt-3 space-y-2.5">
                  {nearby.slice(0, 6).map((n, i) => {
                    const Icon = iconFor(n.icon)
                    return (
                      <li key={i} className="flex items-center gap-3 border border-brand-800 bg-white px-4 py-3">
                        <Icon className="h-5 w-5 shrink-0 text-brand-800" />
                        <div className="min-w-0">
                          <p className="text-[17px] font-bold leading-tight text-brand-800">{n.label}</p>
                          {n.value && <p className="mt-0.5 text-[12px] text-slate-500">{n.value}</p>}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${q}`}
              target="_blank"
              rel="noreferrer"
              className={`${nearby.length ? 'mt-4' : ''} flex items-center justify-center gap-2 bg-cyan px-5 py-3 text-[13.5px] font-bold text-navy-900 transition hover:bg-cyan-600`}
            >
              <Navigation className="h-4 w-4" /> Get directions
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
