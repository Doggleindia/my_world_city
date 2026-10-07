import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { actionIcons } from './icons/ActionIcons'
import { actionCards } from '../data'

const hrefs = {
  buy: '/find-property',
  build: '/develop',
  manage: '/services',
  invest: '/find-property?category=Commercial',
}

// The four journeys, as cards that read as buttons: a coloured icon disc,
// the two-tone rule as the card's top edge, and an arrow pill that fills with
// the card's colour on hover while the whole card lifts.
export default function ActionSelector() {
  return (
    <section className="relative z-10 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {actionCards.map((c) => {
            const Icon = actionIcons[c.icon]
            return (
              <Link
                key={c.key}
                href={hrefs[c.key] || '/find-property'}
                style={{ '--c': c.color, '--a': c.bar[0], '--b': c.bar[1] }}
                className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 pb-5 pt-7 text-center shadow-[0_8px_24px_-18px_rgba(8,26,51,0.35)] transition duration-300 hover:-translate-y-1.5 hover:border-[color:var(--c)]/40 hover:shadow-[0_22px_40px_-20px_rgba(8,26,51,0.45)] sm:px-6 sm:pb-7 sm:pt-9"
              >
                {/* the two-tone rule, now the card's top edge */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1.5"
                  style={{ backgroundImage: 'linear-gradient(90deg, var(--a) 0%, var(--a) 45%, var(--b) 55%, var(--b) 100%)' }}
                />
                {/* soft colour wash behind the icon */}
                <span aria-hidden="true" className="pointer-events-none absolute -top-10 left-1/2 h-36 w-36 -translate-x-1/2 rounded-full bg-[color:var(--c)] opacity-[0.07] blur-2xl transition group-hover:opacity-[0.14]" />

                <span className="relative grid h-16 w-16 place-items-center rounded-full bg-[color-mix(in_srgb,var(--c)_12%,white)] ring-1 ring-[color:var(--c)]/20 transition duration-300 group-hover:bg-[color:var(--c)] group-hover:ring-[color:var(--c)] sm:h-20 sm:w-20">
                  <Icon className="h-8 w-8 text-[color:var(--c)] transition duration-300 group-hover:scale-110 group-hover:text-white sm:h-10 sm:w-10" />
                </span>

                <h3 className="mt-5 text-[16px] font-bold text-navy-900 sm:text-[18px]">{c.title}</h3>
                <p className="mt-1.5 text-[13px] leading-snug text-[color:var(--c)] sm:text-[15px]">{c.desc}</p>

                <span className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-[color:var(--c)]/30 px-3.5 py-1.5 text-[12.5px] font-bold text-[color:var(--c)] transition duration-300 group-hover:bg-[color:var(--c)] group-hover:text-white sm:text-[13.5px]">
                  Get started <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
