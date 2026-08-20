// 'use client'

// import { useState } from 'react'
// import { ChevronDown, ChevronUp } from 'lucide-react'

// export default function StepAccordion({ faqs }) {
//   const [open, setOpen] = useState(-1)

//   return (
//     <div className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
//       {faqs.map((f, i) => {
//         const isOpen = open === i
//         return (
//           <div key={f.q}>
//             <button
//               type="button"
//               onClick={() => setOpen(isOpen ? -1 : i)}
//               className="flex w-full items-center justify-between gap-3 py-3 text-left"
//             >
//               <span className="text-[13.5px] font-medium text-navy-800">
//                 {!isOpen && <span className="text-slate-400">{i + 1}. </span>}
//                 {f.q}
//               </span>
//               {isOpen ? (
//                 <ChevronUp className="h-4 w-4 shrink-0 text-slate-500" />
//               ) : (
//                 <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
//               )}
//             </button>
//             {isOpen && (
//               <p className="pb-4 text-[13px] leading-relaxed text-slate-500">{f.a}</p>
//             )}
//           </div>
//         )
//       })}
//     </div>
//   )
// }







// components/develop/StepAccordion.jsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function StepAccordion({ faqs, active = false }) {
  const [open, setOpen] = useState(-1)

  useEffect(() => { setOpen(active ? 0 : -1) }, [active])

  return (
    <div className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
      {faqs.map((f, i) => {
        const isOpen = open === i
        return (
          <div key={f.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 py-3 text-left"
            >
              <span className="text-[13.5px] font-medium text-navy-800">
                <span className={isOpen ? 'text-brand' : 'text-slate-400'}>{i + 1}. </span>
                {f.q}
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                  isOpen ? 'rotate-180 text-brand' : 'text-slate-400'
                }`}
              />
            </button>
            <AnswerPanel open={isOpen}>{f.a}</AnswerPanel>
          </div>
        )
      })}
    </div>
  )
}

function AnswerPanel({ open, children }) {
  const ref = useRef(null)
  const [max, setMax] = useState(0)
  useEffect(() => { setMax(open && ref.current ? ref.current.scrollHeight : 0) }, [open, children])
  return (
    <div style={{ maxHeight: max }} className="overflow-hidden transition-[max-height] duration-300 ease-out">
      <p ref={ref} className="pb-4 text-[13px] leading-relaxed text-slate-500">{children}</p>
    </div>
  )
}