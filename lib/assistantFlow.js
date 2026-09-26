// The Help Desk conversation.
//
// It is a guided script rather than a language model: every question has a
// known set of answers, and the answers build a real property search. Anything
// typed by hand is parsed for the same four things the buttons collect
// (intent, property type, locality, budget/bedrooms), so a visitor can skip
// ahead by typing "2 BHK in Jagatpura" instead of tapping through.

export const LOCALITIES = [
  'Jagatpura', 'Vaishali Nagar', 'Mansarovar', 'Sitapura',
  'Ajmer Road', 'Tonk Road', 'C-Scheme', 'Anywhere in Jaipur',
]

export const BUDGETS = [
  { label: 'Under ₹50 L', min: null, max: 5000000 },
  { label: '₹50 L – ₹1 Cr', min: 5000000, max: 10000000 },
  { label: '₹1 Cr – ₹3 Cr', min: 10000000, max: 30000000 },
  { label: 'Above ₹3 Cr', min: 30000000, max: null },
]

const CATEGORIES = ['Residential', 'Commercial', 'Industrial', 'Farm & Agri']

const opt = (label, next, patch) => ({ label, next, patch })

// Every step: what the assistant asks, and where each answer leads.
export const STEPS = {
  start: {
    ask: 'What would you like to do?',
    options: [
      opt('Buy or lease a property', 'buy_mode', { intent: 'buy' }),
      opt('Build on my land', 'build_land', { intent: 'build' }),
      opt('Manage my property', 'manage_need', { intent: 'manage' }),
      opt('Invest for returns', 'invest_budget', { intent: 'invest' }),
    ],
  },

  /* ---------------- buy / lease ---------------- */
  buy_mode: {
    ask: 'Are you looking to buy or to lease?',
    options: [
      opt('Buy', 'buy_type', { listingType: 'buy' }),
      opt('Lease / Rent', 'buy_type', { listingType: 'rent' }),
    ],
  },
  buy_type: {
    ask: 'Which type of property?',
    options: CATEGORIES.map((c) => opt(c, 'buy_area', { category: c })),
  },
  buy_area: {
    ask: 'Which part of Jaipur do you prefer?',
    options: LOCALITIES.map((l) => opt(l, 'buy_budget', { locality: l })),
  },
  buy_budget: {
    ask: 'What’s your budget?',
    options: BUDGETS.map((b) => opt(b.label, 'results', { budget: b.label })),
  },

  /* ---------------- build ---------------- */
  build_land: {
    ask: 'Do you already own the land?',
    options: [
      opt('Yes, I own it', 'build_what', { ownsLand: 'Yes' }),
      opt('Not yet', 'build_what', { ownsLand: 'Not yet' }),
    ],
  },
  build_what: {
    ask: 'What would you like to build?',
    options: [
      opt('Home / Villa', 'build_who', { buildType: 'Home / Villa' }),
      opt('Commercial', 'build_who', { buildType: 'Commercial' }),
      opt('Industrial', 'build_who', { buildType: 'Industrial' }),
      opt('Not sure yet', 'build_who', { buildType: 'Not sure yet' }),
    ],
  },
  build_who: {
    ask: 'Who do you need first?',
    options: [
      opt('Architect', 'build_done', { expert: 'architect' }),
      opt('Contractor', 'build_done', { expert: 'contractor' }),
      opt('Legal / approvals', 'build_done', { expert: 'legal' }),
      opt('Not sure', 'build_done', { expert: 'specialist' }),
    ],
  },
  build_done: {
    say: (a) =>
      `We’ll connect you with a verified ${a.expert || 'specialist'} in Jaipur for your ${
        (a.buildType || 'project').toLowerCase()
      }.`,
    next: 'lead',
  },

  /* ---------------- manage ---------------- */
  manage_need: {
    ask: 'What do you need help with?',
    options: [
      opt('Lease it out', 'manage_type', { need: 'Lease it out' }),
      opt('Maintain it', 'manage_type', { need: 'Maintain it' }),
      opt('Both', 'manage_type', { need: 'Both' }),
    ],
  },
  manage_type: {
    ask: 'What kind of property is it?',
    options: CATEGORIES.map((c) => opt(c, 'manage_done', { category: c })),
  },
  manage_done: {
    say: () => 'Our management team handles leasing, tenants and upkeep end to end.',
    next: 'lead',
  },

  /* ---------------- invest ---------------- */
  invest_budget: {
    ask: 'What’s your budget?',
    options: BUDGETS.map((b) => opt(b.label, 'invest_goal', { budget: b.label })),
  },
  invest_goal: {
    ask: 'What are you looking for?',
    options: [
      opt('Monthly rental income', 'results', { goal: 'Monthly rental income' }),
      opt('Long-term appreciation', 'results', { goal: 'Long-term appreciation' }),
      opt('Both', 'results', { goal: 'Both' }),
    ],
  },

  /* ---------------- shared endings ---------------- */
  offer_call: {
    ask: 'Want a verified specialist to share full details and arrange a site visit?',
    options: [
      opt('Yes, call me', 'lead'),
      opt('Show other options', 'restart_search'),
    ],
  },
  again: {
    ask: 'Anything else I can help with?',
    options: [
      opt('Start a new search', 'start'),
      opt('No, thanks', 'end'),
    ],
  },
}

// Turn the collected answers into a query for /api/properties.
export function searchParamsFor(a) {
  const p = new URLSearchParams({ limit: '6', sort: 'recent' })
  if (a.category && a.category !== 'Farm & Agri') p.set('category', a.category)
  else if (a.category) p.set('category', a.category)
  if (a.listingType) p.set('listingType', a.listingType)
  if (a.locality && a.locality !== 'Anywhere in Jaipur') p.set('locality', a.locality)
  if (a.bedrooms) p.set('bedrooms', a.bedrooms)
  const b = BUDGETS.find((x) => x.label === a.budget)
  if (b?.min != null) p.set('minPrice', String(b.min))
  if (b?.max != null) p.set('maxPrice', String(b.max))
  return p
}

// A short recap of what the visitor asked for, shown after a callback request.
export function summaryRows(a) {
  const rows = []
  if (a.listingType) rows.push(['Looking to', a.listingType === 'rent' ? 'Lease' : 'Buy'])
  if (a.intent === 'build') rows.push(['Project', a.buildType || '—'])
  if (a.intent === 'manage') rows.push(['Need', a.need || '—'])
  if (a.category) rows.push(['Property', a.category])
  if (a.bedrooms) rows.push(['Bedrooms', `${a.bedrooms} BHK`])
  if (a.locality) rows.push(['Area', a.locality])
  if (a.budget) rows.push(['Budget', a.budget])
  if (a.goal) rows.push(['Goal', a.goal])
  if (a.expert) rows.push(['Specialist', a.expert.charAt(0).toUpperCase() + a.expert.slice(1)])
  return rows
}

/* ---------------- free text ---------------- */

// Pull whatever we can recognise out of a typed sentence. Returns the fields
// found plus a human echo of what was understood, or null when nothing matched.
export function parseFreeText(text) {
  const t = ` ${text.toLowerCase()} `
  const found = {}

  const bhk = t.match(/(\d)\s*(?:bhk|bedroom|bed\b)/)
  if (bhk) { found.bedrooms = bhk[1]; found.category = found.category || 'Residential' }

  const locality = LOCALITIES.find(
    (l) => l !== 'Anywhere in Jaipur' && t.includes(l.toLowerCase()),
  )
  if (locality) found.locality = locality

  const cat = CATEGORIES.find((c) => t.includes(c.toLowerCase().split(' ')[0]))
  if (cat) found.category = cat
  if (/\b(plot|land|farm|agri)\b/.test(t)) found.category = 'Farm & Agri'
  if (/\b(shop|office|showroom)\b/.test(t)) found.category = 'Commercial'
  if (/\b(flat|apartment|villa|house|home)\b/.test(t)) found.category = 'Residential'

  if (/\b(rent|lease|rental)\b/.test(t)) found.listingType = 'rent'
  else if (/\b(buy|purchase|sale)\b/.test(t)) found.listingType = 'buy'

  // "under 80 lakh", "1.5 cr", "50L-1cr"
  const cr = t.match(/([\d.]+)\s*(?:cr|crore)/)
  const lakh = t.match(/([\d.]+)\s*(?:l\b|lakh|lac)/)
  if (cr || lakh) {
    const value = cr ? parseFloat(cr[1]) * 10000000 : parseFloat(lakh[1]) * 100000
    const band = BUDGETS.find((b) => (b.min == null || value >= b.min) && (b.max == null || value <= b.max))
    if (band) found.budget = band.label
  }

  if (/\b(build|construct|architect|contractor)\b/.test(t)) found.intent = 'build'
  else if (/\b(manage|tenant|maintain|caretak)\b/.test(t)) found.intent = 'manage'
  else if (/\b(invest|yield|return|rental income)\b/.test(t)) found.intent = 'invest'
  else if (Object.keys(found).length) found.intent = 'buy'

  if (!Object.keys(found).length) return null

  const bits = []
  if (found.bedrooms) bits.push(`a ${found.bedrooms} BHK`)
  else if (found.category) bits.push(`${found.category.toLowerCase()} property`)
  if (found.locality) bits.push(`in ${found.locality}`)
  if (found.budget) bits.push(`around ${found.budget}`)

  return {
    answers: found,
    echo: bits.length
      ? `Looking for ${bits.join(' ')} — let me find options for you.`
      : 'Let me find some options for you.',
  }
}
