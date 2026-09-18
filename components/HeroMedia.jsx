'use client'

import { useEffect, useRef } from 'react'

// The hero video, nudged as the page scrolls: it drifts up a little slower than
// the page and eases in very slightly, which reads as moving forward into the
// scene rather than the picture just sliding away.
export default function HeroMedia({ src, poster }) {
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
        // 0 at the top of the page, 1 once the hero has scrolled fully away.
        const p = Math.min(1, Math.max(0, window.scrollY / (el.clientHeight || 1)))
        el.style.transform = `translate3d(0, ${(p * 14).toFixed(2)}%, 0) scale(${(1 + p * 0.12).toFixed(4)})`
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
    <video
      ref={ref}
      // taller than the box so the drift never exposes an edge
      className="absolute inset-x-0 top-0 h-[118%] w-full origin-center object-cover will-change-transform"
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
    />
  )
}
