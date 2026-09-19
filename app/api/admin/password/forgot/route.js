import { z } from 'zod'
import { dbConnect } from '@/lib/db'
import Otp from '@/lib/models/Otp'
import User from '@/lib/models/User'
import { handler, parseBody, ok, ApiError } from '@/lib/api'
import { rateLimit, clientIp } from '@/lib/rateLimit'
import { generateCode, hashCode, deliverResetCode, shouldRevealCode, OTP_TTL_MS } from '@/lib/auth/otp'

const schema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address').max(160),
})

// POST /api/admin/password/forgot { email }
// Emails a 6-digit code an admin can use to set a new console password.
// Always answers "sent" — whether or not the address is an admin — so the
// endpoint can't be used to discover which emails have admin access.
export const POST = handler(async (req) => {
  const { email } = await parseBody(req, schema)

  const byEmail = rateLimit(`admin:forgot:${email}`, 3, 15 * 60 * 1000)
  const byIp = rateLimit(`admin:forgot:ip:${clientIp(req)}`, 10, 60 * 60 * 1000)
  if (!byEmail.ok || !byIp.ok) throw new ApiError('Too many requests. Try again in a few minutes.', 429)

  await dbConnect()
  const user = await User.findOne({ email }).select('roles').lean()
  const isAdmin = !!user && (user.roles || []).includes('admin')

  const reply = { sent: true, email, expiresInSeconds: Math.round(OTP_TTL_MS / 1000) }
  if (!isAdmin) return ok(reply) // silently do nothing

  const code = generateCode()
  await Otp.findOneAndUpdate(
    { email, purpose: 'admin-reset' },
    {
      $set: {
        email,
        purpose: 'admin-reset',
        codeHash: hashCode(code),
        attempts: 0,
        consumedAt: undefined,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    },
    { upsert: true },
  )

  try {
    await deliverResetCode(email, code)
  } catch (e) {
    console.error(`[otp] admin reset delivery failed for ${email}:`, e.message)
    await Otp.deleteOne({ email, purpose: 'admin-reset' })
    throw new ApiError('We couldn’t send the email right now. Please try again in a moment.', 502)
  }

  return ok({ ...reply, ...(shouldRevealCode() ? { devCode: code } : {}) })
})
