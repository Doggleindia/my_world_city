import { MapPin, Navigation } from 'lucide-react'

// Location band: a map of the property with the distances the owner listed
// beside it. Uses Google's keyless embed, so there is nothing to configure.
export default function PropertyLocation({ query, nearby = [] }) {
  if (!query) return null
  const q = encodeURIComponent(query)

  return (
    <section className="bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h2 className="text-[26px] font-bold text-navy-900 sm:text-[30px]">Location</h2>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="min-w-0 overflow-hidden rounded border border-slate-200 bg-white">
            <iframe
              title={`Map of ${query}`}
              src={`https://www.google.com/maps?q=${q}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[300px] w-full border-0 sm:h-[360px]"
            />
          </div>

          <div className="min-w-0">
            {nearby.length > 0 && (
              <>
                <h3 className="text-[15px] font-bold text-navy-900">Nearby</h3>
                <ul className="mt-3 space-y-2.5">
                  {nearby.slice(0, 6).map((n, i) => (
                    <li key={i}
                      className="flex items-center gap-3 rounded border border-slate-200 bg-white px-3.5 py-3">
                      <MapPin className="h-[18px] w-[18px] shrink-0 text-brand" />
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] font-bold text-navy-900">{n.label}</p>
                        {n.value && <p className="text-[12.5px] text-slate-500">{n.value}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${q}`}
              target="_blank"
              rel="noreferrer"
              className={`${nearby.length ? 'mt-3' : ''} flex items-center justify-center gap-2 rounded bg-cyan px-5 py-3 text-[14px] font-bold text-navy-900 transition hover:bg-cyan-600`}
            >
              <Navigation className="h-4 w-4" /> Get directions
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
