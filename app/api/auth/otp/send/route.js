import { dbConnect } from '@/lib/db'
import Otp from '@/lib/models/Otp'
import User from '@/lib/models/User'
import { otpSendSchema } from '@/lib/validation'
import { handler, parseBody, ok, ApiError } from '@/lib/api'
import { rateLimit, clientIp } from '@/lib/rateLimit'
import { generateCode, hashCode, deliverCode, shouldRevealCode, OTP_TTL_MS } from '@/lib/auth/otp'

// POST /api/auth/otp/send { email, name?, phone? }
// Issues a fresh 6-digit code by email. Works for both sign-up and sign-in: the
// response says which one it will be so the UI can label the next screen.
export const POST = handler(async (req) => {
  const { email, name, phone } = await parseBody(req, otpSendSchema)

  // Two limits: per address (stops hammering one victim's inbox) and per IP
  // (stops one machine cycling through many addresses).
  const byEmail = rateLimit(`otp:send:${email}`, 5, 15 * 60 * 1000)
  if (!byEmail.ok) {
    throw new ApiError(`Too many codes requested. Try again in ${Math.ceil(byEmail.retryAfter / 60)} minutes.`, 429)
  }
  const byIp = rateLimit(`otp:ip:${clientIp(req)}`, 20, 60 * 60 * 1000)
  if (!byIp.ok) throw new ApiError('Too many requests from this device. Try again later.', 429)

  await dbConnect()

  const existing = await User.findOne({ email }).select('_id name').lean()
  const isNewUser = !existing

  const code = generateCode()
  const expiresAt = new Date(Date.now() + OTP_TTL_MS)

  // One live code per address — requesting a new one replaces the old.
  await Otp.findOneAndUpdate(
    { email },
    {
      $set: {
        email,
        codeHash: hashCode(code),
        name: name || undefined,
        phone: phone || undefined,
        attempts: 0,
        consumedAt: undefined,
        expiresAt,
      },
    },
    { upsert: true, new: true },
  )

  let delivery
  try {
    delivery = await deliverCode(email, code)
  } catch (e) {
    // Log the mail server's own response for whoever is on call, but keep the
    // internals out of what the visitor sees.
    console.error(`[otp] delivery failed for ${email}:`, e.message)
    await Otp.deleteOne({ email }) // nothing was sent, so don't leave a live code behind
    throw new ApiError('We couldn’t send the email right now. Please try again in a moment.', 502)
  }

  return ok({
    sent: true,
    email,
    isNewUser,
    name: existing?.name || name || null,
    expiresInSeconds: Math.round(OTP_TTL_MS / 1000),
    // 'email' when it actually went out, 'console' when it only reached the server log.
    channel: delivery.delivered ? 'email' : 'console',
    // Present only in development with no SMTP configured, so the flow is
    // usable before the mail credentials are in place.
    ...(shouldRevealCode() ? { devCode: code } : {}),
  })
})
