'use client'

import { useEffect, useRef } from 'react'

// Lives inside the transparent home-page header. Once the page has scrolled
// past the header's resting spot it flips the header into its fixed, white
// state (and back again on the way up) by toggling a class — the header
// itself stays a server component.
export default function NavScrollWatcher() {
  const ref = useRef(null)

  useEffect(() => {
    const header = ref.current?.closest('header')
    if (!header) return
    let frame = 0
    const update = () => {
      frame = 0
      // Remember where the header rests in the document (just below the
      // promo strip) while it is still in its absolute position, so the
      // switch to fixed happens exactly there with no visible jump.
      if (!header.classList.contains('is-scrolled')) {
        header.dataset.top = String(Math.round(header.getBoundingClientRect().top + window.scrollY))
      }
      header.classList.toggle('is-scrolled', window.scrollY >= Number(header.dataset.top || 0))
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return <span ref={ref} hidden />
}
