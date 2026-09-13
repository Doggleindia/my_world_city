import { dbConnect } from '@/lib/db'
import Otp from '@/lib/models/Otp'
import User from '@/lib/models/User'
import { createSession } from '@/lib/auth/session'
import { syncAdminRole } from '@/lib/auth/roles'
import { otpVerifySchema } from '@/lib/validation'
import { handler, parseBody, ok, ApiError } from '@/lib/api'
import { rateLimit } from '@/lib/rateLimit'
import { codeMatches, MAX_ATTEMPTS } from '@/lib/auth/otp'

// POST /api/auth/otp/verify { email, code }
// Checks the code, then either signs the person in or creates their account and
// signs them in. Either way they land logged in — no password involved.
export const POST = handler(async (req) => {
  const { email, code } = await parseBody(req, otpVerifySchema)

  const rl = rateLimit(`otp:verify:${email}`, 12, 15 * 60 * 1000)
  if (!rl.ok) throw new ApiError('Too many attempts. Request a new code in a few minutes.', 429)

  await dbConnect()

  const record = await Otp.findOne({ email })
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

  // Correct — burn the code so it can't be replayed.
  record.consumedAt = new Date()
  await record.save()

  let user = await User.findOne({ email })
  const isNewUser = !user

  if (!user) {
    user = await User.create({
      email,
      name: record.name || undefined,
      phone: record.phone || undefined,
      roles: ['buyer'],
      verified: true, // the address was just proven
      mustChangePassword: false,
    })
  } else {
    // Fill in anything the account was missing, and mark the address verified.
    let touched = false
    if (record.name && !user.name) { user.name = record.name; touched = true }
    if (record.phone && !user.phone) { user.phone = record.phone; touched = true }
    if (!user.verified) { user.verified = true; touched = true }
    if (touched) await user.save()
  }

  await syncAdminRole(user)
  await createSession(user)
  await Otp.deleteOne({ _id: record._id })

  return ok(
    {
      isNewUser,
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name ?? null,
        phone: user.phone ?? null,
        roles: user.roles,
      },
    },
    { status: isNewUser ? 201 : 200 },
  )
})
