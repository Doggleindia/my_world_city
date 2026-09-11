import crypto from 'crypto'
import { sendOtpSms, activeProvider } from '@/lib/sms'

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

// Delivery. With SMS_PROVIDER set, the code goes out through the gateway in
// lib/sms.js. With it blank (local development) the code is written to the
// server log instead and the flow still works end to end.
export async function deliverCode(phone, code) {
  const provider = activeProvider()

  if (!provider) {
    console.log(`[otp] SMS_PROVIDER not configured — code for +91${phone} is ${code}`)
    return { delivered: false, channel: 'console' }
  }

  const result = await sendOtpSms(phone, code) // throws SmsError on failure
  console.log(`[otp] sent to +91${phone} via ${result.provider}${result.id ? ' (' + result.id + ')' : ''}`)
  return { delivered: true, channel: result.provider }
}

// Only expose the code to the browser when there is genuinely no way to receive
// an SMS — i.e. outside production and with no provider configured. This is what
// lets the flow be used and tested before the SMS gateway is bought.
export function shouldRevealCode() {
  return process.env.NODE_ENV !== 'production' && !activeProvider()
}
