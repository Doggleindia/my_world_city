import crypto from 'crypto'

export function generateOtp() {
  // 6-digit numeric, no leading-zero loss.
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')
}

export function hashOtp(code) {
  return crypto.createHash('sha256').update(String(code)).digest('hex')
}

// Sends the OTP via the configured provider. In development (no SMS_PROVIDER set)
// it logs to the server console so you can test the full flow without an SMS account.
export async function sendOtpSms(phone, code) {
  const provider = (process.env.SMS_PROVIDER || '').toLowerCase()

  if (!provider) {
    console.log(`\n[DEV OTP] ${phone} -> ${code}\n`)
    return { delivered: false, dev: true }
  }

  if (provider === 'msg91') {
    const url = `https://control.msg91.com/api/v5/otp?template_id=${process.env.MSG91_TEMPLATE_ID}&mobile=91${phone}&otp=${code}`
    const res = await fetch(url, {
      headers: { authkey: process.env.MSG91_AUTH_KEY, 'Content-Type': 'application/json' },
    })
    if (!res.ok) throw new Error('MSG91 send failed')
    return { delivered: true }
  }

  if (provider === 'twilio') {
    const sid = process.env.TWILIO_ACCOUNT_SID
    const body = new URLSearchParams({
      To: `+91${phone}`,
      From: process.env.TWILIO_FROM,
      Body: `Your My World City verification code is ${code}. Valid for 5 minutes.`,
    })
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization:
          'Basic ' + Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    })
    if (!res.ok) throw new Error('Twilio send failed')
    return { delivered: true }
  }

  throw new Error(`Unknown SMS_PROVIDER: ${provider}`)
}
