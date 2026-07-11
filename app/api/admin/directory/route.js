import { dbConnect } from '@/lib/db'
import Expert from '@/lib/models/Expert'
import { handler, ok, requireRole, ApiError } from '@/lib/api'

function expCode(id) {
  return `EXP-${String(parseInt(String(id).slice(-6), 16) % 100000).padStart(5, '0')}`
}
function parseYears(v) {
  const m = String(v ?? '').match(/\d+/)
  return m ? Number(m[0]) : null
}
function slugify(s) {
  return String(s || 'expert').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 50) + '-' + Math.random().toString(36).slice(2, 6)
}
function initialsOf(name = '?') {
  return name.replace(/^(Ar\.|Adv\.|Dr\.|Pt\.|Er\.|Mr\.|Ms\.|Mrs\.)\s*/i, '').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}
function statusOf(d) {
  return d.status || (d.verified ? 'verified' : 'pending')
}
function ago(dt) {
  const days = Math.floor((Date.now() - new Date(dt).getTime()) / 864e5)
  if (days < 1) return 'today'
  return `${days}d ago`
}

function normalize(d) {
  return {
    id: String(d._id),
    code: expCode(d._id),
    name: d.name,
    slug: d.slug,
    initials: d.initials || initialsOf(d.name),
    photo: d.photo || null,
    role: d.role || 'Expert',
    cat: d.cat || 'General',
    specialty: d.specialty || d.tag || d.cat || '—',
    locality: d.location || '—',
    experience: parseYears(d.experience) ?? d.meta?.experienceYears ?? null,
    rating: d.rating || 0,
    ratingCount: d.ratingCount || 0,
    cases: d.cases || 0,
    avgResponseHours: d.avgResponseHours || 4,
    status: statusOf(d),
    featured: !!d.featured,
    createdAt: d.createdAt,
  }
}

// GET /api/admin/directory — list + counts + dashboard cards.
export const GET = handler(async (req) => {
  await requireRole('admin')
  await dbConnect()

  const p = new URL(req.url).searchParams
  const tab = p.get('tab') || 'all'
  const type = p.get('type') || ''
  const locality = p.get('locality') || ''
  const minExp = Number(p.get('minExp') || 0)
  const minRating = Number(p.get('minRating') || 0)
  const verifiedOnly = p.get('verifiedOnly') === 'true'
  const q = (p.get('q') || '').trim().toLowerCase()
  const page = Math.max(1, Number(p.get('page') || 1))
  const limit = Math.min(50, Math.max(1, Number(p.get('limit') || 6)))

  const all = (await Expert.find({}).limit(1000).lean()).map(normalize)

  const counts = {
    total: all.length,
    verified: all.filter((e) => e.status === 'verified').length,
    pending: all.filter((e) => e.status === 'pending').length,
    suspended: all.filter((e) => e.status === 'suspended').length,
    topRated: all.filter((e) => e.rating >= 4.5).length,
    activeWeek: all.filter((e) => Date.now() - new Date(e.createdAt).getTime() < 7 * 864e5 || e.cases > 0).length,
    avgResponseHours: all.length ? Math.round((all.reduce((s, e) => s + e.avgResponseHours, 0) / all.length) * 10) / 10 : 0,
  }

  let items = all.filter((e) => {
    if (tab === 'verified' && e.status !== 'verified') return false
    if (tab === 'pending' && e.status !== 'pending') return false
    if (tab === 'suspended' && e.status !== 'suspended') return false
    if (tab === 'top' && e.rating < 4.5) return false
    if (verifiedOnly && e.status !== 'verified') return false
    if (type && !catMatch(e.cat, type)) return false
    if (locality && e.locality !== locality) return false
    if (minExp && (e.experience || 0) < minExp) return false
    if (minRating && e.rating < minRating) return false
    if (q && !(e.name.toLowerCase().includes(q) || e.code.toLowerCase().includes(q) || (e.specialty || '').toLowerCase().includes(q))) return false
    return true
  })
  if (tab === 'top') items = items.sort((a, b) => b.rating - a.rating || b.cases - a.cases)

  const resultTotal = items.length
  const paged = items.slice((page - 1) * limit, page * limit)

  // cards
  const topPerformers = [...all].sort((a, b) => b.cases - a.cases || b.rating - a.rating).slice(0, 5)
  const pending = all.filter((e) => e.status === 'pending').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6)
    .map((e) => ({ id: e.id, name: e.name, slug: e.slug, cat: e.cat, submitted: ago(e.createdAt) }))

  // coverage gaps — localities with the fewest experts
  const byLoc = {}
  for (const e of all) if (e.locality && e.locality !== '—') byLoc[e.locality] = (byLoc[e.locality] || 0) + 1
  const gaps = Object.entries(byLoc).sort((a, b) => a[1] - b[1]).slice(0, 3)
    .map(([loc, n]) => ({ locality: loc, count: n, severity: n <= 1 ? 'high' : n <= 2 ? 'med' : 'low' }))

  const localities = [...new Set(all.map((e) => e.locality).filter((l) => l && l !== '—'))].sort()
  const types = [...new Set(all.map((e) => e.cat).filter(Boolean))].sort()

  return ok({ items: paged, page, pageCount: Math.max(1, Math.ceil(resultTotal / limit)), resultTotal, counts, localities, types, cards: { topPerformers, pending, gaps } })
})

function catMatch(a, b) {
  const na = String(a || '').toLowerCase().replace(/[^a-z]/g, '')
  const nb = String(b || '').toLowerCase().replace(/[^a-z]/g, '')
  return na.startsWith(nb.slice(0, 4)) || nb.startsWith(na.slice(0, 4))
}

// POST /api/admin/directory — create an expert via the onboarding wizard.
export const POST = handler(async (req) => {
  await requireRole('admin')
  const b = await req.json().catch(() => ({}))
  await dbConnect()
  if (!b.name || !String(b.name).trim()) throw new ApiError('Expert name is required', 422)

  const status = ['draft', 'pending', 'verified'].includes(b.status) ? b.status : 'pending'
  const doc = await Expert.create({
    slug: slugify(b.name),
    name: String(b.name).trim(),
    initials: initialsOf(b.name),
    role: b.role || b.professionalTitle || 'Expert',
    cat: b.cat || b.expertType || 'General',
    specialty: b.subSpecialty || b.specialty || undefined,
    tag: (b.cat || b.expertType || '').toUpperCase() || undefined,
    photo: b.photo || undefined,
    location: (b.serviceAreas && b.serviceAreas[0]) || b.location || undefined,
    experience: b.experienceYears ? `${b.experienceYears} years exp` : undefined,
    intro: b.bio || undefined,
    phone: b.phone || undefined,
    email: b.email || undefined,
    serviceAreas: b.serviceAreas || [],
    specialties: b.specialties || [],
    portfolio: b.portfolio || [],
    featured: !!b.featured,
    verified: status === 'verified',
    status,
    rating: 0,
    cases: 0,
    avgResponseHours: hoursFromLabel(b.availability?.avgResponse),
    meta: {
      companyName: b.companyName, firmType: b.firmType, onboardingSource: b.onboardingSource,
      experienceYears: b.experienceYears ? Number(b.experienceYears) : undefined,
      whatsapp: b.whatsapp, linkedin: b.linkedin,
      verification: b.verification, credentials: b.credentials, internalNotes: b.internalNotes,
      availability: b.availability, pricing: b.pricing, commission: b.commission,
      paymentMethod: b.paymentMethod, notifPrefs: b.notifPrefs,
    },
  })

  return ok({ id: String(doc._id), code: expCode(doc._id), slug: doc.slug, status: doc.status }, { status: 201 })
})

function hoursFromLabel(l) {
  if (!l) return 4
  if (/under 1/i.test(l)) return 1
  if (/1-2|1–2/.test(l)) return 2
  if (/2-4|2–4/.test(l)) return 4
  if (/same day/i.test(l)) return 8
  return 4
}
