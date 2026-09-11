// SMS gateway. Pick the provider with SMS_PROVIDER and give it its credentials;
// everything else in the app just calls sendOtpSms(). Providers are plain fetch
// calls — no SDKs, nothing to install.
//
//   SMS_PROVIDER=msg91     MSG91_AUTH_KEY, MSG91_TEMPLATE_ID  (India, DLT-ready)
//   SMS_PROVIDER=fast2sms  FAST2SMS_API_KEY                   (India)
//   SMS_PROVIDER=twilio    TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM
//   SMS_PROVIDER=          (blank) nothing is sent; codes go to the server log

const env = (k) => (process.env[k] || '').trim()

export class SmsError extends Error {
  constructor(message, detail) {
    super(message)
    this.name = 'SmsError'
    this.detail = detail
  }
}

export function activeProvider() {
  return env('SMS_PROVIDER').toLowerCase()
}

// What each provider needs before it can send. Used by the status endpoint so
// a missing key is obvious in the admin console instead of a silent failure.
const REQUIRED = {
  msg91: ['MSG91_AUTH_KEY', 'MSG91_TEMPLATE_ID'],
  fast2sms: ['FAST2SMS_API_KEY'],
  twilio: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM'],
}

export function smsStatus() {
  const provider = activeProvider()
  if (!provider) {
    return { provider: null, configured: false, missing: [], note: 'No SMS_PROVIDER set — codes are logged on the server only.' }
  }
  const required = REQUIRED[provider]
  if (!required) {
    return { provider, configured: false, missing: [], note: `Unknown provider "${provider}". Use msg91, fast2sms or twilio.` }
  }
  const missing = required.filter((k) => !env(k))
  return { provider, configured: missing.length === 0, missing, note: missing.length ? 'Add the missing variables to .env and restart.' : 'Ready.' }
}

async function readJson(res) {
  const text = await res.text()
  try { return JSON.parse(text) } catch { return { raw: text.slice(0, 300) } }
}

/* ---------------- MSG91 (recommended for India) ---------------- */
// Uses MSG91's dedicated OTP API, which sends through a DLT-approved template
// containing the ##OTP## variable. Base URL is overridable for sandbox/testing.
async function sendViaMsg91(phone, code, signal) {
  const base = env('MSG91_BASE_URL') || 'https://control.msg91.com'
  const url = new URL('/api/v5/otp', base)
  url.searchParams.set('template_id', env('MSG91_TEMPLATE_ID'))
  url.searchParams.set('mobile', `91${phone}`)
  url.searchParams.set('otp', code)
  url.searchParams.set('otp_expiry', '5')
  if (env('MSG91_SENDER_ID')) url.searchParams.set('sender', env('MSG91_SENDER_ID'))

  const res = await fetch(url, {
    method: 'POST',
    headers: { authkey: env('MSG91_AUTH_KEY'), accept: 'application/json' },
    signal,
  })
  const data = await readJson(res)
  if (!res.ok || data.type === 'error') {
    throw new SmsError('MSG91 rejected the message', { status: res.status, response: data })
  }
  return { id: data.request_id || null }
}

/* ---------------- Fast2SMS ---------------- */
async function sendViaFast2Sms(phone, code, signal) {
  const base = env('FAST2SMS_BASE_URL') || 'https://www.fast2sms.com'
  const res = await fetch(new URL('/dev/bulkV2', base), {
    method: 'POST',
    headers: { authorization: env('FAST2SMS_API_KEY'), 'content-type': 'application/json' },
    body: JSON.stringify({ route: 'otp', variables_values: code, numbers: phone }),
    signal,
  })
  const data = await readJson(res)
  if (!res.ok || data.return === false) {
    throw new SmsError('Fast2SMS rejected the message', { status: res.status, response: data })
  }
  return { id: Array.isArray(data.request_id) ? data.request_id[0] : data.request_id || null }
}

/* ---------------- Twilio ---------------- */
async function sendViaTwilio(phone, code, signal) {
  const sid = env('TWILIO_ACCOUNT_SID')
  const base = env('TWILIO_BASE_URL') || 'https://api.twilio.com'
  const body = new URLSearchParams({
    To: `+91${phone}`,
    From: env('TWILIO_FROM'),
    Body: `${code} is your My World City verification code. It expires in 5 minutes. Do not share it with anyone.`,
  })
  const res = await fetch(new URL(`/2010-04-01/Accounts/${sid}/Messages.json`, base), {
    method: 'POST',
    headers: {
      authorization: 'Basic ' + Buffer.from(`${sid}:${env('TWILIO_AUTH_TOKEN')}`).toString('base64'),
      'content-type': 'application/x-www-form-urlencoded',
    },
    body,
    signal,
  })
  const data = await readJson(res)
  if (!res.ok) throw new SmsError('Twilio rejected the message', { status: res.status, response: data })
  return { id: data.sid || null }
}

const SENDERS = { msg91: sendViaMsg91, fast2sms: sendViaFast2Sms, twilio: sendViaTwilio }

// Send a one-time code. Resolves with { provider, id } on success; throws
// SmsError (with the gateway's own response in .detail) on failure so the
// caller can decide what the user should see.
export async function sendOtpSms(phone, code) {
  const status = smsStatus()
  if (!status.provider) throw new SmsError('No SMS provider configured')
  const send = SENDERS[status.provider]
  if (!send) throw new SmsError(status.note)
  if (!status.configured) throw new SmsError(`SMS provider "${status.provider}" is missing: ${status.missing.join(', ')}`)

  // Never let a slow gateway hang a login request.
  const signal = AbortSignal.timeout(10_000)
  try {
    const result = await send(phone, code, signal)
    return { provider: status.provider, ...result }
  } catch (e) {
    if (e instanceof SmsError) throw e
    throw new SmsError('SMS gateway unreachable', { cause: e.message })
  }
}
