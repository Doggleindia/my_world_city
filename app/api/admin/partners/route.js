import { dbConnect } from '@/lib/db'
import Partner from '@/lib/models/Partner'
import { samplePartners } from '@/lib/seedPartners'
import { handler, ok, requireRole } from '@/lib/api'

const firstWord = (s) => String(s || '').toLowerCase().match(/[a-z]+/)?.[0] || ''

function availabilityLabel(p) {
  if (p.availability === 'now') return 'Available now'
  if (p.availability === 'tomorrow') return 'Available tomorrow'
  return `Available in ${p.avgResponseHours || 4}h`
}

function score(p, reqCat, locality) {
  const specialtyMatch = p.category === reqCat || firstWord(p.category) === reqCat
  const localityMatch = p.locality === locality
    ? 'match'
    : (p.adjacentLocalities || []).includes(locality)
      ? 'adjacent'
      : 'different'
  let pct = specialtyMatch ? 45 : 10
  pct += localityMatch === 'match' ? 35 : localityMatch === 'adjacent' ? 22 : 5
  pct += p.availability === 'now' ? 18 : p.availability === 'hours' ? 11 : 5
  pct += Math.round(((p.rating || 4) - 4) * 4)
  pct = Math.min(99, Math.max(30, pct))
  return { specialtyMatch, localityMatch, matchPct: pct }
}

// GET /api/admin/partners?category=legal&locality=Jagatpura
export const GET = handler(async (req) => {
  await requireRole('admin')
  await dbConnect()

  const url = new URL(req.url)
  const category = url.searchParams.get('category') || ''
  const locality = url.searchParams.get('locality') || ''
  const reqCat = firstWord(category)

  const totalPartners = await Partner.estimatedDocumentCount()
  if (totalPartners === 0) {
    return ok({ items: [], categoryTotal: 0, needsSeed: true })
  }

  // Prefer partners in the requested category; fall back to all if none.
  let docs = reqCat
    ? await Partner.find({ active: true, category: reqCat }).lean()
    : await Partner.find({ active: true }).lean()
  if (docs.length === 0) docs = await Partner.find({ active: true }).lean()

  const items = docs
    .map((p) => ({
      id: String(p._id),
      name: p.name,
      category: p.category,
      specialty: p.specialty,
      experience: p.experience,
      locality: p.locality,
      teamSize: p.teamSize,
      verified: !!p.verified,
      rating: p.rating,
      cases: p.cases,
      avgResponseHours: p.avgResponseHours,
      availability: p.availability,
      availabilityLabel: availabilityLabel(p),
      ...score(p, reqCat, locality),
    }))
    .sort((a, b) => b.matchPct - a.matchPct || b.rating - a.rating)

  items.forEach((it, i) => { it.topMatch = i === 0 })

  return ok({ items, categoryTotal: items.length, needsSeed: false })
})

// POST /api/admin/partners — seed the sample partner set (only when empty).
export const POST = handler(async () => {
  await requireRole('admin')
  await dbConnect()
  const count = await Partner.estimatedDocumentCount()
  if (count > 0) return ok({ seeded: 0, total: count })
  await Partner.insertMany(samplePartners)
  return ok({ seeded: samplePartners.length, total: samplePartners.length })
})
