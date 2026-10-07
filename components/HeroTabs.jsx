'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAssistant } from '@/components/assistant/AssistantProvider'
import AssistantPanel from '@/components/assistant/AssistantPanel'

// The two hero tabs. "Find Solution" opens the AI Help Desk as a section that
// drops down right beneath the tabs (the floating "Find property" button opens
// the same one and scrolls here), and closes it again on a second click.
export default function HeroTabs() {
  const { open, mode, session, toggleInline, closeAssistant } = useAssistant()
  const inline = open && mode === 'inline'
  const ref = useRef(null)

  // Bring the dropdown into view when it opens.
  useEffect(() => {
    if (inline) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [inline, session])

  return (
    <div ref={ref} id="find-solution" className="scroll-mt-24">
      <div className="mx-auto flex w-full max-w-3xl gap-2 rounded-full bg-slate-100 p-1.5">
        <button
          type="button"
          onClick={toggleInline}
          aria-expanded={inline}
          aria-controls="find-solution-panel"
          className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-3 text-center text-[14px] font-semibold shadow-sm transition sm:gap-2 sm:px-6 sm:text-[15px] ${
            inline
              ? 'bg-[#ffb020] text-navy-900 ring-2 ring-[#ffb020]/40 ring-offset-2 ring-offset-slate-100 hover:bg-[#f0a30f]'
              : 'bg-brand-800 text-white hover:bg-navy-700'
          }`}
        >
          Find Solution
        </button>
        <Link
          href="/list-property"
          className="flex-1 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-3 text-center text-[14px] font-semibold text-navy-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:px-6 sm:text-[15px]"
        >
          List Property
        </Link>
      </div>

      {inline && (
        <div
          id="find-solution-panel"
          role="region"
          aria-label="My World City Help Desk"
          className="mwc-assistant mx-auto mt-5 h-[680px] max-h-[calc(100vh-170px)] min-h-[440px] w-full max-w-3xl"
        >
          <AssistantPanel key={session} onClose={closeAssistant} />
        </div>
      )}
    </div>
  )
}
