'use client'

import { useEffect, useState } from 'react'

const TYPE_MS = 65 // per character while typing
const ERASE_MS = 35 // per character while erasing
const HOLD_MS = 1700 // how long a finished phrase sits before it erases

// The tail of the hero headline types itself out, holds, erases, then moves on
// to the next phrase — with a thick rule underneath it, matching the reference.
// items[0] is rendered whole on the server, so the sentence reads correctly
// before hydration and the first client render matches it exactly.
export default function RotatingWords({ items }) {
  const [i, setI] = useState(0)
  const [text, setText] = useState(items[0])
  const [phase, setPhase] = useState('hold') // hold -> erase -> type -> hold
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    // No typing for anyone who asked for reduced motion — just swap the phrase.
    if (reduced) {
      const t = setInterval(() => setI((n) => (n + 1) % items.length), 3200)
      return () => clearInterval(t)
    }

    const word = items[i]
    let t

    if (phase === 'hold') {
      t = setTimeout(() => setPhase('erase'), HOLD_MS)
    } else if (phase === 'erase') {
      if (text.length > 0) {
        t = setTimeout(() => setText(text.slice(0, -1)), ERASE_MS)
      } else {
        setI((n) => (n + 1) % items.length)
        setPhase('type')
      }
    } else if (text.length < word.length) {
      t = setTimeout(() => setText(word.slice(0, text.length + 1)), TYPE_MS)
    } else {
      setPhase('hold')
    }

    return () => clearTimeout(t)
  }, [phase, text, i, items, reduced])

  const shown = reduced ? items[i] : text

  return (
    <span className="relative inline-block whitespace-nowrap pb-3 pr-1">
      <span className="mwc-hero-gradient">{shown}</span>
      {/* the rule tracks the typed text, and keeps a little tail past it */}
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-[6px] w-full min-w-[14px] rounded-sm bg-white/90"
      />
    </span>
  )
}
