'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronRight } from 'lucide-react'

// Featured listings in one swipeable row. When the row first scrolls into view
// a round arrow pops up on its right edge to say "there's more this way", then
// fades out by itself after a few seconds (or as soon as the visitor scrolls the
// row). Tapping the arrow slides the row along by one card.
const HINT_MS = 3500

export default function FeaturedRow({ children }) {
  const rowRef = useRef(null)
  const timer = useRef(null)
  const [hint, setHint] = useState(false)

  useEffect(() => {
    const row = rowRef.current
    if (!row) return

    const hide = () => {
      clearTimeout(timer.current)
      setHint(false)
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        // nothing to hint at if every card already fits
        if (row.scrollWidth <= row.clientWidth + 4) return
        setHint(true)
        timer.current = setTimeout(() => setHint(false), HINT_MS)
      },
      { threshold: 0.5 },
    )
    io.observe(row)
    row.addEventListener('scroll', hide, { passive: true, once: true })

    return () => {
      io.disconnect()
      row.removeEventListener('scroll', hide)
      clearTimeout(timer.current)
    }
  }, [])

  const next = () => {
    const row = rowRef.current
    const card = row?.firstElementChild
    if (!row || !card) return
    row.scrollBy({ left: card.getBoundingClientRect().width + 24, behavior: 'smooth' })
  }

  return (
    <div className="relative mt-10 lg:mt-14">
      <div
        ref={rowRef}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth scroll-px-4 px-4 pb-4 pt-2 sm:-mx-6 sm:scroll-px-6 sm:px-6"
      >
        {children}
      </div>

      <button
        type="button"
        onClick={next}
        aria-label="See more featured properties"
        tabIndex={hint ? 0 : -1}
        className={`absolute right-1 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white text-brand-800 shadow-[0_10px_30px_-8px_rgba(8,26,51,0.45)] ring-1 ring-slate-200 transition-all duration-500 sm:right-0 ${
          hint ? 'mwc-swipe-hint pointer-events-auto opacity-100' : 'pointer-events-none translate-x-3 opacity-0'
        }`}
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  )
}
