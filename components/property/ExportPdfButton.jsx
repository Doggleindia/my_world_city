'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, Copy, Download, FileText, Link2, Loader2, Mail, Map, MessageCircle, Share2, X } from 'lucide-react'

// Builds a PDF of the listing in the browser, then opens a share sheet so it
// can go straight to WhatsApp, Drive, Mail… or be downloaded.
//   variant "brochure" — the full property brochure (Export pdf / Brochures)
//   variant "siteplan" — the unit schedule + location sheet (Plans / Download Site Plans)
// jsPDF is imported on click so it never lands in the page bundle.

const BRAND = [11, 63, 128] // brand-800
const INK = [10, 10, 10]
const MUTED = [90, 100, 115]
const PAGE_W = 595
const PAGE_H = 842
const MARGIN = 40
const CONTENT_W = PAGE_W - MARGIN * 2

// Fetch an image as a data URL plus its natural size. Returns null when the
// host blocks cross-origin reads — the PDF then simply has no photo.
async function loadImage(url) {
  if (!url) return null
  try {
    // a slow image host must not hold the download hostage
    const res = await fetch(url, { mode: 'cors', signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    const blob = await res.blob()
    const dataUrl = await new Promise((resolve) => {
      const fr = new FileReader()
      fr.onload = () => resolve(fr.result)
      fr.onerror = () => resolve(null)
      fr.readAsDataURL(blob)
    })
    if (!dataUrl) return null
    const dims = await new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
      img.onerror = () => resolve(null)
      img.src = dataUrl
    })
    if (!dims) return null
    const type = blob.type.includes('png') ? 'PNG' : 'JPEG'
    return { dataUrl, type, ...dims }
  } catch {
    return null
  }
}

// jsPDF's built-in Helvetica only knows Latin-1: the rupee sign and curly
// quotes would otherwise come out as stray glyphs.
const clean = (v) =>
  typeof v === 'string'
    ? v.replace(/₹\s?/g, 'Rs. ').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-')
    : Array.isArray(v)
      ? v.map(clean)
      : v && typeof v === 'object'
        ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clean(x)]))
        : v

function build(jsPDF, raw, variant) {
  const data = clean(raw)
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  let y = 0

  const ensure = (needed) => {
    if (y + needed > PAGE_H - MARGIN) {
      doc.addPage()
      y = MARGIN
    }
  }
  const text = (str, size, { bold = false, color = INK, gap = 4, indent = 0 } = {}) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(size)
    doc.setTextColor(...color)
    const lines = doc.splitTextToSize(String(str), CONTENT_W - indent)
    for (const line of lines) {
      ensure(size + gap)
      doc.text(line, MARGIN + indent, y + size)
      y += size + gap
    }
  }
  const heading = (str) => {
    ensure(40)
    y += 14
    doc.setDrawColor(210, 214, 220)
    doc.line(MARGIN, y, PAGE_W - MARGIN, y)
    y += 12
    text(str, 14, { bold: true, gap: 8 })
  }
  const bullets = (items) => {
    for (const it of items) {
      ensure(16)
      doc.setFillColor(...BRAND)
      doc.circle(MARGIN + 4, y + 7, 1.8, 'F')
      text(it, 10.5, { indent: 14, gap: 4 })
    }
  }
  const columns = (items, cols = 2) => {
    const colW = CONTENT_W / cols
    for (let i = 0; i < items.length; i += cols) {
      ensure(18)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10.5)
      doc.setTextColor(...INK)
      items.slice(i, i + cols).forEach((it, j) => {
        doc.setFillColor(...BRAND)
        doc.circle(MARGIN + j * colW + 4, y + 7, 1.8, 'F')
        doc.text(String(it), MARGIN + j * colW + 14, y + 10.5)
      })
      y += 18
    }
  }
  const table = (head, rows) => {
    const w = [CONTENT_W * 0.4, CONTENT_W * 0.3, CONTENT_W * 0.3]
    ensure(26)
    doc.setFillColor(...BRAND)
    doc.rect(MARGIN, y, CONTENT_W, 24, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(255, 255, 255)
    let x = MARGIN
    head.forEach((h, i) => { doc.text(h, x + 10, y + 15.5); x += w[i] })
    y += 24
    for (const r of rows) {
      ensure(26)
      doc.setDrawColor(200, 205, 212)
      doc.line(MARGIN, y + 24, PAGE_W - MARGIN, y + 24)
      x = MARGIN
      r.forEach((cell, i) => {
        doc.setFont('helvetica', i === 0 ? 'bold' : 'normal')
        doc.setFontSize(10)
        doc.setTextColor(...(i === 2 ? BRAND : i === 1 ? MUTED : INK))
        doc.text(String(cell), x + 10, y + 15.5)
        x += w[i]
      })
      y += 24
    }
  }

  // ---- header band ----
  doc.setFillColor(...BRAND)
  doc.rect(0, 0, PAGE_W, 64, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.setTextColor(255, 255, 255)
  doc.text('My World City', MARGIN, 40)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(variant === 'siteplan' ? 'Site plans & unit schedule' : 'Property brochure', PAGE_W - MARGIN, 40, { align: 'right' })
  y = 64 + 24

  // ---- photo ----
  if (data.photo) {
    const h = Math.min(260, Math.round((CONTENT_W * data.photo.h) / data.photo.w))
    doc.addImage(data.photo.dataUrl, data.photo.type, MARGIN, y, CONTENT_W, h)
    y += h + 18
  }

  // ---- headline ----
  text(data.title, 22, { bold: true, gap: 8 })
  text(data.address, 11, { color: MUTED, gap: 8 })
  text(
    [data.category, data.availability, data.priceLabel, data.areaLine].filter(Boolean).join('   •   '),
    10.5,
    { bold: true, gap: 6 },
  )

  if (variant === 'siteplan') {
    heading('Available units')
    table(['Unit name', 'Lettable area', 'Availability status'], data.units.map((u) => [u.name, u.area, u.status]))
    heading('Nearby connections')
    bullets(data.nearby.map((n) => [n.label, n.value].filter(Boolean).join(' — ')))
    heading('Site notes')
    bullets(data.structural)
  } else {
    heading('About this facility')
    text(data.about, 10.5, { gap: 5 })
    heading('Amenities')
    columns(data.amenities, 2)
    heading('Sustainability features')
    columns(data.sustainability, 2)
    heading('Property details')
    text('STRUCTURAL FEATURES', 9, { bold: true, color: MUTED, gap: 8 })
    bullets(data.structural)
    heading('Availability')
    table(['Unit name', 'Lettable area', 'Availability status'], data.units.map((u) => [u.name, u.area, u.status]))
    heading('Nearby connections')
    bullets(data.nearby.map((n) => [n.label, n.value].filter(Boolean).join(' — ')))
  }

  heading('Contact us')
  for (const c of data.contacts) {
    text(c.name, 11, { bold: true, gap: 2 })
    text([c.role, c.phone && `+91 ${c.phone}`, c.email].filter(Boolean).join('  •  '), 10, { color: MUTED, gap: 10 })
  }

  // ---- footer on every page ----
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...MUTED)
    doc.text(`${data.url}  •  Every property, real. Every partner, verified.`, MARGIN, PAGE_H - 22)
    doc.text(`${i} / ${pages}`, PAGE_W - MARGIN, PAGE_H - 22, { align: 'right' })
  }
  return doc
}

export default function ExportPdfButton({ data, variant = 'brochure', icon = 'download', badge, className = '', children }) {
  const [busy, setBusy] = useState(false)
  const [sheet, setSheet] = useState(null) // { file, filename, doc } once the PDF is built

  const run = async () => {
    if (busy) return
    setBusy(true)
    try {
      const [{ jsPDF }, photo] = await Promise.all([import('jspdf'), loadImage(data.photoUrl)])
      const doc = build(jsPDF, { ...data, photo, url: window.location.href }, variant)
      const filename = `${data.slug || 'property'}-${variant === 'siteplan' ? 'site-plans' : 'brochure'}.pdf`
      const file = new File([doc.output('blob')], filename, { type: 'application/pdf' })
      setSheet({ file, filename, doc })
    } finally {
      setBusy(false)
    }
  }

  const Icon = busy ? Loader2 : icon === 'file' ? FileText : icon === 'map' ? Map : Download

  return (
    <>
      <button type="button" onClick={run} disabled={busy} className={`relative ${className}`}>
        <Icon className={`h-4 w-4 sm:h-[18px] sm:w-[18px] ${busy ? 'animate-spin' : ''}`} />
        {children}
        {badge != null && (
          <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-brand-800 px-1 text-[11px] font-bold text-white">
            {badge}
          </span>
        )}
      </button>
      {/* Kept outside the button: React events bubble through the component
          tree even across a portal, so a sheet nested in the button would
          re-fire the export on every click inside it. */}
      {sheet && (
        <ShareSheet
          file={sheet.file}
          filename={sheet.filename}
          title={data.title}
          label={variant === 'siteplan' ? 'Site plans' : 'Brochure'}
          plural={variant === 'siteplan'}
          onDownload={() => sheet.doc.save(sheet.filename)}
          onClose={() => setSheet(null)}
        />
      )}
    </>
  )
}

/* ---------------- share sheet ---------------- */

// Shown as soon as the PDF is ready. "Share file" hands the actual PDF to the
// device's share sheet (WhatsApp, Drive, Gmail, AirDrop…) where the browser
// supports it; the other buttons work everywhere — WhatsApp and Email open
// with a ready-made message and the property link, and the file itself is a
// one-tap download for attaching.
function ShareSheet({ file, filename, title, label, plural = false, onDownload, onClose }) {
  const [copied, setCopied] = useState(false)
  const [canShareFile, setCanShareFile] = useState(false)
  const [note, setNote] = useState('')

  useEffect(() => {
    try { setCanShareFile(!!(navigator.canShare && navigator.canShare({ files: [file] }))) } catch { setCanShareFile(false) }
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [file, onClose])

  const url = typeof window !== 'undefined' ? window.location.href : ''
  const text = `${title} — ${label} from My World City\n${url}`

  const shareFile = async () => {
    try {
      await navigator.share({ files: [file], title, text: `${title} — My World City` })
      onClose()
    } catch (err) {
      if (err?.name !== 'AbortError') setNote('Sharing the file is not available here — download it and attach it instead.')
    }
  }
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* ignore */ }
  }

  const row = 'flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-[14px] font-medium text-navy-900 transition hover:border-brand hover:bg-brand/5'
  const ico = 'grid h-10 w-10 shrink-0 place-items-center rounded-full text-white'

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-navy-900/55 p-3 backdrop-blur-[2px] sm:items-center" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Share ${label}`}
        className="mwc-assistant w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl sm:p-6"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[17px] font-bold text-navy-900">Your {label.toLowerCase()} {plural ? 'are' : 'is'} ready</p>
            <p className="mt-0.5 truncate text-[13px] text-slate-600">{filename}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          {canShareFile && (
            <button type="button" onClick={shareFile} className={row}>
              <span className={`${ico} bg-gradient-to-br from-[#1f5fbf] to-[#22b9cb]`}><Share2 className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block">Share the PDF…</span>
                <span className="block text-[12px] font-normal text-slate-500">WhatsApp, Drive, Gmail and more</span>
              </span>
            </button>
          )}
          <button type="button" onClick={onDownload} className={row}>
            <span className={`${ico} bg-brand-800`}><Download className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1">
              <span className="block">Download PDF</span>
              <span className="block text-[12px] font-normal text-slate-500">Save it to this device</span>
            </span>
          </button>
          <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer" className={row}>
            <span className={`${ico} bg-[#25d366]`}><MessageCircle className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1">
              <span className="block">WhatsApp</span>
              <span className="block text-[12px] font-normal text-slate-500">Send the property link{canShareFile ? '' : ' — attach the downloaded PDF'}</span>
            </span>
          </a>
          <a href={`mailto:?subject=${encodeURIComponent(`${title} — ${label}`)}&body=${encodeURIComponent(text)}`} className={row}>
            <span className={`${ico} bg-[#ea4335]`}><Mail className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1">
              <span className="block">Email</span>
              <span className="block text-[12px] font-normal text-slate-500">Opens your mail app with the link</span>
            </span>
          </a>
          <button type="button" onClick={copy} className={row}>
            <span className={`${ico} bg-slate-700`}>{copied ? <Check className="h-5 w-5" /> : <Link2 className="h-5 w-5" />}</span>
            <span className="min-w-0 flex-1">
              <span className="block">{copied ? 'Link copied' : 'Copy property link'}</span>
              <span className="block text-[12px] font-normal text-slate-500">Paste it anywhere</span>
            </span>
            {!copied && <Copy className="h-4 w-4 text-slate-400" />}
          </button>
        </div>

        {note && <p className="mt-3 text-[12.5px] text-rose-600">{note}</p>}
      </div>
    </div>,
    document.body,
  )
}
