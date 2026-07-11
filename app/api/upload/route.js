import crypto from 'crypto'
import { handler, ok, requireUser, ApiError } from '@/lib/api'

const MAX_BYTES = 8 * 1024 * 1024 // 8 MB hard cap
const INLINE_LIMIT = 2 * 1024 * 1024 // store inline as data URL up to 2 MB (dev mode)
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])

// POST /api/upload (multipart: file) -> { url }
// - With Cloudinary configured: uploads to the CDN and returns the secure URL.
// - Without it (dev): returns the actual image as a data URL so the real photo
//   shows and persists, no third-party account required.
export const POST = handler(async (req) => {
  await requireUser()

  const form = await req.formData()
  const file = form.get('file')
  if (!file || typeof file === 'string') throw new ApiError('No file provided', 400)
  if (file.size > MAX_BYTES) throw new ApiError('Max file size is 8MB', 413)
  // Only accept real image types — blocks e.g. a data:text/html payload being
  // stored inline (dev mode) and later served as a stored-XSS vector.
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new ApiError('Only JPEG, PNG, WebP, GIF or AVIF images are allowed', 415)
  }

  const cloud = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  // No Cloudinary — return the real image inline (small files only).
  if (!cloud || !apiKey || !apiSecret) {
    if (file.size > INLINE_LIMIT) {
      throw new ApiError(
        'Image too large for dev mode (max ~2MB). Configure Cloudinary for full-size uploads.',
        413,
      )
    }
    const buf = Buffer.from(await file.arrayBuffer())
    const dataUrl = `data:${file.type || 'image/jpeg'};base64,${buf.toString('base64')}`
    return ok({ url: dataUrl, dev: true })
  }

  // Cloudinary signed upload.
  const timestamp = Math.round(Date.now() / 1000)
  const folder = 'myworldcity'
  const toSign = `folder=${folder}&timestamp=${timestamp}`
  const signature = crypto.createHash('sha1').update(toSign + apiSecret).digest('hex')

  const upload = new FormData()
  upload.append('file', file)
  upload.append('api_key', apiKey)
  upload.append('timestamp', String(timestamp))
  upload.append('folder', folder)
  upload.append('signature', signature)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: 'POST',
    body: upload,
  })
  const data = await res.json()
  if (!res.ok) throw new ApiError(data?.error?.message || 'Upload failed', 502)

  return ok({ url: data.secure_url })
})
