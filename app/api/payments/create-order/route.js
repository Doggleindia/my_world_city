import { dbConnect } from '@/lib/db'
import Property from '@/lib/models/Property'
import Payment from '@/lib/models/Payment'
import { PLANS } from '@/lib/plans'
import { handler, ok, requireUser, ApiError } from '@/lib/api'

// POST /api/payments/create-order { plan, propertyId }
export const POST = handler(async (req) => {
  const session = await requireUser()
  const { plan, propertyId } = await req.json().catch(() => ({}))
  const planDef = PLANS[plan]
  if (!planDef) throw new ApiError('Unknown plan', 400)
  await dbConnect()

  const property = await Property.findById(propertyId)
  if (!property) throw new ApiError('Property not found', 404)
  if (String(property.ownerId) !== session.uid) throw new ApiError('Forbidden', 403)

  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  const payment = await Payment.create({
    userId: session.uid,
    propertyId,
    plan,
    amount: planDef.amount,
    status: 'created',
  })

  // No Razorpay configured — return a dev order the client can settle instantly.
  if (!keyId || !keySecret) {
    return ok({ dev: true, paymentId: String(payment._id), amount: planDef.amount })
  }

  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: planDef.amount * 100, // paise
      currency: 'INR',
      receipt: String(payment._id),
      notes: { propertyId: String(propertyId), plan },
    }),
  })
  const order = await res.json()
  if (!res.ok) throw new ApiError(order?.error?.description || 'Order creation failed', 502)

  payment.razorpayOrderId = order.id
  await payment.save()

  return ok({
    dev: false,
    paymentId: String(payment._id),
    orderId: order.id,
    amount: planDef.amount,
    currency: 'INR',
    keyId,
  })
})
