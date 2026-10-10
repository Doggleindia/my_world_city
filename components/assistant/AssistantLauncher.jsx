'use client'

import { useEffect, useState } from 'react'
import { useAssistant } from './AssistantProvider'

// Floating Help Desk launcher in the lower-right of the home page: a round
// white button carrying the brand mark, a red "1" badge, and a greeting
// bubble ("Hello there 👋, chat with us!") that slides in a moment after the
// page loads. Both open the chat as a floating panel right where the visitor
// is, on every page; once opened, the badge and greeting stay away for the
// rest of the visit.
export default function AssistantLauncher() {
  const { open, openAssistant } = useAssistant()
  const [greet, setGreet] = useState(false)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setGreet(true), 1400)
    return () => clearTimeout(t)
  }, [])

  const launch = () => {
    setSeen(true)
    setGreet(false)
    openAssistant('floating')
  }

  const hidden = open

  return (
    <div
      className={`fixed bottom-5 right-4 z-[80] flex items-center gap-3 transition-all duration-300 sm:bottom-7 sm:right-7 ${
        hidden ? 'pointer-events-none translate-y-3 opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      {/* greeting bubble */}
      {greet && !seen && (
        <button
          type="button"
          onClick={launch}
          className="mwc-greet relative max-w-[230px] rounded-2xl bg-white px-4 py-2.5 text-left text-[13.5px] font-bold leading-snug text-navy-900 shadow-[0_10px_30px_-10px_rgba(8,26,51,0.45)] ring-1 ring-slate-200 sm:max-w-none sm:text-[14.5px]"
        >
          Hello there <span aria-hidden="true">👋</span>, looking for a property? Chat with us!
          {/* little tail pointing at the button */}
          <span aria-hidden="true" className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 bg-white ring-1 ring-slate-200 [clip-path:polygon(100%_0,100%_100%,0_100%)]" />
        </button>
      )}

      {/* the button */}
      <button
        type="button"
        onClick={launch}
        aria-label="Chat with us — open the Help Desk"
        className="group relative grid h-[60px] w-[60px] shrink-0 place-items-center rounded-full bg-white shadow-[0_12px_30px_-8px_rgba(8,26,51,0.55)] ring-1 ring-slate-200 transition hover:scale-105 sm:h-16 sm:w-16"
      >
        {/* soft pulse so the eye finds it */}
        {!seen && <span aria-hidden="true" className="mwc-pulse absolute inset-0 rounded-full bg-brand/25" />}

        {/* brand mark: the orange house outline with MWC inside */}
        <svg viewBox="0 0 64 64" className="relative h-9 w-9 sm:h-10 sm:w-10" aria-hidden="true">
          <path d="M8 29 L32 10 L56 29" fill="none" stroke="#FF9800" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 27 V52 H50 V27" fill="none" stroke="#FF9800" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="32" y="46" textAnchor="middle" fontFamily="stolzl, sans-serif" fontWeight="700" fontSize="15" fill="#0b2a5c">MWC</text>
        </svg>

        {/* unread badge */}
        {!seen && (
          <span className="absolute -right-0.5 -top-0.5 grid h-6 w-6 place-items-center rounded-full bg-[#e3342f] text-[12px] font-bold text-white ring-2 ring-white">
            1
          </span>
        )}
      </button>
    </div>
  )
}
