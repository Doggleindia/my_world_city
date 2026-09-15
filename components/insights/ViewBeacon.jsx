'use client'

import { useEffect } from 'react'

// Fires one "this article was read" ping after the page mounts. Deliberately
// silent — a failed count must never affect the reader.
export default function ViewBeacon({ slug }) {
  useEffect(() => {
    const key = `mwc:viewed:${slug}`
    try {
      if (sessionStorage.getItem(key)) return // already counted this session
      sessionStorage.setItem(key, '1')
    } catch {}
    fetch(`/api/insights/${encodeURIComponent(slug)}/view`, { method: 'POST', keepalive: true }).catch(() => {})
  }, [slug])
  return null
}
