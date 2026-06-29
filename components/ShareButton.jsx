'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

// Absolute URL from a possibly-relative path.
function absolute(url) {
  if (!url) return typeof window !== 'undefined' ? window.location.href : ''
  if (url.startsWith('http')) return url
  return typeof window !== 'undefined' ? window.location.origin + url : url
}

export default function ShareButton({
  url,
  title = 'My World City',
  text = 'Check out this property on My World City',
  className = '',
  label,
  size = 18,
  stopPropagation = true,
}) {
  const [copied, setCopied] = useState(false)

  const onShare = async (e) => {
    if (stopPropagation) {
      e.preventDefault()
      e.stopPropagation()
    }
    const link = absolute(url)
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url: link })
        return
      }
    } catch {
      // user cancelled or share failed — fall through to clipboard
    }
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={onShare}
      aria-label="Share"
      title={copied ? 'Link copied' : 'Share'}
      className={`transition ${className}`}
    >
      {copied ? (
        <Check style={{ width: size, height: size }} className="text-emerald-500" />
      ) : (
        <Share2 style={{ width: size, height: size }} />
      )}
      {label && <span className="ml-2">{copied ? 'Copied!' : label}</span>}
    </button>
  )
}
