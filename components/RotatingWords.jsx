'use client'

import { useEffect, useState } from 'react'

// Swaps the tail of the hero headline on a timer: fades the current phrase out,
// switches it, fades the next one in. Renders items[0] on the server so the
// sentence is complete in the HTML before hydration.
export default function RotatingWords({ items, interval = 2800, fade = 380 }) {
  const [i, setI] = useState(0)
  const [shown, setShown] = useState(true)

  useEffect(() => {
    if (items.length < 2) return
    let swap
    const tick = setInterval(() => {
      setShown(false)
      swap = setTimeout(() => {
        setI((n) => (n + 1) % items.length)
        setShown(true)
      }, fade)
    }, interval)
    return () => {
      clearInterval(tick)
      clearTimeout(swap)
    }
  }, [items.length, interval, fade])

  return (
    // Carries its own gradient: the transform below creates a stacking context,
    // which would otherwise cut it out of the h1's background-clip:text fill.
    <span
      className="mwc-hero-gradient mwc-rotate inline-block whitespace-nowrap"
      data-shown={shown}
    >
      {items[i]}
    </span>
  )
}
