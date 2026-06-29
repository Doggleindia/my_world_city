import { dbConnect } from '@/lib/db'
import Otp from '@/lib/models/Otp'
import User from '@/lib/models/User'
import { hashOtp } from '@/lib/auth/otp'
import { otpVerifySchema } from '@/lib/validation'
import { createSession } from '@/lib/auth/session'
import { handler, parseBody, ok, ApiError } from '@/lib/api'

const MAX_ATTEMPTS = 5

function adminPhones() {
  return (process.env.ADMIN_PHONES || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export const POST = handler(async (req) => {
  const { phone, code, name } = await parseBody(req, otpVerifySchema)
  await dbConnect()

  const record = await Otp.findOne({ phone })
  if (!record) throw new ApiError('Request a new code', 400)
  if (new Date(record.expiresAt).getTime() < Date.now()) {
    await record.deleteOne()
    throw new ApiError('Code expired, request a new one', 400)
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    await record.deleteOne()
    throw new ApiError('Too many attempts, request a new code', 429)
  }

  if (record.codeHash !== hashOtp(code)) {
    record.attempts += 1
    await record.save()
    throw new ApiError('Incorrect code', 400)
  }

  // Verified — consume the OTP.
  await record.deleteOne()

  // Find or create the user.
  let user = await User.findOne({ phone })
  if (!user) {
    const roles = ['buyer']
    if (adminPhones().includes(phone)) roles.push('admin')
    user = await User.create({ phone, name, roles, verified: true })
  } else if (!user.verified || (name && !user.name)) {
    user.verified = true
    if (name && !user.name) user.name = name
    await user.save()
  }

  await createSession(user)

  return ok({
    user: {
      id: String(user._id),
      phone: user.phone,
      name: user.name ?? null,
      roles: user.roles,
    },
  })
})
