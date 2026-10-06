// The Help Desk conversation.
//
// It is a guided script rather than a language model: every question has a
// known set of answers, and the answers build a real property search. Anything
// typed by hand is parsed for the same things the buttons collect (intent,
// property type and kind, locality, budget/bedrooms), so a visitor can skip
// ahead by typing "villa in Jagatpura under 1 cr" instead of tapping through.
//
// Every path ends by showing properties that fit what was said — real
// listings first, topped up with curated picks of the same kind.

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

// The specific kinds offered under each category, and the words that spot
// them in a listing title or a typed message.
export const KINDS = {
  Residential: ['Villa', 'Apartment', 'Plot'],
  Commercial: ['Office space', 'Shop / Showroom', 'Commercial building'],
  Industrial: ['Factory', 'Warehouse', 'Industrial plot'],
  'Farm & Agri': ['Farm land', 'Farmhouse'],
}
const KIND_WORDS = {
  Villa: /villa|bungalow|house|home|kothi/i,
  Apartment: /apartment|flat|bhk|tower|residency/i,
  Plot: /plot|land/i,
  'Office space': /office|corporate|workspace|tower/i,
  'Shop / Showroom': /shop|showroom|retail|store/i,
  'Commercial building': /building|plaza|complex|mall|tower/i,
  Factory: /factory|manufactur|plant|unit/i,
  Warehouse: /warehouse|godown|logistic|storage/i,
  'Industrial plot': /industrial|riico|plot|land/i,
  'Farm land': /farm|agri|land|field/i,
  Farmhouse: /farmhouse|farm house|farm/i,
}

const opt = (label, next, patch) => ({ label, next, patch })

// Every step: what the assistant asks, and where each answer leads.
// `options` may be a function of the answers so far.
export const STEPS = {
  start: {
    ask: 'What would you like to do today?',
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
    options: CATEGORIES.map((c) => opt(c, 'buy_kind', { category: c })),
  },
  buy_kind: {
    ask: (a) => `Great — what kind of ${(a.category || 'property').toLowerCase()} property exactly?`,
    options: (a) => (KINDS[a.category] || KINDS.Residential).map((k) => opt(k, 'buy_area', { kind: k })),
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
      opt('Home / Villa', 'build_who', { buildType: 'Home / Villa', category: 'Residential', kind: 'Villa' }),
      opt('Commercial', 'build_who', { buildType: 'Commercial', category: 'Commercial', kind: 'Commercial building' }),
      opt('Industrial', 'build_who', { buildType: 'Industrial', category: 'Industrial', kind: 'Factory' }),
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
    next: 'showcase',
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
    next: 'showcase',
  },

  /* ---------------- invest ---------------- */
  invest_budget: {
    ask: 'What’s your budget?',
    options: BUDGETS.map((b) => opt(b.label, 'invest_goal', { budget: b.label })),
  },
  invest_goal: {
    ask: 'What are you looking for?',
    options: [
      opt('Monthly rental income', 'results', { goal: 'Monthly rental income', category: 'Commercial', kind: 'Office space' }),
      opt('Long-term appreciation', 'results', { goal: 'Long-term appreciation', category: 'Residential', kind: 'Plot' }),
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
  const p = new URLSearchParams({ limit: '8', sort: 'recent' })
  if (a.category) p.set('category', a.category)
  if (a.listingType) p.set('listingType', a.listingType)
  if (a.locality && a.locality !== 'Anywhere in Jaipur') p.set('locality', a.locality)
  if (a.bedrooms) p.set('bedrooms', a.bedrooms)
  const b = BUDGETS.find((x) => x.label === a.budget)
  if (b?.min != null) p.set('minPrice', String(b.min))
  if (b?.max != null) p.set('maxPrice', String(b.max))
  return p
}

// Put listings that are actually the kind asked for ("Villa", "Factory"…) first.
export function rankByKind(list, kind) {
  const re = KIND_WORDS[kind]
  if (!re) return list
  const hit = (p) => re.test(`${p.title || ''} ${p.subType || ''}`)
  return [...list].sort((x, y) => Number(hit(y)) - Number(hit(x)))
}

// A short recap of what the visitor asked for — shown as chips while chatting
// and as a table after a callback request.
export function summaryRows(a) {
  const rows = []
  if (a.listingType) rows.push(['Looking to', a.listingType === 'rent' ? 'Lease' : 'Buy'])
  if (a.intent === 'build') rows.push(['Project', a.buildType || '—'])
  if (a.intent === 'manage') rows.push(['Need', a.need || '—'])
  if (a.intent === 'invest') rows.push(['Plan', 'Invest'])
  // for a build the project type already says it
  if (a.category && a.intent !== 'build') rows.push(['Property', a.category])
  if (a.kind && a.intent !== 'build') rows.push(['Kind', a.kind])
  if (a.bedrooms) rows.push(['Bedrooms', `${a.bedrooms} BHK`])
  if (a.locality) rows.push(['Area', a.locality])
  if (a.budget) rows.push(['Budget', a.budget])
  if (a.goal) rows.push(['Goal', a.goal])
  if (a.expert) rows.push(['Specialist', a.expert.charAt(0).toUpperCase() + a.expert.slice(1)])
  return rows
}

/* ---------------- curated picks ---------------- */

const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=640&q=75`

// Two or three hand-picked examples per kind. They carry no id: the card links
// to the matching Find Property search rather than to a single listing.
const PICKS = {
  Villa: [
    ['Courtyard Villa', '4 BHK · private garden', '1613490493576-7fde63acd811'],
    ['Skyline Duplex Villa', '5 BHK · terrace lounge', '1600585154340-be6161a56a0c'],
    ['Garden Villa', '3 BHK · gated community', '1600596542815-ffad4c1539a9'],
  ],
  Apartment: [
    ['Lakeview Residences', '3 BHK · clubhouse access', '1545324418-cc1a3fa10c00'],
    ['Urban Nest Apartments', '2 BHK · ready to move', '1502672260266-1c1ef2d93688'],
    ['Park Avenue Towers', '3 BHK · high floor', '1493809842364-78817add7ffb'],
  ],
  Plot: [
    ['Corner Residential Plot', '200 sq yd · JDA approved', '1500382017468-9049fed747ef'],
    ['Township Plot', '167 sq yd · gated layout', '1464226184884-fa280b87c399'],
  ],
  'Office space': [
    ['Grade-A Office Floor', '1,480 sq.m · fitted out', '1497366216548-37526070297c'],
    ['Business Park Suite', '640 sq.m · pre-leased', '1497215728101-856f4ea42174'],
    ['Corporate Tower', 'Full floor · metro access', '1486406146926-c627a92ad1ab'],
  ],
  'Shop / Showroom': [
    ['High-Street Showroom', 'Ground floor · 40 ft frontage', '1441986300917-64674bd600d8'],
    ['Retail Corner Shop', 'Main road · high footfall', '1555529669-e69e7aa0ba9a'],
  ],
  'Commercial building': [
    ['Mixed-Use Commercial Block', 'G+5 · lift and parking', '1486406146926-c627a92ad1ab'],
    ['Corporate Plaza', 'Full building · pre-leased', '1497366216548-37526070297c'],
    ['Business Centre', 'G+3 · corner plot', '1497215728101-856f4ea42174'],
  ],
  Factory: [
    ['Manufacturing Unit', '6,450 sq.m · 3-phase power', '1513828583688-c52646db42da'],
    ['Light Engineering Factory', 'RIICO plot · crane bay', '1581091226825-a6a2a5aee158'],
    ['Food-Grade Production Unit', 'Ready shed · loading docks', '1565793298595-6a879b1d9492'],
  ],
  Warehouse: [
    ['Logistics Warehouse', '7,830 sq.m · 13.7m height', '1586528116311-ad8dd3c8310d'],
    ['Distribution Centre', 'Dock levellers · highway access', '1553413077-190dd305871c'],
  ],
  'Industrial plot': [
    ['RIICO Industrial Plot', '2,000 sq.m · corner', '1504307651254-35680f356dfd'],
    ['Industrial Land Parcel', '4.5 acres · road touch', '1500382017468-9049fed747ef'],
  ],
  'Farm land': [
    ['Irrigated Farm Land', '6 acres · bore well', '1500382017468-9049fed747ef'],
    ['Orchard Land', '3.2 acres · drip irrigation', '1464226184884-fa280b87c399'],
  ],
  Farmhouse: [
    ['Weekend Farmhouse', '2 acres · pool and lawn', '1416879595882-3373a0480b5b'],
    ['Heritage Farm Estate', '5 acres · guest cottage', '1600585154340-be6161a56a0c'],
  ],
}

const DEFAULT_KIND = {
  Residential: 'Villa',
  Commercial: 'Office space',
  Industrial: 'Factory',
  'Farm & Agri': 'Farm land',
}
const CATEGORY_OF = Object.fromEntries(
  Object.entries(KINDS).flatMap(([c, ks]) => ks.map((k) => [k, c])),
)
const SPOTS = ['Jagatpura', 'Vaishali Nagar', 'Mansarovar', 'Ajmer Road', 'Sitapura', 'Tonk Road']

// Curated cards that fit the conversation: the kind chosen (or the natural
// one for the category), placed in the area the visitor asked for.
export function showcaseFor(a, want = 3) {
  const kinds = a.kind
    ? [a.kind]
    : a.category
      ? [DEFAULT_KIND[a.category], ...(KINDS[a.category] || [])]
      : ['Villa', 'Office space', 'Factory', 'Apartment']
  const seen = new Set()
  const cards = []
  for (const kind of kinds) {
    for (const [title, detail, photo] of PICKS[kind] || []) {
      if (seen.has(title) || cards.length >= want) continue
      seen.add(title)
      const category = CATEGORY_OF[kind] || a.category || 'Residential'
      const spot =
        a.locality && a.locality !== 'Anywhere in Jaipur' ? a.locality : SPOTS[cards.length % SPOTS.length]
      const q = new URLSearchParams({ category })
      if (a.locality && a.locality !== 'Anywhere in Jaipur') q.set('locality', a.locality)
      cards.push({
        id: null,
        sample: true,
        title,
        address: `${spot}, Jaipur`,
        availability: a.listingType === 'rent' ? 'Leasing now' : 'For sale',
        type: kind,
        detail,
        tag: category.toUpperCase(),
        img: img(photo),
        href: `/find-property?${q.toString()}`,
      })
    }
  }
  return cards
}

// The words used for "what" in the results headline: "villas", "factories"…
export function nounFor(a) {
  const k = a.kind
  if (!k) return a.category ? `${a.category.toLowerCase()} properties` : 'properties'
  const plural = {
    Villa: 'villas', Apartment: 'apartments', Plot: 'plots', 'Office space': 'office spaces',
    'Shop / Showroom': 'shops and showrooms', 'Commercial building': 'commercial buildings',
    Factory: 'factories', Warehouse: 'warehouses', 'Industrial plot': 'industrial plots',
    'Farm land': 'farm lands', Farmhouse: 'farmhouses',
  }
  return plural[k] || `${k.toLowerCase()}s`
}

/* ---------------- questions ---------------- */

// Short, practical answers to the questions people actually type into the
// box ("how to buy industrial land", "what documents do I need", "stamp duty
// in Rajasthan"…). Each answer ends with buttons that lead back into the flow.
const show = (label, category, kind) => opt(label, 'results', { intent: 'buy', category, kind })
const CALL = opt('Talk to a specialist', 'lead')

const GUIDES = [
  {
    match: /industrial|factory|warehouse|riico/,
    text: 'Buying industrial land in Jaipur — the usual steps:',
    steps: [
      'Pick the zone: RIICO industrial areas (Sitapura, Bagru, VKIA, Mahindra SEZ) or private industrial land with approved land use.',
      'Verify title and land use: ownership chain, encumbrance certificate, and that the plot is zoned industrial (or get 90A / conversion done).',
      'For RIICO plots: apply through the RIICO portal or buy an existing allottee’s plot with RIICO’s transfer approval.',
      'Check power, water and road access, plus environmental (RSPCB) consent needs for your industry.',
      'Sign the agreement to sell, pay stamp duty and register the sale deed at the sub-registrar office.',
      'Complete mutation in revenue records and apply for building-plan approval before construction.',
    ],
    options: [show('Show industrial plots', 'Industrial', 'Industrial plot'), show('Show factories', 'Industrial', 'Factory'), CALL],
  },
  {
    match: /farm|agri|khet|orchard|farmhouse/,
    text: 'Buying farm or agricultural land in Rajasthan — the steps:',
    steps: [
      'Confirm the land type in the jamabandi (revenue record) and check the khasra map matches the plot on the ground.',
      'Verify the seller’s title, any loans or liens, and that there is no litigation or acquisition notice.',
      'If you plan to build a farmhouse, check conversion rules (Section 90A/90B) for the area.',
      'Agree the price per bigha/acre, sign the agreement and pay stamp duty.',
      'Register the sale deed and get mutation (namantaran) done in your name.',
    ],
    options: [show('Show farm land', 'Farm & Agri', 'Farm land'), show('Show farmhouses', 'Farm & Agri', 'Farmhouse'), CALL],
  },
  {
    match: /commercial|office|shop|showroom|retail/,
    text: 'Buying commercial property (office / shop / showroom) — the steps:',
    steps: [
      'Shortlist by footfall and access: main-road frontage, parking, metro or highway connectivity.',
      'Check the approved building plan, occupancy certificate and fire NOC for the building.',
      'Verify title, RERA registration (for new projects) and maintenance / association dues.',
      'Review the rent potential and existing lease if the unit is pre-leased.',
      'Sign the agreement, pay stamp duty and register the sale deed; then update the municipal records.',
    ],
    options: [show('Show office spaces', 'Commercial', 'Office space'), show('Show shops & showrooms', 'Commercial', 'Shop / Showroom'), CALL],
  },
  {
    match: /flat|apartment|villa|house|home|residential|bhk/,
    text: 'Buying a home in Jaipur — the usual steps:',
    steps: [
      'Fix your budget and get a home-loan pre-approval so you know what you can offer.',
      'Shortlist localities and visit — check approvals (JDA / RERA), builder track record and possession date.',
      'Verify the title chain, encumbrance certificate and the approved plan; our legal partner does this for you.',
      'Pay the token, sign the agreement to sell and complete the loan paperwork.',
      'Pay stamp duty and register the sale deed at the sub-registrar office.',
      'Take possession: snag the property, collect the OC and get the mutation done.',
    ],
    options: [show('Show villas', 'Residential', 'Villa'), show('Show apartments', 'Residential', 'Apartment'), CALL],
  },
]

const FAQS = [
  {
    match: /document|paper|checklist|proof|kyc/,
    text: 'Documents you’ll typically need when buying property in Rajasthan:',
    steps: [
      'Seller side: title deed / sale deed chain, jamabandi or lease deed, encumbrance certificate, approved map and completion / occupancy certificate.',
      'Project side (new builds): RERA registration, JDA / RIICO approval, NOCs (fire, environment where applicable).',
      'Buyer side: PAN, Aadhaar, address proof, photographs, and income documents if taking a loan.',
      'At registration: agreement to sell, stamp paper / e-stamp, witnesses’ IDs and the payment trail.',
    ],
    options: [CALL, opt('Start a property search', 'start')],
  },
  {
    match: /stamp|registr(y|ation) (charge|fee|cost)|duty/,
    text: 'Stamp duty and registration in Rajasthan (indicative — rates change, our legal partner confirms the exact amount):',
    steps: [
      'Stamp duty is around 6% of the deed value for men and 5% for women, plus surcharge.',
      'Registration fee is roughly 1% of the value.',
      'Payment is by e-stamp; the deed is then registered at the sub-registrar office for the area.',
      'Budget an extra 7–8% over the agreed price to be safe.',
    ],
    options: [CALL, opt('Start a property search', 'start')],
  },
  {
    match: /loan|emi|eligib|finance|mortgage/,
    text: 'Home / property loans — how it usually works:',
    steps: [
      'Banks lend up to 75–90% of the property value; the rest is your down payment.',
      'Eligibility depends on income, age, existing EMIs and credit score (750+ gets the best rates).',
      'Get a pre-approval first — it speeds up negotiation and the token stage.',
      'Documents: ID, address proof, 6 months’ bank statements, salary slips / ITRs, and the property papers.',
    ],
    options: [CALL, opt('Start a property search', 'start')],
  },
  {
    match: /rera/,
    text: 'RERA in a nutshell:',
    steps: [
      'Every new project above 500 sq.m or 8 units must be registered with Rajasthan RERA.',
      'Check the project’s RERA number on rera.rajasthan.gov.in — it shows approvals, timelines and complaints.',
      'Buy only from the registered project and insist the RERA number is on the agreement.',
    ],
    options: [CALL, opt('Start a property search', 'start')],
  },
  {
    match: /\b(sell|list(ing)?|post|advertise)\b.*\b(property|flat|plot|land|house)\b|\bhow (do|can) i (sell|list)/,
    text: 'Listing your property on My World City is free:',
    steps: [
      'Tap “List Property” on the home page and sign in with your email.',
      'Add the property name, type, address and (optionally) photos — you can skip photos and add them later.',
      'Tell us what you’d like to hear from buyers about, then submit.',
      'Our team verifies the listing and it goes live; enquiries come to your dashboard.',
    ],
    options: [{ label: 'Open List Property', href: '/list-property' }, CALL],
  },
  {
    match: /invest|return|yield|roi|appreciat/,
    text: 'Investing in Jaipur property — what to weigh up:',
    steps: [
      'Rental income: pre-leased offices and shops on main roads typically give 6–8% yields.',
      'Appreciation: plots and villas near growth corridors (Ajmer Road, Tonk Road, Jagatpura) have moved fastest.',
      'Check RERA, title and lease terms before committing; diversify between income and growth assets.',
    ],
    options: [opt('Show income-ready options', 'results', { intent: 'invest', category: 'Commercial', kind: 'Office space' }), opt('Show plots for appreciation', 'results', { intent: 'invest', category: 'Residential', kind: 'Plot' }), CALL],
  },
  {
    match: /rent agreement|lease agreement|tenant|lease (out|my)|rent out/,
    text: 'Leasing out a property — the steps:',
    steps: [
      'Fix the rent and deposit (usually 2–3 months for homes, 6+ for commercial).',
      'Verify the tenant: ID, employment / business proof and police verification.',
      'Sign a registered lease deed for terms over 11 months; a notarised agreement works for 11 months.',
      'Hand over with an inventory list and meter readings; our management team can run all of this for you.',
    ],
    options: [opt('Get my property managed', 'manage_need', { intent: 'manage' }), CALL],
  },
]

const QUESTION_RE = /\b(how|what|which|when|where|why|steps?|process|procedure|guide|explain|documents?|checklist|charges?|duty|eligib\w*|tips|rules?|require\w*)\b|\?/i

// Return a guide for a question-like message, or null.
export function answerQuestion(text) {
  const t = ` ${text.toLowerCase()} `
  if (!QUESTION_RE.test(t)) return null
  const faq = FAQS.find((f) => f.match.test(t))
  if (faq) return { text: faq.text, steps: faq.steps, options: faq.options }
  if (/\b(buy|purchase|acquire|own|get)\b|how to/.test(t)) {
    const g = GUIDES.find((g) => g.match.test(t))
    if (g) return { text: g.text, steps: g.steps, options: g.options }
  }
  return null
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

  // the specific kind, which also settles the category
  const kinds = [
    [/\b(villa|bungalow|kothi)\b/, 'Villa'],
    [/\b(flat|apartment)\b/, 'Apartment'],
    [/\b(factory|manufacturing)\b/, 'Factory'],
    [/\b(warehouse|godown)\b/, 'Warehouse'],
    [/\b(office)\b/, 'Office space'],
    [/\b(shop|showroom)\b/, 'Shop / Showroom'],
    [/\b(farmhouse|farm house)\b/, 'Farmhouse'],
    [/\b(farm|agri)\b/, 'Farm land'],
    [/\b(building|complex)\b/, 'Commercial building'],
    [/\b(plot|land)\b/, found.category === 'Industrial' ? 'Industrial plot' : 'Plot'],
    [/\b(house|home)\b/, 'Villa'],
  ]
  const kind = kinds.find(([re]) => re.test(t))
  if (kind) { found.kind = kind[1]; found.category = CATEGORY_OF[kind[1]] || found.category }

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
  else if (found.kind) bits.push(nounFor(found))
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
