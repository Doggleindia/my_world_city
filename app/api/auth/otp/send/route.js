import { dbConnect } from '@/lib/db'
import Otp from '@/lib/models/Otp'
import { generateOtp, hashOtp, sendOtpSms } from '@/lib/auth/otp'
import { otpSendSchema } from '@/lib/validation'
import { handler, parseBody, ok, ApiError } from '@/lib/api'
import { rateLimit } from '@/lib/rateLimit'

const RESEND_COOLDOWN_MS = 30 * 1000
const TTL_MS = 5 * 60 * 1000

export const POST = handler(async (req) => {
  const { phone } = await parseBody(req, otpSendSchema)

  const rl = rateLimit(`otp:${phone}`, 5, 10 * 60 * 1000)
  if (!rl.ok) throw new ApiError('Too many code requests. Try again later.', 429)

  await dbConnect()

  const existing = await Otp.findOne({ phone })
  if (existing && Date.now() - new Date(existing.lastSentAt).getTime() < RESEND_COOLDOWN_MS) {
    throw new ApiError('Please wait a few seconds before requesting another code', 429)
  }

  const code = generateOtp()
  await Otp.findOneAndUpdate(
    { phone },
    {
      phone,
      codeHash: hashOtp(code),
      expiresAt: new Date(Date.now() + TTL_MS),
      attempts: 0,
      lastSentAt: new Date(),
    },
    { upsert: true, new: true },
  )

  const result = await sendOtpSms(phone, code)

  return ok({
    message: 'OTP sent',
    // Surface the code only in dev (console mode) so testing is frictionless.
    ...(result.dev ? { devCode: code } : {}),
  })
})
