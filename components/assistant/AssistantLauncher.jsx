'use client'

import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { useAssistant } from './AssistantProvider'

// Floating "Find property" button pinned to the right edge of the home page,
// so the Help Desk is one click away however far the visitor has scrolled.
// It steps aside while the in-page button (`watch`) is on screen, and while
// the panel itself is open.
export default function AssistantLauncher({ watch }) {
  const { open, openAssistant } = useAssistant()
  const [inlineVisible, setInlineVisible] = useState(false)

  useEffect(() => {
    if (!watch) return
    const el = document.getElementById(watch)
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setInlineVisible(e.isIntersecting), { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [watch])

  const hidden = open || inlineVisible

  return (
    <button
      type="button"
      onClick={openAssistant}
      aria-label="Find property — open the Help Desk"
      className={`fixed right-4 top-[58%] z-[80] inline-flex -translate-y-1/2 items-center gap-2 rounded-lg bg-brand-800 px-4 py-3 text-[14px] font-semibold text-white shadow-[0_10px_30px_-8px_rgba(8,26,51,0.65)] transition-all duration-300 hover:bg-navy-700 sm:right-6 sm:px-5 sm:py-[18px] sm:text-[15px] ${
        hidden ? 'pointer-events-none translate-x-6 opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
      Find property
    </button>
  )
}
