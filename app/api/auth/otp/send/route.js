import { dbConnect } from '@/lib/db'
import Otp from '@/lib/models/Otp'
import User from '@/lib/models/User'
import { otpSendSchema } from '@/lib/validation'
import { handler, parseBody, ok, ApiError } from '@/lib/api'
import { rateLimit, clientIp } from '@/lib/rateLimit'
import { generateCode, hashCode, deliverCode, shouldRevealCode, OTP_TTL_MS } from '@/lib/auth/otp'

// POST /api/auth/otp/send { phone, name?, email? }
// Issues a fresh 6-digit code. Works for both sign-up and sign-in: the response
// says which one it will be so the UI can label the next screen correctly.
export const POST = handler(async (req) => {
  const { phone, name, email } = await parseBody(req, otpSendSchema)

  // Two limits: per number (stops hammering one victim's phone) and per IP
  // (stops one machine cycling through many numbers).
  const byPhone = rateLimit(`otp:send:${phone}`, 5, 15 * 60 * 1000)
  if (!byPhone.ok) {
    throw new ApiError(`Too many codes requested. Try again in ${Math.ceil(byPhone.retryAfter / 60)} minutes.`, 429)
  }
  const byIp = rateLimit(`otp:ip:${clientIp(req)}`, 20, 60 * 60 * 1000)
  if (!byIp.ok) throw new ApiError('Too many requests from this device. Try again later.', 429)

  await dbConnect()

  const existing = await User.findOne({ phone }).select('_id name').lean()
  const isNewUser = !existing

  const code = generateCode()
  const expiresAt = new Date(Date.now() + OTP_TTL_MS)

  // One live code per number — requesting a new one replaces the old.
  await Otp.findOneAndUpdate(
    { phone },
    {
      $set: {
        phone,
        codeHash: hashCode(code),
        name: name || undefined,
        email: email || undefined,
        attempts: 0,
        consumedAt: undefined,
        expiresAt,
      },
    },
    { upsert: true, new: true },
  )

  let delivery
  try {
    delivery = await deliverCode(phone, code)
  } catch (e) {
    // Log the gateway's own response for whoever is on call, but keep the
    // secrets and internals out of what the visitor sees.
    console.error('[otp] delivery failed for +91' + phone + ':', e.message, e.detail || '')
    await Otp.deleteOne({ phone }) // nothing was sent, so don't leave a live code behind
    throw new ApiError('We couldn’t send the SMS right now. Please try again in a moment.', 502)
  }

  return ok({
    sent: true,
    phone,
    isNewUser,
    name: existing?.name || name || null,
    expiresInSeconds: Math.round(OTP_TTL_MS / 1000),
    // 'sms' when a gateway sent it, 'console' when it only reached the server log.
    channel: delivery.delivered ? 'sms' : 'console',
    // Present only in development with no SMS provider, so the flow is usable
    // before an SMS gateway is connected.
    ...(shouldRevealCode() ? { devCode: code } : {}),
  })
})
