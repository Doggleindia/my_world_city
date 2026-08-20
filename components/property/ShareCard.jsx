'use client'

import { useEffect, useRef, useState } from 'react'
import { Mail, Link2, Share2, Check, ChevronDown } from 'lucide-react'
import WhatsAppIcon from '@/components/icons/WhatsAppIcon'

// Its own card under the contact card: one Share button that opens a dropdown
// with the individual channels, instead of a stack of four buttons.
export default function ShareCard({ property }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const wrapRef = useRef(null)
  const btnRef = useRef(null)

  // Close on outside click and on Escape (same pattern as the account menu).
  useEffect(() => {
    if (!open) return
    const onClick = (e) => wrapRef.current && !wrapRef.current.contains(e.target) && setOpen(false)
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      btnRef.current?.focus()
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const pageUrl = () => (typeof window !== 'undefined' ? window.location.href : '')
  const shareText = `${property.title} — ${property.location}`

  const onWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${pageUrl()}`)}`, '_blank')
    setOpen(false)
  }
  const onEmail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(property.title)}&body=${encodeURIComponent(`${shareText}\n${pageUrl()}`)}`
    setOpen(false)
  }
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl())
      setCopied(true)
      // Keep the menu open long enough for the "Link copied!" confirmation to land.
      setTimeout(() => setCopied(false), 1800)
      setTimeout(() => setOpen(false), 900)
    } catch {
      /* ignore */
    }
  }
  const onShare = async () => {
    try {
      if (navigator.share) {
        setOpen(false)
        await navigator.share({ title: property.title, text: shareText, url: pageUrl() })
        return
      }
    } catch {
      return
    }
    onCopy() // no native share sheet (most desktops) — fall back to copying the link
  }

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
        Share this property
      </p>

      <div className="relative mt-3" ref={wrapRef}>
        <button
          ref={btnRef}
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={open}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-3 text-[14px] font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
        >
          <Share2 className="h-[18px] w-[18px]" /> Share
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <div
            role="menu"
            aria-label="Share this property"
            className="mwc-pop absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border border-slate-100 bg-white py-1.5 shadow-card"
          >
            <ShareItem icon={WhatsAppIcon} label="WhatsApp" tone="text-[#25D366]" onClick={onWhatsApp} />
            <ShareItem icon={Mail} label="Email" onClick={onEmail} />
            <ShareItem
              icon={copied ? Check : Link2}
              label={copied ? 'Link copied!' : 'Copy link'}
              tone={copied ? 'text-emerald-500' : undefined}
              onClick={onCopy}
            />
            <ShareItem icon={Share2} label="Share" onClick={onShare} />
          </div>
        )}
      </div>
    </div>
  )
}

function ShareItem({ icon: Icon, label, tone, onClick }) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13.5px] font-semibold text-slate-600 transition hover:bg-brand/[0.07] hover:text-navy-800"
    >
      <Icon className={`h-[17px] w-[17px] ${tone || 'text-slate-500'}`} /> {label}
    </button>
  )
}
