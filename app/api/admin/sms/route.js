import { z } from 'zod'
import { handler, parseBody, ok, requireRole, ApiError } from '@/lib/api'
import { smsStatus, sendOtpSms } from '@/lib/sms'
import { generateCode } from '@/lib/auth/otp'

// GET /api/admin/sms
// Which gateway is active and whether its credentials are present. Never
// returns the credentials themselves — only which variable names are missing.
export const GET = handler(async () => {
  await requireRole('admin')
  return ok({ sms: smsStatus() })
})

const testSchema = z.object({
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
})

// POST /api/admin/sms { phone }
// Sends a throwaway code to that number so the gateway can be verified from
// the admin console before anyone relies on it for login.
export const POST = handler(async (req) => {
  await requireRole('admin')
  const { phone } = await parseBody(req, testSchema)
  const status = smsStatus()
  if (!status.configured) {
    throw new ApiError(status.note || 'SMS provider is not configured', 400, { sms: status })
  }
  try {
    const result = await sendOtpSms(phone, generateCode())
    return ok({ sent: true, provider: result.provider, id: result.id })
  } catch (e) {
    throw new ApiError(e.message, 502, { detail: e.detail || null })
  }
})
