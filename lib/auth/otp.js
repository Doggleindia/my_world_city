import crypto from 'crypto'
import { sendOtpEmail, sendAdminResetEmail, getEmailStatus } from '@/lib/email'

export const OTP_TTL_MS = 5 * 60 * 1000 // a code is valid for 5 minutes
export const MAX_ATTEMPTS = 5 // wrong guesses before the code is burned

export function generateCode() {
  // 6 digits, uniformly random (crypto.randomInt avoids modulo bias).
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')
}

// Codes are stored hashed, never in plain text.
export function hashCode(code) {
  return crypto.createHash('sha256').update(String(code)).digest('hex')
}

export function codeMatches(code, storedHash) {
  const a = Buffer.from(hashCode(code), 'hex')
  const b = Buffer.from(String(storedHash || ''), 'hex')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

// Delivery. With SMTP configured, the code is emailed. Without it (a fresh dev
// machine) the code is written to the server log instead and the flow still
// works end to end.
export async function deliverCode(email, code) {
  if (!getEmailStatus().configured) {
    console.log(`[otp] SMTP not configured — code for ${email} is ${code}`)
    return { delivered: false, channel: 'console' }
  }

  const { messageId } = await sendOtpEmail(email, code, Math.round(OTP_TTL_MS / 60000)) // throws on failure
  console.log(`[otp] emailed to ${email}${messageId ? ' (' + messageId + ')' : ''}`)
  return { delivered: true, channel: 'email' }
}

// Same idea, for the admin "forgot password" code.
export async function deliverResetCode(email, code) {
  if (!getEmailStatus().configured) {
    console.log(`[otp] SMTP not configured — admin reset code for ${email} is ${code}`)
    return { delivered: false, channel: 'console' }
  }
  const { messageId } = await sendAdminResetEmail(email, code, Math.round(OTP_TTL_MS / 60000))
  console.log(`[otp] admin reset code emailed to ${email}${messageId ? ' (' + messageId + ')' : ''}`)
  return { delivered: true, channel: 'email' }
}

// Only expose the code to the browser when there is genuinely no way to receive
// it — i.e. outside production and with no SMTP configured. This is what lets
// the flow be used and tested before the mail credentials are in place.
export function shouldRevealCode() {
  return process.env.NODE_ENV !== 'production' && !getEmailStatus().configured
}
