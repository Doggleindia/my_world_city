'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import OtpAuth from './OtpAuth'

// Phone + OTP sign-in / sign-up. `initialMode` lets the navbar open it straight
// on the Sign up tab. Password login still exists at /login for owner accounts
// that were issued a temporary password.
export default function LoginModal({ open, onClose, onAuthed, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode)

  useEffect(() => { if (open) setMode(initialMode) }, [open, initialMode])

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

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-navy-900/60 backdrop-blur-sm" onMouseDown={onClose}>
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div
          className="relative w-full max-w-[460px] rounded-3xl bg-white p-7 shadow-2xl sm:p-8"
          onMouseDown={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={mode === 'signup' ? 'Create account' : 'Log in'}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>

          <OtpAuth
            mode={mode}
            onSwitchMode={() => setMode((m) => (m === 'signup' ? 'login' : 'signup'))}
            onDone={(data) => onAuthed(data.user)}
          />
        </div>
      </div>
    </div>,
    document.body,
  )
}
