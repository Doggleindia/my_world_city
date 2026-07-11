import crypto from 'crypto'

// Password hashing with Node's built-in scrypt — no third-party dependency.
// Stored format: "<saltHex>:<hashHex>".

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password, stored) {
  if (!stored || typeof stored !== 'string' || !stored.includes(':')) return false
  const [salt, hash] = stored.split(':')
  const test = crypto.scryptSync(String(password), salt, 64).toString('hex')
  const a = Buffer.from(hash, 'hex')
  const b = Buffer.from(test, 'hex')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

// A short, readable temporary password issued when an owner first lists a
// property. Uses an unambiguous alphabet (no 0/O/1/I/L) so it's easy to type.
export function generateTempPassword(len = 8) {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < len; i++) out += alphabet[crypto.randomInt(0, alphabet.length)]
  return out
}
