import { hero } from '../data'

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="relative h-[440px] w-full bg-cover bg-center sm:h-[480px]"
        style={{ backgroundImage: `url(${hero.bg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/90 via-navy-900/70 to-navy-900/30" />
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
          </div>
        </div>
      </div>
    </section>
  )
}
