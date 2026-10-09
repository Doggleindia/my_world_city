'use client'

import { Bookmark } from 'lucide-react'
import { useSaved } from '@/components/saved/SavedProvider'

// The "Save property to shortlist" chip that sits on the hero image.
export default function PropertyHeroBar({ id }) {
  const { isSaved, toggle } = useSaved()
  const saved = id ? isSaved(id) : false

  return (
    <button
      type="button"
      onClick={() => id && toggle(id)}
      disabled={!id}
      aria-pressed={saved}
      className={`inline-flex shrink items-center gap-1.5 rounded px-3 py-2 text-[12px] font-bold shadow-sm transition sm:gap-2 sm:px-4 sm:py-2.5 sm:text-[13.5px] ${
        saved ? 'bg-navy-900 text-white' : 'bg-cyan text-navy-900 hover:bg-cyan-600'
      } disabled:opacity-60`}
    >
      <span className="sm:hidden">{saved ? 'Saved' : 'Save to shortlist'}</span>
      <span className="hidden sm:inline">{saved ? 'Saved to shortlist' : 'Save property to shortlist'}</span>
      <Bookmark className="h-4 w-4 sm:h-[18px] sm:w-[18px]" fill={saved ? 'currentColor' : 'none'} />
    </button>
  )
}
