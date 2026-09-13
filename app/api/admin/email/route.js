import { z } from 'zod'
import { handler, parseBody, ok, requireRole, ApiError } from '@/lib/api'
import { getEmailStatus, verifySMTPConnection, sendOtpEmail } from '@/lib/email'
import { generateCode } from '@/lib/auth/otp'

// GET /api/admin/email
// Whether the mail server is configured and reachable. Never returns the
// credentials themselves — only which variable names are missing.
export const GET = handler(async () => {
  await requireRole('admin')
  const status = getEmailStatus()
  // Only dial the mail server when there is something to dial with.
  const connection = status.configured ? await verifySMTPConnection() : { success: false, message: status.note }
  return ok({ email: { ...status, reachable: connection.success, connectionNote: connection.message } })
})

const testSchema = z.object({
  to: z.string().trim().toLowerCase().email('Enter a valid email address').max(160),
})

// POST /api/admin/email { to }
// Sends a throwaway code to that address so the mail set-up can be verified
// from the admin console before anyone relies on it for login.
export const POST = handler(async (req) => {
  await requireRole('admin')
  const { to } = await parseBody(req, testSchema)
  const status = getEmailStatus()
  if (!status.configured) {
    throw new ApiError(status.note || 'Email is not configured', 400, { email: status })
  }
  try {
    const { messageId } = await sendOtpEmail(to, generateCode())
    return ok({ sent: true, to, messageId: messageId || null })
  } catch (e) {
    throw new ApiError(e.message || 'The mail server rejected the message', 502)
  }
})
