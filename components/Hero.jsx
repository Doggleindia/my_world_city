import { hero, heroRotatingWords } from '../data'
import HeroTabs from './HeroTabs'
import RotatingWords from './RotatingWords'

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[80vh] w-full overflow-hidden bg-navy-900">
        {/* Background video — muted + playsInline so mobile autoplays it. */}
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={hero.video}
          poster={hero.bg}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/55 via-navy-900/30 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6">
          <div className="max-w-3xl">
            {/* pb-1 so bg-clip-text doesn't shave the descenders */}
            <h1 className="mwc-hero-gradient pb-1 text-4xl font-extrabold leading-tight drop-shadow-[0_2px_14px_rgba(8,26,51,0.45)] sm:text-5xl">
              Space and investment
              <br /> solutions for <RotatingWords items={heroRotatingWords} />
            </h1>
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
