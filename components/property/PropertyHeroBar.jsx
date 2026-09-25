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
      className={`inline-flex items-center gap-2 rounded px-4 py-2.5 text-[13.5px] font-bold shadow-sm transition ${
        saved ? 'bg-navy-900 text-white' : 'bg-cyan text-navy-900 hover:bg-cyan-600'
      } disabled:opacity-60`}
    >
      {saved ? 'Saved to shortlist' : 'Save property to shortlist'}
      <Bookmark className="h-[18px] w-[18px]" fill={saved ? 'currentColor' : 'none'} />
    </button>
  )
}
