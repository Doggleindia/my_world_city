import Link from 'next/link'
import { hero, heroRotatingWords } from '../data'
import HeroTabs from './HeroTabs'
import RotatingWords from './RotatingWords'
import HeroMedia from './HeroMedia'

// Home hero, laid out from the Figma "Frame 14" mobile design: the amber
// three-line headline, the rotating phrase (bold, white fading to cyan) beneath it, a
// short supporting line, three trust badges, and the four journeys as pill
// buttons at the foot of the video. Sizes are the design's on phones and scale
// up from tablet. Type stays in the site's own face (Stolzl).

// first letter capitalised, as in the design ("A Modern Jaipur")
const rotating = heroRotatingWords.map((w) => w.charAt(0).toUpperCase() + w.slice(1))

const trust = [
  { icon: '/hero-icons/verified.svg', lines: ['Verified', 'Properties'] },
  { icon: '/hero-icons/partners.svg', lines: ['Trusted', 'Partners'] },
  { icon: '/hero-icons/support.svg', lines: ['End-to-End', 'Support'] },
]

const actions = [
  { label: 'Buy Property', icon: '/hero-icons/buy.svg', href: '/find-property' },
  { label: 'Build', icon: '/hero-icons/build.svg', href: '/develop' },
  { label: 'Operate & Manage', icon: '/hero-icons/manage.svg', href: '/services', small: true },
  { label: 'Invest', icon: '/hero-icons/invest.svg', href: '/find-property?category=Commercial' },
]

export default function Hero() {
  return (
    <section className="relative">
      {/* at least 86% of the screen, taller when the content needs it (wide screens) */}
      <div className="relative min-h-[max(86vh,630px)] w-full overflow-hidden bg-navy-900">
        {/* Background video drifts slowly as the page scrolls, so moving down
            the page reads as moving forward into the scene. */}
        <HeroMedia src={hero.video} poster={hero.bg} />

        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/60 via-navy-900/32 to-transparent" />
        {/* darkens the top edge so the transparent navbar stays readable over the video */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-navy-900/60 to-transparent" />
        {/* and the foot, so the badges and buttons sit on a calmer ground */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-navy-900/45 to-transparent" />

        <div className="relative mx-auto flex min-h-[max(86vh,630px)] max-w-7xl flex-col px-6 pb-[51px] pt-[94px] sm:px-8 sm:pb-14 sm:pt-32 lg:pt-36">
          {/* headline + rotating phrase + supporting line */}
          <div>
            <h1 className="!font-bold text-[43.7px] !leading-[0.99] tracking-[-0.013em] text-[#ffb020] drop-shadow-[0_2px_14px_rgba(8,26,51,0.45)] sm:text-[64px] lg:text-[80px]">
              <span className="block whitespace-nowrap">Space and</span>
              <span className="block whitespace-nowrap">Investment</span>
              <span className="block whitespace-nowrap">Solutions for</span>
            </h1>

            <p className="mt-5 text-[31px] font-bold leading-[1.19] tracking-[-0.015em] drop-shadow-[0_2px_14px_rgba(8,26,51,0.45)] sm:mt-6 sm:text-[46px] lg:text-[60px]">
              {/* the site's original phrase colour (white fading to cyan) and pink full stop, in bold */}
              <RotatingWords
                items={rotating}
                phraseClassName="bg-gradient-to-r from-white via-white to-[#7fe3f0] bg-clip-text text-transparent"
              />
            </p>

            <p className="mt-[19px] text-[11.5px] leading-[1.23] text-[#f7f6f3] drop-shadow-[0_1px_8px_rgba(8,26,51,0.5)] sm:mt-6 sm:text-[17px] lg:text-[19px]">
              <span className="block">Every property, real. Every partner, verified.</span>
              <span className="block">Every step, guided.</span>
            </p>
          </div>

          {/* breathing room that grows on taller screens (56px in the design) */}
          <div className="min-h-[56px] flex-1" />

          {/* trust badges, split by thin gold rules */}
          <ul className="flex items-start" aria-label="Why My World City">
            {trust.map((t, i) => (
              <li key={t.lines.join(' ')} className="flex items-start">
                {i > 0 && (
                  <span aria-hidden="true" className="mx-[13.5px] h-[54px] w-[0.635px] bg-[#f7e6bc]/60 sm:mx-6 sm:h-[72px] sm:w-px" />
                )}
                <span className="flex min-w-[62px] flex-col items-center whitespace-nowrap text-center sm:min-w-[92px]">
                  <img src={t.icon} alt="" width={27} height={27} className="h-[27px] w-[27px] sm:h-9 sm:w-9" />
                  <span className="mt-[1.6px] text-[11px] leading-[1.16] text-white sm:mt-1.5 sm:text-[14px]">
                    {t.lines[0]}
                    <br />
                    {t.lines[1]}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          {/* the four journeys */}
          <nav aria-label="What would you like to do?" className="mt-[58px] grid w-full max-w-[342px] grid-cols-2 gap-[8px] sm:mt-12 sm:max-w-[460px] sm:gap-3 lg:max-w-[980px] lg:grid-cols-4">
            {actions.map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className="group flex h-[36.4px] items-center gap-[9px] rounded-full bg-[#fbf2eb] pl-[11.4px] pr-[9.6px] shadow-[0_8px_20px_-12px_rgba(8,26,51,0.6)] transition hover:bg-white sm:h-12 sm:gap-3 sm:pl-4 sm:pr-4"
              >
                <img src={a.icon} alt="" width={18} height={18} className="h-[18.2px] w-[18.2px] shrink-0 sm:h-6 sm:w-6" />
                <span className={`min-w-0 flex-1 whitespace-nowrap font-bold tracking-[-0.01em] text-[#191919] ${a.small ? 'text-[8.6px] xs:text-[9.3px]' : 'text-[10px]'} sm:text-[14px]`}>
                  {a.label}
                </span>
                <img
                  src="/hero-icons/arrow-right.svg"
                  alt=""
                  width={12.5}
                  height={10.2}
                  className="h-[10.2px] w-[12.5px] shrink-0 transition-transform group-hover:translate-x-0.5 sm:h-3 sm:w-[15px]"
                />
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Tabs sit on the white band below the image */}
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <HeroTabs />
      </div>
    </section>
  )
}
