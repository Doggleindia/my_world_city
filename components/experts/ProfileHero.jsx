import { ChevronRight, MapPin, Clock, Languages, ArrowRight } from 'lucide-react'
import ExpertConnectButton from './ExpertConnectButton'

export default function ProfileHero({ p }) {
  const crumbs = ['Home', 'Experts', p.cat, p.name]
  return (
    <section className="border-b border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-5 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1.5 text-[13px] text-slate-500">
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1
            return (
              <span key={c} className="flex items-center gap-1.5">
                <span className={last ? 'font-semibold text-navy-800' : ''}>{c}</span>
                {!last && <ChevronRight className="h-3.5 w-3.5 text-slate-300" />}
              </span>
            )
          })}
        </nav>

        <div className="mt-6 grid gap-8 md:grid-cols-[300px_1fr]">
          {/* Photo */}
          <div className="overflow-hidden rounded-2xl">
            {p.photo ? (
              <img src={p.photo} alt={p.name} className="h-[320px] w-full object-cover md:h-[340px]" />
            ) : (
              <div className="grid h-[320px] w-full place-items-center bg-brand/10 text-[56px] font-extrabold text-brand md:h-[340px]">
                {p.initials}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <span className="inline-block rounded-full bg-indigo-500 px-3 py-1 text-[11px] font-bold tracking-wide text-white">
              {p.tag}
            </span>
            <h1 className="mt-3 text-[30px] font-extrabold text-navy-900 sm:text-[34px]">{p.name}</h1>
            <p className="mt-1 text-[14px] text-slate-500">{p.role}</p>

            <div className="mt-4 flex flex-wrap gap-2.5">
              {p.location && <MetaPill icon={MapPin}>{p.location}</MetaPill>}
              {p.experience && <MetaPill icon={Clock}>{p.experience}</MetaPill>}
              {p.languages && <MetaPill icon={Languages}>{p.languages}</MetaPill>}
            </div>

            {p.intro && <p className="mt-5 max-w-2xl text-[14px] leading-relaxed text-slate-600">{p.intro}</p>}

            <div className="mt-6 flex flex-wrap gap-3">
              <ExpertConnectButton
                expert={{ id: p.id, initials: p.initials, tag: p.tag, name: p.name, specialty: p.specialty }}
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-brand-700"
              >
                Connect Now <ArrowRight className="h-4 w-4" />
              </ExpertConnectButton>
              <a
                href="#selected-work"
                className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-[14px] font-semibold text-slate-700 transition hover:border-slate-400"
              >
                View past projects
              </a>
            </div>

            <div className="mt-7 grid max-w-2xl grid-cols-2 gap-6 border-t border-slate-100 pt-6 sm:grid-cols-4">
              {(p.stats || []).map((s) => (
                <div key={s.label}>
                  <p className="text-[22px] font-extrabold text-navy-800">{s.value}</p>
                  <p className="mt-0.5 text-[12.5px] text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function MetaPill({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12.5px] font-medium text-slate-600">
      <Icon className="h-3.5 w-3.5 text-slate-400" /> {children}
    </span>
  )
}
