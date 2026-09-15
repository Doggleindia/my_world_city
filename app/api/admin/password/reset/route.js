import { z } from 'zod'
import { dbConnect } from '@/lib/db'
import Otp from '@/lib/models/Otp'
import User from '@/lib/models/User'
import { hashPassword } from '@/lib/auth/password'
import { handler, parseBody, ok, ApiError } from '@/lib/api'
import { rateLimit } from '@/lib/rateLimit'
import { codeMatches, MAX_ATTEMPTS } from '@/lib/auth/otp'

const schema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address').max(160),
  code: z.string().trim().regex(/^[0-9]{6}$/, 'Enter the 6-digit code'),
  newPassword: z.string().min(8, 'Use at least 8 characters').max(200),
})

// POST /api/admin/password/reset { email, code, newPassword }
// Checks the emailed code and stores the new password. The admin then signs
// in normally — no session is created here.
export const POST = handler(async (req) => {
  const { email, code, newPassword } = await parseBody(req, schema)

  const rl = rateLimit(`admin:reset:${email}`, 10, 15 * 60 * 1000)
  if (!rl.ok) throw new ApiError('Too many attempts. Request a new code in a few minutes.', 429)

  await dbConnect()

  const record = await Otp.findOne({ email, purpose: 'admin-reset' })
  if (!record || record.consumedAt) throw new ApiError('Request a new code to continue.', 400)
  if (record.expiresAt < new Date()) {
    await Otp.deleteOne({ _id: record._id })
    throw new ApiError('That code has expired. Request a new one.', 400)
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    await Otp.deleteOne({ _id: record._id })
    throw new ApiError('Too many incorrect attempts. Request a new code.', 429)
  }
  if (!codeMatches(code, record.codeHash)) {
    record.attempts += 1
    await record.save()
    const left = Math.max(0, MAX_ATTEMPTS - record.attempts)
    throw new ApiError(
      left ? `Incorrect code. ${left} attempt${left === 1 ? '' : 's'} left.` : 'Too many incorrect attempts. Request a new code.',
      400,
    )
  }

  const user = await User.findOne({ email })
  if (!user || !user.roles.includes('admin')) throw new ApiError('Request a new code to continue.', 400)

  user.passwordHash = hashPassword(newPassword)
  user.mustChangePassword = false
  await user.save()
  await Otp.deleteOne({ _id: record._id })

  return ok({ reset: true })
})
