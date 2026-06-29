import crypto from 'crypto'
import { dbConnect } from '@/lib/db'
import Property from '@/lib/models/Property'
import Payment from '@/lib/models/Payment'
import { PLANS } from '@/lib/plans'
import { handler, ok, requireUser, ApiError } from '@/lib/api'

// POST /api/payments/verify
//   dev:   { paymentId, dev: true }
//   prod:  { paymentId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
export const POST = handler(async (req) => {
  const session = await requireUser()
  const body = await req.json().catch(() => ({}))
  await dbConnect()

  const payment = await Payment.findById(body.paymentId)
  if (!payment) throw new ApiError('Payment not found', 404)
  if (String(payment.userId) !== session.uid) throw new ApiError('Forbidden', 403)

  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (keySecret && !body.dev) {
    const expected = crypto
      .createHmac('sha256', keySecret)
      .update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`)
      .digest('hex')
    if (expected !== body.razorpay_signature) {
      payment.status = 'failed'
      await payment.save()
      throw new ApiError('Signature verification failed', 400)
    }
    payment.razorpayPaymentId = body.razorpay_payment_id
  } else if (keySecret && body.dev) {
    throw new ApiError('Dev settlement disabled when Razorpay is configured', 400)
  }

  payment.status = 'paid'
  await payment.save()

  // Apply the plan benefits to the property.
  const planDef = PLANS[payment.plan]
  if (planDef && payment.propertyId) {
    await Property.updateOne({ _id: payment.propertyId }, { $set: planDef.apply })
  }

  return ok({ status: 'paid', plan: payment.plan })
})
