'use client'

import { MessageCircle } from 'lucide-react'
import { useAssistant } from './AssistantProvider'

// Floating "Find property" button in the lower-right of the home page — the
// same distance from the bottom as from the right edge — so the Help Desk is
// one click away however far the visitor has scrolled. On phones it shrinks to
// a round icon so it never sits on top of the text being read. Steps aside
// while the panel itself is open.
export default function AssistantLauncher() {
  const { open, openAssistant } = useAssistant()

  return (
    <button
      type="button"
      onClick={openAssistant}
      aria-label="Find property — open the Help Desk"
      className={`fixed bottom-5 right-5 z-[80] inline-flex h-14 w-14 items-center justify-center gap-2 rounded-full bg-brand-800 text-[15px] font-semibold text-white shadow-[0_10px_30px_-8px_rgba(8,26,51,0.65)] transition-all duration-300 hover:bg-navy-700 sm:bottom-8 sm:right-8 sm:h-auto sm:w-auto sm:rounded-lg sm:px-5 sm:py-[18px] ${
        open ? 'pointer-events-none translate-y-3 opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      <MessageCircle className="h-6 w-6 sm:h-[18px] sm:w-[18px]" aria-hidden="true" />
      <span className="hidden sm:inline">Find property</span>
    </button>
  )
}
