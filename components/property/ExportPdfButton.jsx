'use client'

import { useState } from 'react'
import { Download, FileText, Loader2, Map } from 'lucide-react'

// Builds a PDF of the listing in the browser and downloads it.
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

  const run = async () => {
    if (busy) return
    setBusy(true)
    try {
      const [{ jsPDF }, photo] = await Promise.all([import('jspdf'), loadImage(data.photoUrl)])
      const doc = build(jsPDF, { ...data, photo, url: window.location.href }, variant)
      doc.save(`${data.slug || 'property'}-${variant === 'siteplan' ? 'site-plans' : 'brochure'}.pdf`)
    } finally {
      setBusy(false)
    }
  }

  const Icon = busy ? Loader2 : icon === 'file' ? FileText : icon === 'map' ? Map : Download

  return (
    <button type="button" onClick={run} disabled={busy} className={`relative ${className}`}>
      <Icon className={`h-4 w-4 sm:h-[18px] sm:w-[18px] ${busy ? 'animate-spin' : ''}`} />
      {children}
      {badge != null && (
        <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-brand-800 px-1 text-[11px] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  )
}
