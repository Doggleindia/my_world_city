'use client'

import { Heart, Bookmark, BookmarkPlus } from 'lucide-react'
import { useSaved } from '@/components/saved/SavedProvider'

// Reusable save toggle. `id` is the property id; pass `className` for the button shell.
// `icon` picks the glyph: the heart (default) or the bookmark used on listing cards.
export default function SaveButton({ id, className = '', size = 18, stopPropagation = true, icon = 'heart' }) {
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
      className={`transition ${icon === 'bookmark' ? '' : saved ? 'text-ember' : 'text-slate-400 hover:text-ember'} ${className}`}
    >
      {icon === 'bookmark' ? (
        saved ? (
          <Bookmark style={{ width: size, height: size }} fill="currentColor" />
        ) : (
          <BookmarkPlus style={{ width: size, height: size }} />
        )
      ) : (
        <Heart style={{ width: size, height: size }} fill={saved ? 'currentColor' : 'none'} />
      )}
    </button>
  )
}
