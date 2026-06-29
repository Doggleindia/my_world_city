'use client'

import { useState } from 'react'
import ExpertConnectModal from './ExpertConnectModal'

export default function ExpertConnectButton({ expert, className, children }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      <ExpertConnectModal open={open} onClose={() => setOpen(false)} expert={expert} />
    </>
  )
}
