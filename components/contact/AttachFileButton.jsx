'use client'

import { useRef, useState } from 'react'
import { Paperclip } from 'lucide-react'
import { ContactModal } from './ContactButton'

// "Attach a file" shortcut: picks a PDF or image straight away, then opens the
// enquiry form with that file already attached, so the visitor only has to
// add their name and number.
//   topic / title / subtitle — same as ContactButton, passed to the form
//   variant "light" (on dark photos) or "card" (on light pages)
export default function AttachFileButton({
  topic = 'General enquiry',
  title = 'Talk to our team',
  subtitle = 'Leave your details and we’ll reach out shortly.',
  variant = 'card',
  className = '',
}) {
  const input = useRef(null)
  const [file, setFile] = useState(null)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')

  const pick = (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (f.size > 8 * 1024 * 1024) { setError('That file is over 8 MB — please choose a smaller one.'); return }
    if (!(f.type === 'application/pdf' || f.type.startsWith('image/'))) { setError('Please attach a PDF or an image.'); return }
    setError('')
    setFile(f)
    setOpen(true)
  }

  const look =
    variant === 'light'
      ? 'border-white/45 bg-white/10 text-white hover:border-white hover:bg-white/20'
      : 'border-brand/35 bg-white text-brand shadow-sm hover:border-brand hover:bg-brand/5'

  return (
    <>
      <button
        type="button"
        onClick={() => input.current?.click()}
        className={`inline-flex items-center gap-2 rounded-full border-[1.5px] px-5 py-3 text-[14px] font-semibold transition ${look} ${className}`}
      >
        <Paperclip className="h-4 w-4" />
        Attach a file
        <span className={`text-[12px] font-normal ${variant === 'light' ? 'text-white/70' : 'text-slate-500'}`}>PDF or image</span>
      </button>
      <input ref={input} type="file" accept="application/pdf,image/*" className="sr-only" onChange={pick} />
      {error && <p className={`mt-2 text-[12.5px] font-medium ${variant === 'light' ? 'text-amber-200' : 'text-rose-600'}`}>{error}</p>}

      <ContactModal
        open={open}
        onClose={() => { setOpen(false); setFile(null) }}
        topic={topic}
        title={title}
        subtitle={subtitle}
        initialFile={file}
      />
    </>
  )
}
