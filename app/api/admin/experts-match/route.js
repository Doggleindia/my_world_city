import { dbConnect } from '@/lib/db'
import Expert from '@/lib/models/Expert'
import { handler, ok, requireRole } from '@/lib/api'

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z]/g, '')
const firstWord = (s) => String(s || '').toLowerCase().match(/[a-z]+/)?.[0] || ''

// Small locality adjacency map so nearby areas score as a partial match.
const ADJACENT = {
  jagatpura: ['malviyanagar', 'sitapura'],
  malviyanagar: ['jagatpura', 'cscheme'],
  cscheme: ['malviyanagar', 'vaishalinagar'],
  vaishalinagar: ['mansarovar', 'cscheme'],
  mansarovar: ['vaishalinagar'],
  sitapura: ['jagatpura'],
}

function parseYears(exp) {
  const m = String(exp || '').match(/\d+/)
  return m ? Number(m[0]) : null
}

function catMatches(expertCat, reqCat) {
  const a = norm(expertCat)
  const b = norm(reqCat)
  if (!a || !b) return false
  return a.startsWith(b.slice(0, 4)) || b.startsWith(a.slice(0, 4))
}

// GET /api/admin/experts-match?category=Architect&locality=Jagatpura
export const GET = handler(async (req) => {
  await requireRole('admin')
  await dbConnect()

  const url = new URL(req.url)
  const category = url.searchParams.get('category') || ''
  const locality = url.searchParams.get('locality') || ''
  const reqCat = firstWord(category)
  const locKey = norm(locality)

  const total = await Expert.estimatedDocumentCount()
  if (total === 0) return ok({ items: [], needsSeed: true })

  const docs = await Expert.find({}).lean()

  let items = docs.map((e) => {
    const typeMatch = catMatches(e.cat, reqCat)
    const eLoc = norm(e.location)
    const localityMatch = eLoc && eLoc === locKey
      ? 'match'
      : (ADJACENT[locKey] || []).includes(eLoc)
        ? 'adjacent'
        : 'different'
    let pct = typeMatch ? 45 : 10
    pct += localityMatch === 'match' ? 35 : localityMatch === 'adjacent' ? 22 : 5
    pct += 18 // treated as available
    pct += Math.round(((e.rating || 4) - 4) * 4)
    pct = Math.min(99, Math.max(30, pct))
    return {
      id: String(e._id),
      name: e.name,
      slug: e.slug,
      role: e.role || 'Expert',
      cat: e.cat,
      photo: e.photo || null,
      initials: e.initials || (e.name || '?').split(' ').map((w) => w[0]).slice(0, 2).join(''),
      experience: parseYears(e.experience),
      location: e.location || '—',
      rating: e.rating || 0,
      verified: e.verified !== false,
      typeMatch,
      localityMatch,
      matchPct: pct,
    }
  })

  // Prefer experts of the requested type; fall back to all if none match.
  const typed = items.filter((i) => i.typeMatch)
  items = (typed.length ? typed : items).sort((a, b) => b.matchPct - a.matchPct || b.rating - a.rating)
  items.forEach((it, i) => { it.topMatch = i === 0 })

  return ok({ items, needsSeed: false })
})
