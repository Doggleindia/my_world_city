import { developHeroImg, developHeroVideo } from '@/data'
import ContactButton from '@/components/contact/ContactButton'

// Build Property hero: the clip plays behind a dark wash on the left, so the
// headline is set in white exactly like the home-page hero.
export default function DevelopHero() {
  return (
    <section data-dark className="relative overflow-hidden bg-navy-900">
      {/* Muted + playsInline so mobile browsers allow autoplay; the poster
          carries the section if the video is blocked or still loading. */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={developHeroVideo}
        poster={developHeroImg}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-900/75 via-navy-900/40 to-navy-900/10" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-navy-900/50 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="max-w-2xl">
          <h1 className="text-[clamp(30px,4.6vw,57px)] text-white drop-shadow-[0_2px_14px_rgba(8,26,51,0.45)]">
            Developing a property?<br />The whole process handled.
          </h1>
          <p className="mt-5 max-w-xl text-[clamp(14px,1.5vw,19px)] font-medium text-white/85 drop-shadow-[0_1px_8px_rgba(8,26,51,0.5)]">
            From legal clearances to the final Vastu check, we orchestrate every
            professional and permit required to turn your land into a masterpiece.
          </p>
          <ContactButton
            topic="Develop a property"
            title="Talk to our team"
            subtitle="Tell us about your land or project and we'll guide you through the build."
            className="mt-8 inline-flex items-center rounded-full bg-cyan px-7 py-3.5 text-[15px] font-bold text-navy-900 transition hover:bg-cyan-600"
          >
            Talk to our team
          </ContactButton>
        </div>
      </div>
    </section>
  )
}
