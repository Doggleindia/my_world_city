import Link from 'next/link'
import { actionIcons } from './icons/ActionIcons'
import { actionCards } from '../data'

const hrefs = {
  buy: '/find-property',
  build: '/develop',
  manage: '/services',
  invest: '/find-property?category=Commercial',
}

export default function ActionSelector() {
  return (
    <section className="relative z-10">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-x-10 lg:grid-cols-4">
          {actionCards.map((c) => {
            const Icon = actionIcons[c.icon]
            return (
              <Link key={c.key} href={hrefs[c.key] || '/find-property'} className="group text-center">
                <Icon
                  className="mx-auto h-16 w-16 transition-transform duration-300 group-hover:-translate-y-1"
                  style={{ color: c.color }}
                />
                {/* two-tone rule spanning the column */}
                <span
                  className="mt-8 block h-[5px] w-full rounded-full"
                  style={{
                    backgroundImage: `linear-gradient(90deg, ${c.bar[0]} 0%, ${c.bar[0]} 45%, ${c.bar[1]} 55%, ${c.bar[1]} 100%)`,
                  }}
                />
                <h3 className="mt-3.5 text-[17px] font-bold text-navy-900">{c.title}</h3>
                <p
                  className="mx-auto mt-2 max-w-[13.5rem] text-[15px] leading-snug"
                  style={{ color: c.color }}
                >
                  {c.desc}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
