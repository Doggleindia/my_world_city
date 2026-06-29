import crypto from 'crypto'
import { dbConnect } from '@/lib/db'
import Lead from '@/lib/models/Lead'
import { leadSchema } from '@/lib/validation'
import { getSession } from '@/lib/auth/session'
import { handler, parseBody, ok, ApiError } from '@/lib/api'
import { rateLimit, clientIp } from '@/lib/rateLimit'

function makeRefId() {
  const year = new Date().getFullYear()
  const num = String(crypto.randomInt(0, 100000)).padStart(5, '0')
  return `MWC-${year}-${num}`
}

// POST /api/leads — public lead capture (enquiry / visit / callback / service / expert).
export const POST = handler(async (req) => {
  const rl = rateLimit(`lead:${clientIp(req)}`, 15, 10 * 60 * 1000)
  if (!rl.ok) throw new ApiError('Too many requests. Please try again shortly.', 429)

  const data = await parseBody(req, leadSchema)
  await dbConnect()

  const session = await getSession()
  const refId = makeRefId()

  await Lead.create({
    ...data,
    email: data.email || undefined,
    userId: session?.uid,
    refId,
    status: 'new',
  })

  return ok({ refId }, { status: 201 })
})
