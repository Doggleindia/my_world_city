// // import Link from 'next/link'
// // import StepAccordion from './StepAccordion'
// // import { developSteps } from '@/data'

// // export default function DevelopTimeline() {
// //   return (
// //     <section className="bg-indigo-50">
// //       <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
// //         <div className="text-center">
// //           <h2 className="text-[28px] font-extrabold text-navy-800 sm:text-[34px]">
// //             Your Vision, Visualized.
// //           </h2>
// //           <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-slate-500">
// //             Follow the unified path to your dream property with Jaipur&apos;s most trusted
// //             development framework.
// //           </p>
// //         </div>

// //         {/* Timeline */}
// //         <div className="relative mt-12">
// //           {/* vertical connector line */}
// //           <div className="pointer-events-none absolute bottom-6 left-[19px] top-6 w-0.5 -translate-x-1/2 bg-brand/30" />

// //           <div className="space-y-14">
// //             {developSteps.map((s) => (
// //               <div key={s.n} className="relative grid grid-cols-[40px_1fr] gap-x-5 sm:gap-x-8">
// //                 <div
// //                   className={`relative z-10 grid h-10 w-10 place-items-center rounded-full text-[15px] font-bold text-white ring-4 ring-indigo-50 ${s.ring}`}
// //                 >
// //                   {s.n}
// //                 </div>

// //                 <div className="grid gap-7 lg:grid-cols-2 lg:items-start">
// //                   {/* Text */}
// //                   <div>
// //                     <h3 className="text-[20px] font-bold text-navy-800">
// //                       Step {String(s.n).padStart(2, '0')}: {s.title}
// //                     </h3>
// //                     <p className="mt-2 text-[13.5px] leading-relaxed text-slate-500">{s.desc}</p>

// //                     <StepAccordion faqs={s.faqs} />

// //                     <Link
// //                       href="/experts"
// //                       className="mt-5 inline-block rounded-lg bg-navy-800 px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-navy-700"
// //                     >
// //                       Contact Expert
// //                     </Link>
// //                   </div>

// //                   {/* Image */}
// //                   <div className="overflow-hidden rounded-2xl shadow-card lg:mt-1">
// //                     <img
// //                       src={s.img}
// //                       alt={s.title}
// //                       className="h-56 w-full object-cover sm:h-72 lg:h-[300px]"
// //                     />
// //                   </div>
// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       </div>
// //     </section>
// //   )
// // }

// // components/develop/DevelopTimeline.jsx
// 'use client'

// import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
// import Link from 'next/link'
// import { Check } from 'lucide-react'
// import StepAccordion from './StepAccordion'
// import { developSteps } from '@/data'

// const GRAD = 'linear-gradient(135deg,#3D6FF6 0%,#8B5CF6 100%)'
// const LAST = developSteps[developSteps.length - 1].n

// function usePrefersReducedMotion() {
//   const [reduce, setReduce] = useState(false)
//   useEffect(() => {
//     const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
//     const on = () => setReduce(mq.matches)
//     on(); mq.addEventListener('change', on)
//     return () => mq.removeEventListener('change', on)
//   }, [])
//   return reduce
// }

// export default function DevelopTimeline() {
//   const [active, setActive] = useState(1)
//   const reduce = usePrefersReducedMotion()

//   const containerRef = useRef(null)
//   const badgeRefs = useRef({})
//   const stepRefs = useRef({})
//   const [rail, setRail] = useState({ top: 0, height: 0, fill: 0 })

//   const measure = useCallback(() => {
//     const c = containerRef.current
//     const first = badgeRefs.current[developSteps[0].n]
//     const last = badgeRefs.current[LAST]
//     const cur = badgeRefs.current[active]
//     if (!c || !first || !last || !cur) return
//     const cTop = c.getBoundingClientRect().top
//     const centerY = (el) => el.getBoundingClientRect().top - cTop + el.offsetHeight / 2
//     const topY = centerY(first)
//     const height = centerY(last) - topY
//     const fill = Math.min(height, Math.max(0, centerY(cur) - topY))
//     setRail({ top: topY, height, fill })
//   }, [active])

//   useLayoutEffect(measure, [measure])

//   useEffect(() => {
//     measure()
//     const c = containerRef.current
//     const ro = new ResizeObserver(measure)
//     if (c) ro.observe(c)
//     window.addEventListener('resize', measure)
//     const imgs = c ? c.querySelectorAll('img') : []
//     imgs.forEach((img) => { if (!img.complete) img.addEventListener('load', measure, { once: true }) })
//     return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
//   }, [measure])

//   const select = useCallback((n, scroll = true) => {
//     setActive(n)
//     if (scroll && !reduce) stepRefs.current[n]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
//   }, [reduce])

//   const loaderDur = '900ms'

//   return (
//     <section className="bg-indigo-50">
//       <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
//         <div className="text-center">
//           <h2 className="text-[28px] font-extrabold text-navy-800 sm:text-[34px]">Your Vision, Visualized.</h2>
//           <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-slate-500">
//             Follow the unified path to your dream property with Jaipur&apos;s most trusted development framework.
//           </p>
//         </div>

//         <div ref={containerRef} className="relative mt-12">
//           {/* rail track */}
//           <div className="pointer-events-none absolute w-[3px] -translate-x-1/2 rounded-full bg-slate-200"
//                style={{ left: 20, top: rail.top, height: rail.height }} />
//           {/* animated gradient fill (the "loader" line) */}
//           <div className="mwc-rail-fill pointer-events-none absolute w-[3px] -translate-x-1/2 overflow-hidden rounded-full transition-[height] duration-700 ease-out"
//                style={{ left: 20, top: rail.top, height: rail.fill, background: GRAD }} />

//           <div className="space-y-14">
//             {developSteps.map((s) => {
//               const isActive = s.n === active
//               const isDone = s.n < active
//               return (
//                 <div key={s.n} ref={(el) => (stepRefs.current[s.n] = el)}
//                      className="relative grid grid-cols-[40px_1fr] gap-x-5 sm:gap-x-8">
//                   {/* number badge */}
//                   <button
//                     type="button"
//                     ref={(el) => (badgeRefs.current[s.n] = el)}
//                     onClick={() => select(s.n)}
//                     aria-current={isActive ? 'step' : undefined}
//                     aria-label={`Step ${s.n}: ${s.title}`}
//                     className={`relative z-10 grid h-10 w-10 place-items-center rounded-full text-[15px] font-bold text-white ring-4 ring-indigo-50 transition-all duration-300 focus:outline-none focus-visible:ring-brand/50 ${
//                       isActive ? 'mwc-pulse scale-110' : ''
//                     } ${!isActive && !isDone ? 'opacity-55 grayscale-[.35]' : ''} ${isDone ? '' : s.ring}`}
//                     style={isActive || isDone ? { background: GRAD } : undefined}
//                   >
//                     {isDone ? <Check className="h-[18px] w-[18px]" strokeWidth={3} /> : s.n}
//                   </button>

//                   <div className={`grid gap-7 rounded-2xl transition-colors duration-300 lg:grid-cols-2 lg:items-start ${
//                         isActive ? 'bg-white/70 p-4 shadow-card ring-1 ring-brand/15 lg:p-5' : 'p-0'
//                       }`}>
//                     {/* Text side */}
//                     <div>
//                       <button type="button" onClick={() => select(s.n)} className="text-left">
//                         <h3 className={`text-[20px] font-bold transition-colors ${isActive ? 'text-navy-900' : 'text-navy-800'}`}>
//                           Step {String(s.n).padStart(2, '0')}: {s.title}
//                         </h3>
//                       </button>

//                       {/* per-step loader line under the title */}
//                       <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-slate-200/70">
//                         {isActive && (
//                           <div key={active} className="mwc-loader-line h-full rounded-full"
//                                style={{ background: GRAD, '--mwc-dur': loaderDur }} />
//                         )}
//                       </div>

//                       <p className="mt-3 text-[13.5px] leading-relaxed text-slate-500">{s.desc}</p>

//                       <StepAccordion faqs={s.faqs} active={isActive} />

//                       <Link href={`/experts?from=develop&step=${s.n}`}
//                             className="mt-5 inline-flex items-center gap-2 rounded-lg bg-navy-800 px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-navy-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2">
//                         Contact Expert
//                       </Link>
//                     </div>

//                     {/* Image side */}
//                     <div className={`overflow-hidden rounded-2xl shadow-card transition-all duration-300 lg:mt-1 ${isActive ? 'ring-2 ring-brand/25' : ''}`}>
//                       <img src={s.img} alt={s.title}
//                            className={`h-56 w-full object-cover transition-transform duration-500 sm:h-72 lg:h-[300px] ${isActive ? 'scale-[1.03]' : 'scale-100'}`} />
//                     </div>
//                   </div>
//                 </div>
//               )
//             })}
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import StepAccordion from "./StepAccordion";
import { developSteps } from "@/data";

const GRAD = "linear-gradient(135deg,#3D6FF6 0%,#8B5CF6 100%)";
const FIRST = developSteps[0].n;

// "#16a34a" -> "22 163 74", for rgb(var(--x) / alpha) in the pulse keyframes.
const rgbOf = (hex) => {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16,
  );
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

const LAST = developSteps[developSteps.length - 1].n;

// Each build step maps to the expert category that handles it.
const EXPERT_CAT = {
  1: "Legal", // Land & Legal
  2: "Architecture", // Design & Planning
  3: "Approvals", // Approvals & Permits
  4: "Construction", // Construction
  5: "Solar", // Utilities & Systems
  6: "Interior", // Finishing & Handover
};

export default function DevelopTimeline() {
  const [active, setActive] = useState(FIRST);
  const [rail, setRail] = useState({ top: 0, height: 0, fill: 0 });

  const containerRef = useRef(null);
  const badgeRefs = useRef({});
  const stepRefs = useRef({});
  const rafRef = useRef(0);

  // Runs on every scroll frame: fills the rail to the scroll position
  // and picks the active step as the badge nearest the loader head.
  const compute = useCallback(() => {
    const c = containerRef.current;
    const first = badgeRefs.current[FIRST];
    const last = badgeRefs.current[LAST];
    if (!c || !first || !last) return;

    const cTop = c.getBoundingClientRect().top;
    const centerY = (el) =>
      el.getBoundingClientRect().top - cTop + el.offsetHeight / 2;

    const firstC = centerY(first);
    const lastC = centerY(last);

    // reference line at 45% down the viewport, in the container's coordinates
    const refLine = window.innerHeight * 0.45 - cTop;
    const head = Math.min(lastC, Math.max(firstC, refLine)); // clamp to the rail

    setRail({ top: firstC, height: lastC - firstC, fill: head - firstC });

    let best = FIRST;
    let bestDist = Infinity;
    developSteps.forEach((s) => {
      const d = Math.abs(centerY(badgeRefs.current[s.n]) - head);
      if (d < bestDist) {
        bestDist = d;
        best = s.n;
      }
    });
    setActive((prev) => (prev === best ? prev : best));
  }, []);

  const onScroll = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(compute);
  }, [compute]);

  useEffect(() => {
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const c = containerRef.current;
    const ro = new ResizeObserver(onScroll);
    if (c) ro.observe(c);
    const imgs = c ? c.querySelectorAll("img") : [];
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener("load", onScroll, { once: true });
    });
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      ro.disconnect();
    };
  }, [compute, onScroll]);

  const jumpTo = (n) => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    stepRefs.current[n]?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "center",
    });
  };

  return (
    <section className="bg-indigo-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-[28px] font-extrabold text-navy-800 sm:text-[34px]">
            Your Vision, Visualized.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-slate-500">
            Follow the unified path to your dream property with Jaipur&apos;s
            most trusted development framework.
          </p>
        </div>

        <div ref={containerRef} className="relative mt-12">
          {/* rail track (grey) */}
          <div
            className="pointer-events-none absolute w-[3px] -translate-x-1/2 rounded-full bg-slate-200"
            style={{ left: 20, top: rail.top, height: rail.height }}
          />
          {/* gradient fill — follows the scroll 1:1 (no CSS transition) */}
          <div
            className="mwc-rail-fill pointer-events-none absolute w-[3px] -translate-x-1/2 overflow-hidden rounded-full"
            style={{
              left: 20,
              top: rail.top,
              height: rail.fill,
              background: GRAD,
            }}
          />

          <div className="space-y-14">
            {developSteps.map((s) => {
              const isActive = s.n === active;
              const isDone = s.n < active;
              const reached = isActive || isDone; // scrolled past the badge
              return (
                <div
                  key={s.n}
                  ref={(el) => (stepRefs.current[s.n] = el)}
                  className="relative grid grid-cols-[40px_1fr] gap-x-5 sm:gap-x-8"
                >
                  {/* number badge — clickable shortcut only */}
                  <button
                    type="button"
                    ref={(el) => (badgeRefs.current[s.n] = el)}
                    onClick={() => jumpTo(s.n)}
                    aria-current={isActive ? "step" : undefined}
                    aria-label={`Jump to step ${s.n}: ${s.title}`}
                    className={`relative z-10 grid h-10 w-10 place-items-center rounded-full text-[15px] font-bold text-white ring-4 ring-indigo-50 transition-all duration-500 focus:outline-none focus-visible:ring-brand/50 ${
                      isActive ? "mwc-pulse scale-110" : ""
                    } ${reached ? "" : "bg-slate-300"}`}
                    /* Each step lights up in its own colour once you reach it;
                       upcoming steps stay neutral grey. */
                    style={
                      reached
                        ? {
                            background: s.color,
                            "--mwc-pulse-rgb": rgbOf(s.color),
                          }
                        : undefined
                    }
                  >
                    {isDone ? (
                      <Check className="h-[18px] w-[18px]" strokeWidth={3} />
                    ) : (
                      s.n
                    )}
                  </button>

                  <div
                    className={`grid gap-7 rounded-2xl transition-all duration-500 lg:grid-cols-2 lg:items-start ${
                      isActive
                        ? "bg-white/70 p-4 shadow-card ring-1 ring-brand/15 lg:p-5"
                        : "p-0"
                    }`}
                  >
                    {/* Text side */}
                    <div>
                      <h3
                        className={`text-[20px] font-bold transition-colors ${isActive ? "text-navy-900" : "text-navy-800"}`}
                      >
                        Step {String(s.n).padStart(2, "0")}: {s.title}
                      </h3>
                      {/* per-step loader line — refills when this step becomes active */}
                      <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-slate-200/70">
                        {isActive && (
                          <div
                            key={active}
                            className="mwc-loader-line h-full rounded-full"
                            style={{ background: GRAD, "--mwc-dur": "900ms" }}
                          />
                        )}
                      </div>
                      <p className="mt-3 text-[13.5px] leading-relaxed text-slate-500">
                        {s.desc}
                      </p>
                      <StepAccordion faqs={s.faqs} active={isActive} />
                      
                      <Link
                        href={`/experts?cat=${EXPERT_CAT[s.n]}#experts-directory`}
                        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-navy-800 px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-navy-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
                      >
                        Contact Expert
                      </Link>
                    </div>

                    {/* Image side */}
                    <div
                      className={`overflow-hidden rounded-2xl shadow-card transition-all duration-500 lg:mt-1 ${isActive ? "ring-2 ring-brand/25" : ""}`}
                    >
                      <img
                        src={s.img}
                        alt={s.title}
                        className={`h-56 w-full object-cover transition-transform duration-500 sm:h-72 lg:h-[300px] ${isActive ? "scale-[1.03]" : "scale-100"}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
