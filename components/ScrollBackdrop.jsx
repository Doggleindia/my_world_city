'use client'

import { useEffect, useRef } from 'react'

// A fixed layer behind the whole page. Its soft colour fields and faint grid
// travel upward as the user scrolls — each at a different rate — so the page
// reads as moving through a space rather than sliding over a flat sheet.
// Everything here is decorative and very low contrast; the content above stays
// the thing you actually look at.
export default function ScrollBackdrop() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const y = window.scrollY
        // Three depths: the further "back" a layer is, the slower it travels.
        el.style.setProperty('--mwc-far', `${-(y * 0.06).toFixed(1)}px`)
        el.style.setProperty('--mwc-mid', `${-(y * 0.14).toFixed(1)}px`)
        el.style.setProperty('--mwc-near', `${-(y * 0.3).toFixed(1)}px`)
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div ref={ref} aria-hidden="true" className="mwc-backdrop">
      <span className="mwc-backdrop-grid" />
      <span className="mwc-backdrop-glow mwc-backdrop-glow-a" />
      <span className="mwc-backdrop-glow mwc-backdrop-glow-b" />
      <span className="mwc-backdrop-glow mwc-backdrop-glow-c" />
    </div>
  )
}
