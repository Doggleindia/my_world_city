import crypto from 'crypto'
import { handler, ok, ApiError } from '@/lib/api'
import { rateLimit, clientIp } from '@/lib/rateLimit'

// POST /api/leads/attachment (multipart: file) -> { url, name, type, size }
//
// Files attached to a contact form (a brochure, a site photo, a document).
// Public — the contact forms are used by logged-out visitors — so it is
// rate-limited and accepts only images and PDFs.
//   With Cloudinary configured: stored on the CDN (resource type "auto", so
//   PDFs work too) and the secure URL is returned.
//   Without it (dev): small files come back as a data URL.

const MAX_BYTES = 8 * 1024 * 1024 // 8 MB
const INLINE_LIMIT = 2 * 1024 * 1024 // dev mode: inline up to 2 MB
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'application/pdf'])

export const POST = handler(async (req) => {
  const rl = rateLimit(`attach:${clientIp(req)}`, 20, 10 * 60 * 1000)
  if (!rl.ok) throw new ApiError('Too many uploads. Please try again shortly.', 429)

  const form = await req.formData()
  const file = form.get('file')
  if (!file || typeof file === 'string') throw new ApiError('No file provided', 400)
  if (file.size > MAX_BYTES) throw new ApiError('Max file size is 8 MB', 413)
  if (!ALLOWED.has(file.type)) throw new ApiError('Only PDF, JPEG, PNG, WebP, GIF or AVIF files are allowed', 415)

  const meta = { name: String(file.name || 'attachment').slice(0, 120), type: file.type, size: file.size }

  const cloud = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloud || !apiKey || !apiSecret) {
    if (file.size > INLINE_LIMIT) {
      throw new ApiError('File too large for dev mode (max 2 MB). Configure Cloudinary for larger uploads.', 413)
    }
    const buf = Buffer.from(await file.arrayBuffer())
    return ok({ ...meta, url: `data:${file.type};base64,${buf.toString('base64')}`, dev: true })
  }

  const timestamp = Math.round(Date.now() / 1000)
  const folder = 'myworldcity/attachments'
  const toSign = `folder=${folder}&timestamp=${timestamp}`
  const signature = crypto.createHash('sha1').update(toSign + apiSecret).digest('hex')

  const upload = new FormData()
  upload.append('file', file)
  upload.append('api_key', apiKey)
  upload.append('timestamp', String(timestamp))
  upload.append('folder', folder)
  upload.append('signature', signature)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/auto/upload`, { method: 'POST', body: upload })
  const data = await res.json()
  if (!res.ok) throw new ApiError(data?.error?.message || 'Upload failed', 502)

  return ok({ ...meta, url: data.secure_url })
})
