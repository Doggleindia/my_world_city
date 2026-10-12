'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Send, ShieldCheck, Paperclip, FileText, Image as ImageIcon, Loader2 } from 'lucide-react'
import SuccessCard from '@/components/SuccessCard'
import { submitLead } from '@/lib/leads'

/*
 * A reusable CTA that opens a general enquiry modal and posts a lead.
 * Use for "Talk to our team", "Dealer Program", "Connect to us", chat, etc.
 * Props: topic (prefilled context), title, subtitle, className, children.
 */
export default function ContactButton({
  topic = 'General enquiry',
  title = 'Talk to our team',
  subtitle = 'Leave your details and we’ll reach out shortly.',
  className,
  children,
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      <ContactModal
        open={open}
        onClose={() => setOpen(false)}
        topic={topic}
        title={title}
        subtitle={subtitle}
      />
    </>
  )
}

function ContactModal({ open, onClose, topic, title, subtitle }) {
  const [sent, setSent] = useState(false)
  const [refId, setRefId] = useState('')
  const [busy, setBusy] = useState(false)
  const [file, setFile] = useState(null)      // the chosen attachment, if any
  const [fileError, setFileError] = useState('')

  useEffect(() => {
    if (open) { setSent(false); setFile(null); setFileError('') }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const payload = {
      type: 'enquiry',
      name: fd.get('name'),
      phone: fd.get('phone'),
      email: fd.get('email') || '',
      message: `[${topic}] ${fd.get('message') || ''}`.trim(),
    }
    setBusy(true)
    setFileError('')
    // Upload the attachment first (optional); the enquiry still goes through
    // if the upload fails — the visitor is told so they can resend the file.
    if (file) {
      try {
        const body = new FormData()
        body.append('file', file)
        const res = await fetch('/api/leads/attachment', { method: 'POST', body })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Upload failed')
        payload.attachments = [{ url: data.url, name: data.name, type: data.type, size: data.size }]
      } catch (err) {
        setFileError(`We couldn’t attach ${file.name} (${err.message}). Your enquiry was still sent.`)
      }
    }
    setRefId(await submitLead(payload))
    setBusy(false)
    setSent(true)
  }

  const inputCls =
    'w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] text-slate-800 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20'

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-navy-900/60 backdrop-blur-sm" onMouseDown={onClose}>
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        {sent ? (
          <SuccessCard refId={refId} onClose={onClose} />
        ) : (
          <div
            className="relative w-full max-w-[460px] overflow-hidden rounded-3xl bg-white p-7 shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-[22px] font-extrabold text-navy-800">{title}</h2>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-500">{subtitle}</p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <input name="name" required placeholder="Full name" className={inputCls} />
              <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
                <span className="border-r border-slate-200 px-3.5 py-3 text-[14px] font-semibold text-slate-700">+91</span>
                <input
                  name="phone"
                  type="tel"
                  required
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  className="w-full px-3.5 py-3 text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <input name="email" type="email" placeholder="Email (optional)" className={inputCls} />
              <textarea name="message" rows={3} placeholder="How can we help?" className={`${inputCls} resize-none`} />

              {/* optional attachment: a PDF or image, up to 8 MB */}
              {file ? (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-brand shadow-sm">
                    {file.type === 'application/pdf' ? <FileText className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-navy-800">{file.name}</p>
                    <p className="text-[11.5px] text-slate-500">{file.size >= 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`}</p>
                  </div>
                  <button type="button" onClick={() => { setFile(null); setFileError('') }} aria-label="Remove attachment" className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 px-3.5 py-2.5 transition hover:border-brand hover:bg-brand/5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600"><Paperclip className="h-4 w-4" /></span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-navy-800">Attach a file <span className="font-normal text-slate-400">(optional)</span></span>
                    <span className="block text-[11.5px] text-slate-500">PDF or image, up to 8 MB</span>
                  </span>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      e.target.value = ''
                      if (!f) return
                      if (f.size > 8 * 1024 * 1024) { setFileError('That file is over 8 MB — please choose a smaller one.'); return }
                      if (!(f.type === 'application/pdf' || f.type.startsWith('image/'))) { setFileError('Please attach a PDF or an image.'); return }
                      setFileError(''); setFile(f)
                    }}
                  />
                </label>
              )}
              {fileError && <p className="text-[12.5px] font-medium text-rose-600">{fileError}</p>}
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-800 py-3.5 text-[15px] font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
              >
                {busy ? <><Loader2 className="h-[18px] w-[18px] animate-spin" /> {file ? 'Uploading & sending…' : 'Sending…'}</> : <>Send <Send className="h-[18px] w-[18px]" /></>}
              </button>
            </form>

            <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[12px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5" /> Your number stays private.
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
