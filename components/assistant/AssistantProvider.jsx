'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import AssistantPanel from './AssistantPanel'

const Ctx = createContext({ open: false, openAssistant: () => {}, closeAssistant: () => {} })

export const useAssistant = () => useContext(Ctx)

// Holds the Help Desk for the whole site, so any button — the hero's
// "Find Solution", the "Find property" button on Why Join Us — opens the same
// conversation rather than each one carrying its own copy.
export default function AssistantProvider({ children }) {
  const [open, setOpen] = useState(false)
  // Remounts the panel on each open so a new visit starts a fresh conversation.
  const [session, setSession] = useState(0)

  const openAssistant = useCallback(() => {
    setSession((n) => n + 1)
    setOpen(true)
  }, [])
  const closeAssistant = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <Ctx.Provider value={{ open, openAssistant, closeAssistant }}>
      {children}

      {open && (
        <>
          {/* dim the page on phones, where the panel covers most of the screen */}
          <div
            className="fixed inset-0 z-[90] bg-navy-900/40 backdrop-blur-[2px] sm:hidden"
            onClick={closeAssistant}
            aria-hidden="true"
          />
          {/* Phones: fills the screen below the header. Larger screens: a
              400px panel vertically centred against the right edge. The
              centring lives on this outer flex box because the entrance
              animation on the inner one ends by resetting `transform`. */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="My World City Help Desk"
            className="fixed inset-x-3 bottom-3 top-16 z-[95] sm:pointer-events-none sm:inset-y-0 sm:left-auto sm:right-10 sm:flex sm:items-center lg:right-16 xl:right-24"
          >
            <div className="mwc-assistant h-full sm:pointer-events-auto sm:h-[620px] sm:max-h-[calc(100vh-40px)] sm:w-[400px]">
              <AssistantPanel key={session} onClose={closeAssistant} />
            </div>
          </div>
        </>
      )}
    </Ctx.Provider>
  )
}
