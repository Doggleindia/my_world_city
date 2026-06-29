'use client'

import { Heart } from 'lucide-react'
import { useSaved } from '@/components/saved/SavedProvider'

// Reusable heart toggle. `id` is the property id; pass `className` for the button shell.
export default function SaveButton({ id, className = '', size = 18, stopPropagation = true }) {
  const { isSaved, toggle } = useSaved()
  const saved = isSaved(id)

  return (
    <button
      type="button"
      aria-label={saved ? 'Remove from saved' : 'Save'}
      aria-pressed={saved}
      onClick={(e) => {
        if (stopPropagation) {
          e.preventDefault()
          e.stopPropagation()
        }
        toggle(id)
      }}
      className={`transition ${saved ? 'text-ember' : 'text-slate-400 hover:text-ember'} ${className}`}
    >
      <Heart style={{ width: size, height: size }} fill={saved ? 'currentColor' : 'none'} />
    </button>
  )
}
