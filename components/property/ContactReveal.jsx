'use client'

import { useState } from 'react'
import { Eye, Mail, Phone } from 'lucide-react'

// Phone and email stay hidden until the visitor asks for them — a masked
// preview ("+91 98XXX XXX45", "r•••@myworldcity.in") plus a "View contact"
// button. Once revealed they become tap-to-call / tap-to-mail links.
const maskPhone = (p) => `+91 ${p.slice(0, 2)}XXX XXX${p.slice(-2)}`
const maskEmail = (e) => {
  const [user, domain] = e.split('@')
  return `${user.slice(0, 1)}•••@${domain || ''}`
}

export default function ContactReveal({ phone, email, compact = false }) {
  const [shown, setShown] = useState(false)
  if (!phone && !email) return null

  const line = compact ? 'mt-1 text-[14px]' : 'mt-2 text-[15px]'

  if (!shown) {
    return (
      <div className={compact ? 'mt-1.5' : 'mt-2.5'}>
        {phone && (
          <p className={`flex items-center gap-2 text-slate-400 ${line} select-none`}>
            <Phone className="h-4 w-4 shrink-0" /> {maskPhone(phone)}
          </p>
        )}
        {email && (
          <p className={`flex items-center gap-2 text-slate-400 ${line} select-none`}>
            <Mail className="h-4 w-4 shrink-0" /> <span className="truncate">{maskEmail(email)}</span>
          </p>
        )}
        <button
          type="button"
          onClick={() => setShown(true)}
          className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-brand-800 px-3.5 py-1.5 text-[13px] font-semibold text-brand-800 transition hover:bg-brand-800 hover:text-white"
        >
          <Eye className="h-4 w-4" /> View contact
        </button>
      </div>
    )
  }

  return (
    <div className={compact ? 'mt-1.5' : 'mt-2.5'}>
      {phone && (
        <a href={`tel:+91${phone}`} className={`flex items-center gap-2 text-navy-900 hover:underline ${line}`}>
          <Phone className="h-4 w-4 shrink-0 text-brand-800" /> +91 {phone}
        </a>
      )}
      {email && (
        <a href={`mailto:${email}`} className={`flex items-center gap-2 text-navy-900 hover:underline ${line}`}>
          <Mail className="h-4 w-4 shrink-0 text-brand-800" /> <span className="truncate">{email}</span>
        </a>
      )}
    </div>
  )
}
