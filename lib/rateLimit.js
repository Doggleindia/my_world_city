// Lightweight in-memory rate limiter. Note: per serverless instance only — for
// strict global limits use Upstash/Redis. Good enough as a basic abuse guard.
const buckets = global._rateBuckets || (global._rateBuckets = new Map())

export function rateLimit(key, max, windowMs) {
  const now = Date.now()
  const b = buckets.get(key)
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: max - 1 }
  }
  if (b.count >= max) {
    return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) }
  }
  b.count += 1
  return { ok: true, remaining: max - b.count }
}

export function clientIp(req) {
  const xff = req.headers.get('x-forwarded-for')
  return (xff ? xff.split(',')[0] : req.headers.get('x-real-ip')) || 'unknown'
}
