// import { developHeroImg } from '@/data'
// import ContactButton from '@/components/contact/ContactButton'

// export default function DevelopHero() {
//   return (
//     <section className="relative overflow-hidden bg-slate-900">
//       <img
//         src={developHeroImg}
//         alt="Luxury property"
//         className="absolute inset-0 h-full w-full object-cover"
//       />
//       {/* light wash on the left for the text */}
//       <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent" />

//       <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24">
//         <div className="max-w-xl">
//           <h1 className="text-[32px] font-extrabold leading-tight tracking-tight text-navy-900 sm:text-[42px]">
//             Developing a property?
//             <br />
//             The whole process handled.
//           </h1>
//           <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-700">
//             From legal clearances to the final Vastu check, we orchestrate every professional and
//             permit required to turn your land into a masterpiece.
//           </p>
//           <ContactButton
//             topic="Develop a property"
//             title="Talk to our team"
//             subtitle="Tell us about your land or project and we’ll guide you through the build."
//             className="mt-7 rounded-full border border-slate-300 bg-white/90 px-6 py-3 text-[14px] font-semibold text-navy-800 transition hover:border-brand hover:text-brand"
//           >
//             Talk to our team
//           </ContactButton>
//         </div>
//       </div>
//     </section>
//   )
// }




// components/develop/DevelopHero.jsx
import { developHeroImg, developHeroVideo } from '@/data'
import ContactButton from '@/components/contact/ContactButton'

export default function DevelopHero() {
  return (
    <section className="relative overflow-hidden bg-slate-900">
      {/* Background video. Muted + playsInline so mobile browsers allow autoplay;
          the poster carries the section if the video is blocked or still loading. */}
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
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="max-w-xl">
          {/* No wash over the video, so the headline carries its own soft halo
              to stay readable as the clip pans across bright frames. */}
          <h1 className="text-[32px] font-extrabold leading-tight tracking-tight text-navy-900 drop-shadow-[0_1px_10px_rgba(255,255,255,0.7)] sm:text-[42px]">
            Developing a property?<br />The whole process handled.
          </h1>
          <ContactButton
            topic="Develop a property"
            title="Talk to our team"
            subtitle="Tell us about your land or project and we'll guide you through the build."
            className="mt-7 rounded-full border border-slate-300 bg-white/90 px-6 py-3 text-[14px] font-semibold text-navy-800 transition hover:border-brand hover:text-brand"
          >
            Talk to our team
          </ContactButton>
        </div>
      </div>
    </section>
  )
}