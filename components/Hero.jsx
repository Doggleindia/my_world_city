import { hero } from '../data'
import HeroTabs from './HeroTabs'

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="relative h-[80vh] w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${hero.bg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/55 via-navy-900/30 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              Space and investment
              <br /> solutions for a Modern Jaipur
            </h1>
            <p className="mt-5 max-w-xl text-[15px] font-semibold leading-relaxed text-sky-300">
              A Curated Property Platform Connecting Buyers, Builders And Investors
              With Verified Residential, Commercial, Industrial And Agricultural
              Opportunities Across The City.
            </p>
            <HeroTabs />
          </div>
        </div>
      </div>
    </section>
  )
}
