'use client'

import { useEffect, useRef } from 'react'

// Reveals a section as it comes into view: it rises and eases forward slightly,
// so scrolling down the page reads as travelling into it rather than sliding
// content past. Once revealed it stays revealed — nothing re-animates on the
// way back up, which is what makes scroll animation feel nervous.
//
//   <Reveal>            a whole section
//   <Reveal stagger>    children come in one after another
export default function Reveal({ children, stagger = false, delay = 0, className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Respect the OS setting: show everything immediately, animate nothing.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('mwc-in')
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          el.classList.add('mwc-in')
          io.unobserve(e.target)
        }
      },
      // Start a little before the section reaches the fold so it is already
      // settling by the time it is properly on screen.
      { rootMargin: '0px 0px -12% 0px', threshold: 0.06 },
    )

    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`mwc-reveal ${stagger ? 'mwc-reveal-stagger' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
