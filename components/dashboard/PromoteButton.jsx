'use client'

import { useState } from 'react'
import { Star, Loader2, Check } from 'lucide-react'

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

export default function PromoteButton({ id, premium, featured, onDone }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (premium) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-2 text-[13px] font-semibold text-amber-700">
        <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> Premium
      </span>
    )
  }

  const promote = async () => {
    setBusy(true)
    setError('')
    try {
      const plan = featured ? 'premium' : 'featured'
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, propertyId: id }),
      })
      const order = await res.json()
      if (!res.ok) throw new Error(order.error || 'Could not start payment')

      // Dev mode (no Razorpay keys) — settle instantly.
      if (order.dev) {
        const v = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId: order.paymentId, dev: true }),
        })
        if (!v.ok) throw new Error('Verification failed')
        onDone?.()
        return
      }

      // Production — open Razorpay checkout.
      const loaded = await loadRazorpay()
      if (!loaded) throw new Error('Could not load payment gateway')
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount * 100,
        currency: order.currency,
        name: 'My World City',
        description: `${plan} promotion`,
        order_id: order.orderId,
        handler: async (resp) => {
          await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentId: order.paymentId,
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
            }),
          })
          onDone?.()
        },
        theme: { color: '#1f5fbf' },
      })
      rzp.open()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={promote}
      disabled={busy}
      title={error || undefined}
      className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-[13px] font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60"
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : featured ? (
        <><Star className="h-4 w-4" /> Go Premium</>
      ) : (
        <><Star className="h-4 w-4" /> Promote</>
      )}
    </button>
  )
}
