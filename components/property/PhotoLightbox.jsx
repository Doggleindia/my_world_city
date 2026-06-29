'use client'

import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Grid2x2, X, ChevronLeft, ChevronRight } from 'lucide-react'

// Renders the "View all N photos" trigger and a fullscreen gallery overlay.
export default function PhotoLightbox({ images = [], count }) {
  const photos = images.filter(Boolean)
  const [open, setOpen] = useState(false)
  const [idx, setIdx] = useState(0)

  const prev = useCallback(() => setIdx((i) => (i - 1 + photos.length) % photos.length), [photos.length])
  const next = useCallback(() => setIdx((i) => (i + 1) % photos.length), [photos.length])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, prev, next])

  if (photos.length === 0) return null

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIdx(0)
          setOpen(true)
        }}
        className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/55 to-transparent p-3"
      >
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/55 px-3 py-1.5 text-[12.5px] font-semibold text-white backdrop-blur-sm">
          <Grid2x2 className="h-4 w-4" /> View all {count || photos.length} photos
        </span>
      </button>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[120] flex flex-col bg-black/95" onClick={() => setOpen(false)}>
            <div className="flex items-center justify-between px-5 py-4 text-white">
              <span className="text-[14px] font-semibold">
                {idx + 1} / {photos.length}
              </span>
              <button onClick={() => setOpen(false)} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="relative flex flex-1 items-center justify-center px-4 pb-6" onClick={(e) => e.stopPropagation()}>
              <button onClick={prev} aria-label="Previous" className="absolute left-3 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <img src={photos[idx]} alt={`Photo ${idx + 1}`} className="max-h-[78vh] max-w-[90vw] rounded-xl object-contain" />
              <button onClick={next} aria-label="Next" className="absolute right-3 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto px-5 pb-5" onClick={(e) => e.stopPropagation()}>
              {photos.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg ring-2 transition ${i === idx ? 'ring-white' : 'ring-transparent opacity-60'}`}
                >
                  <img src={p} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
