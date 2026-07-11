'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { X, ArrowRight, Loader2, Phone } from 'lucide-react'
import RequestDetailBody from './RequestDetailBody'

// Quick slide-over peek at a request, with a jump to the full routing workspace.
export default function RequestDrawer({ id, onClose }) {
  const router = useRouter()
  const [lead, setLead] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showMore, setShowMore] = useState(false)

  useEffect(() => {
    if (!id) return
    setLead(null)
    setShowMore(false)
    setLoading(true)
    fetch(`/api/admin/leads/${id}`)
      .then((r) => r.json())
      .then((d) => setLead(d.lead || null))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [id, onClose])

  if (!id || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end bg-navy-900/50 backdrop-blur-sm" onMouseDown={onClose}>
      <div className="flex h-full w-full max-w-[460px] flex-col bg-white shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h2 className="text-[19px] font-extrabold text-navy-900">Request Details</h2>
          <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading || !lead ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-slate-300" />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <RequestDetailBody lead={lead} showMore={showMore} />
            </div>
            <div className="border-t border-slate-100 px-6 py-5">
              <button
                onClick={() => { onClose(); router.push(`/admin/service/${id}`) }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-navy-800 py-3.5 text-[15px] font-semibold text-white transition hover:bg-navy-700"
              >
                Route to Partner <ArrowRight className="h-[18px] w-[18px]" />
              </button>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowMore((s) => !s)}
                  className="rounded-full border border-slate-300 py-3 text-[14px] font-semibold text-navy-800 transition hover:border-slate-400"
                >
                  {showMore ? 'Hide details' : 'More details'}
                </button>
                <a
                  href={`tel:+91${lead.phone}`}
                  className="flex items-center justify-center gap-1.5 rounded-full border border-slate-300 py-3 text-[14px] font-semibold text-slate-700 transition hover:border-slate-400"
                >
                  <Phone className="h-4 w-4" /> Reply Directly
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
