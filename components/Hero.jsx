import { hero, heroRotatingWords } from '../data'
import HeroTabs from './HeroTabs'
import RotatingWords from './RotatingWords'
import HeroMedia from './HeroMedia'

export default function Hero() {
  return (
    <section className="relative">
      <div className="relative h-[86vh] min-h-[520px] w-full overflow-hidden bg-navy-900">
        {/* Background video drifts slowly as the page scrolls, so moving down
            the page reads as moving forward into the scene. */}
        <HeroMedia src={hero.video} poster={hero.bg} />

        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/60 via-navy-900/32 to-transparent" />
        {/* darkens the top edge so the transparent navbar stays readable over the video */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-navy-900/60 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6">
          <div className="max-w-5xl">
            {/* Fluid size, computed from the width of the longest line so it
                always fits: two lines from tablets up, three on phones. */}
            <h1 className="pb-1 text-[length:clamp(22px,calc((100vw-2.5rem)/11.8),38px)] sm:text-[length:clamp(14px,calc((100vw-2.5rem)/17.4),64px)] text-[#ffb020] drop-shadow-[0_2px_14px_rgba(8,26,51,0.45)]">
              <span className="block whitespace-nowrap">Space and investment</span>
              <span className="block whitespace-nowrap">
                solutions for{" "}
                {/* phones: the rotating phrase gets its own line so the type can stay large */}
                <br className="sm:hidden" />
                <RotatingWords items={heroRotatingWords} />
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-[clamp(13px,1.6vw,18px)] font-medium text-white/80 drop-shadow-[0_1px_8px_rgba(8,26,51,0.5)]">
              Every property, real. Every partner, verified. Every step, guided.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs sit on the white band below the image */}
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <HeroTabs />
      </div>
    </section>
  )
}
