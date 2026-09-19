'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

// Typing feel. Erasing is quicker than typing (that's how it reads naturally),
// and the pause after a finished phrase is short so the headline never looks
// like it has stalled.
const TYPE_MS = 52
const ERASE_MS = 26
const HOLD_MS = 1100
const GAP_MS = 180 // breath between erasing and the next word

// The tail of the hero headline types itself out, holds, erases, then moves on.
// The widest phrase is rendered invisibly underneath to reserve its width, so
// the line never reflows — and never pushes the headline onto an extra line —
// no matter which word is showing.
export default function RotatingWords({ items }) {
  const [i, setI] = useState(0)
  const [text, setText] = useState(items[0])
  const [phase, setPhase] = useState('hold') // hold -> erase -> gap -> type
  const [reduced, setReduced] = useState(false)
  const timer = useRef(null)

  const widest = useMemo(
    () => items.reduce((a, b) => (b.length > a.length ? b : a), items[0] || ''),
    [items],
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const on = (e) => setReduced(e.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  useEffect(() => {
    // Reduced motion: no typing at all, just swap the phrase gently.
    if (reduced) {
      const t = setInterval(() => setI((n) => (n + 1) % items.length), 3200)
      return () => clearInterval(t)
    }

    const word = items[i]
    const at = (ms, fn) => { timer.current = setTimeout(fn, ms) }

    if (phase === 'hold') {
      at(HOLD_MS, () => setPhase('erase'))
    } else if (phase === 'erase') {
      if (text.length > 0) {
        // Ease out of the word: the last few letters go a touch quicker.
        at(text.length < 4 ? ERASE_MS * 0.7 : ERASE_MS, () => setText(text.slice(0, -1)))
      } else {
        setPhase('gap')
      }
    } else if (phase === 'gap') {
      at(GAP_MS, () => { setI((n) => (n + 1) % items.length); setPhase('type') })
    } else if (text.length < word.length) {
      // Slight variation per keystroke so it reads as typing, not a metronome.
      at(TYPE_MS + (text.length % 3) * 9, () => setText(word.slice(0, text.length + 1)))
    } else {
      setPhase('hold')
    }

    return () => clearTimeout(timer.current)
  }, [phase, text, i, items, reduced])

  const shown = reduced ? items[i] : text

  return (
    <span className="relative inline-block whitespace-nowrap align-bottom">
      {/* invisible sizer: holds the line at the width of the longest phrase */}
      <span aria-hidden="true" className="invisible block">{widest}</span>

      {/* The visible phrase sits on top of the reserved space. This inner span
          shrink-wraps the typed text, so the rule under it grows and shrinks
          with the word instead of spanning the whole reserved width. */}
      <span className="absolute inset-0 flex items-start">
        <span className="relative inline-block pb-3">
          <span className="mwc-hero-gradient">{shown}</span>
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-0 h-[6px] w-full rounded-sm bg-white/90"
          />
        </span>
        {!reduced && <span aria-hidden="true" className="mwc-caret" />}
      </span>
    </span>
  )
}
