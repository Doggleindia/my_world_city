import { dbConnect } from '@/lib/db'
import Expert from '@/lib/models/Expert'
import { expertList, expertContentByCat, expertProfileFallback } from '@/data'

// Map a DB Expert doc to the card shape the public directory expects.
function toCard(d) {
  return {
    id: String(d._id),
    slug: d.slug,
    initials: d.initials || (d.name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase(),
    tag: d.tag || (d.cat || '').toUpperCase(),
    name: d.name,
    role: d.role || 'Expert',
    specialty: d.specialty || d.cat || '',
    cat: d.cat || 'General',
    photo: d.photo || null,
  }
}

// Public directory: verified experts, featured first. Falls back to the static
// showcase list when the DB is empty or unreachable (keeps the demo working).
export async function getPublicExperts() {
  try {
    await dbConnect()
    const docs = await Expert.find({ verified: true }).sort({ featured: -1, rating: -1 }).lean()
    if (docs.length) return docs.map(toCard)
  } catch {
    /* fall through */
  }
  return expertList
}

// Strip empty/undefined values so a sparse DB doc doesn't overwrite the rich
// static category content (stats/about/qualifications/projects/…).
function pruneEmpty(obj) {
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v == null) continue
    if (Array.isArray(v) && v.length === 0) continue
    if (typeof v === 'string' && v.trim() === '') continue
    out[k] = v
  }
  return out
}

const TITLES = ['Ar.', 'Adv.', 'Er.', 'Dr.', 'Mr.', 'Ms.', 'Mrs.', 'Pandit']
function firstNameOf(name = '') {
  const parts = name.split(' ')
  return TITLES.includes(parts[0]) ? parts[1] || parts[0] : parts[0]
}

// Build a full profile for /experts/[slug]: DB doc overlaid on category content,
// with graceful fallback to the static expert list. Returns null if unknown.
export async function getExpertProfile(slug) {
  let doc = null
  try {
    await dbConnect()
    doc = await Expert.findOne({ slug, verified: true }).lean()
  } catch {
    /* DB down — fall back to static below */
  }

  if (doc) {
    const content = expertContentByCat[doc.cat] || expertProfileFallback
    const db = pruneEmpty({
      id: String(doc._id),
      slug: doc.slug,
      name: doc.name,
      initials: doc.initials,
      role: doc.role,
      cat: doc.cat,
      tag: doc.tag || (doc.cat || '').toUpperCase(),
      specialty: doc.specialty,
      photo: doc.photo,
      location: doc.location,
      experience: doc.experience,
      languages: doc.languages,
      intro: doc.intro,
      stats: doc.stats,
      about: doc.about,
      quickFacts: doc.quickFacts,
      worksOn: doc.worksOn,
      qualifications: doc.qualifications,
      projects: doc.projects,
    })
    const profile = { ...content, ...db, firstName: firstNameOf(doc.name) }
    profile.related = await relatedExperts(doc.cat, doc.slug)
    return profile
  }

  // Static fallback (seeded/demo slugs, or DB unavailable).
  const match = expertList.find((e) => e.slug === slug)
  if (!match) return null
  const content = expertContentByCat[match.cat] || expertProfileFallback
  return {
    ...content,
    id: match.id,
    slug: match.slug,
    name: match.name,
    role: match.role,
    cat: match.cat,
    tag: match.tag,
    initials: match.initials,
    specialty: match.specialty,
    firstName: firstNameOf(match.name),
    related: expertList.filter((e) => e.cat === match.cat && e.slug !== slug).slice(0, 4),
  }
}

async function relatedExperts(cat, slug) {
  try {
    const docs = await Expert.find({ verified: true, cat, slug: { $ne: slug } }).limit(4).lean()
    if (docs.length) return docs.map(toCard)
  } catch {
    /* fall through */
  }
  return expertList.filter((e) => e.cat === cat && e.slug !== slug).slice(0, 4)
}

// Slugs to pre-render at build (DB verified + static), deduped.
export async function allExpertSlugs() {
  const slugs = new Set(expertList.map((e) => e.slug))
  try {
    await dbConnect()
    const docs = await Expert.find({ verified: true }).select('slug').lean()
    docs.forEach((d) => slugs.add(d.slug))
  } catch {
    /* static only */
  }
  return [...slugs]
}
