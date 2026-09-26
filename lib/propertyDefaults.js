// Showcase content for the property page. Owners rarely fill in amenities,
// sustainability notes or floor plans on the listing wizard, so every listing
// falls back to a sensible set for its category — the page then always reads
// like the finished design rather than a half-empty form.
//
// Icon keys are resolved in components/property/icons.js.

const AGENTS = [
  {
    name: 'Rajesh Sharma',
    role: 'Senior Director, Industrial',
    phone: '9829012345',
    email: 'r.sharma@myworldcity.in',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=240&q=80',
  },
  {
    name: 'Priya Mehta',
    role: 'Portfolio Specialist',
    phone: '9829067890',
    email: 'p.mehta@myworldcity.in',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&q=80',
  },
]

const SUSTAINABILITY = [
  ['sun', 'Solar PV arrays'],
  ['activity', 'Solar network'],
  ['trending', 'Energy tracking'],
  ['zap', 'LED lighting'],
  ['droplet', 'Water-efficient fittings'],
  ['battery', 'EV charging'],
  ['rain', 'Rainwater harvesting'],
]

const NEARBY = [
  ['plane', 'Jaipur Airport', '6 km away'],
  ['city', 'Jaipur City Centre', '14 km away'],
  ['train', 'Durgapura Station', '8 km away'],
]

const BY_CATEGORY = {
  Industrial: {
    areaSuffix: 'lettable space',
    about:
      'This premium A-grade industrial asset is situated in the heart of RIICO Industrial Area, Jaipur. Engineered with high-standard logistics infrastructure, it offers direct access to key transportation highways and the Jaipur International Airport. The warehouse boasts exceptional structural height clearance, heavy vehicle hardstand load capacities, and modern integrated office spaces to support end-to-end corporate operations.',
    amenities: [
      ['check', 'On-site parking'],
      ['wifi', 'Internet connection'],
      ['shopping', 'Nearby shopping'],
      ['heart', 'Nearby childcare'],
      ['coffee', 'Nearby café'],
      ['shield', 'Fire sprinkler system'],
    ],
    structural: [
      'A-grade industrial facility with high-end architectural finish',
      'Quality corporate office + integrated warehouse amenities',
      'Heavy-duty floor slab designed for high wheel load capacities',
      'On-grade industrial roller shutter doors for fast load/unload',
      'Recessed dock shutter doors with leveling ramps',
      'Optimized heavy vehicle turning circles and wider access paths',
      '13.7m maximum ridge height clearance',
      'Secure gated perimeter fencing with 24/7 CCTV surveillance',
    ],
    units: [
      ['Warehouse 3', '6,450 sq.m'],
      ['Warehouse 8', '7,830 sq.m'],
    ],
  },
  Commercial: {
    areaSuffix: 'lettable space',
    about:
      'A Grade-A commercial address in one of Jaipur’s most connected business districts. The building combines efficient, column-free floor plates with a double-height lobby, high-speed lifts and dedicated visitor parking, making it equally suited to corporate headquarters, professional services firms and flagship retail.',
    amenities: [
      ['car', 'On-site parking'],
      ['wifi', 'High-speed internet'],
      ['shopping', 'Nearby shopping'],
      ['coffee', 'Café & food court'],
      ['shield', 'Fire sprinkler system'],
      ['zap', '100% power backup'],
    ],
    structural: [
      'Efficient column-free floor plates with 3.6m clear height',
      'Double-height entrance lobby with 24/7 manned reception',
      'High-speed passenger and service lifts',
      'Centralised air-conditioning with individual zone control',
      'Dedicated visitor and staff parking in the basement',
      'Fire-rated staircases and sprinkler coverage on every floor',
      'Fibre-ready riser and telecom room on each level',
      'Access-controlled entry with CCTV surveillance',
    ],
    units: [
      ['Ground floor — Retail', '640 sq.m'],
      ['3rd floor — Office suite', '1,120 sq.m'],
      ['5th floor — Full floor', '1,480 sq.m'],
    ],
  },
  Residential: {
    areaSuffix: 'built-up area',
    about:
      'A thoughtfully planned home in a gated, tree-lined community with everything a family needs within a short walk. Bright, well-ventilated living spaces open onto private balconies, while the community clubhouse, landscaped gardens and round-the-clock security make everyday living effortless.',
    amenities: [
      ['car', 'Covered parking'],
      ['wifi', 'Internet ready'],
      ['dumbbell', 'Gymnasium'],
      ['waves', 'Swimming pool'],
      ['heart', 'Kids’ play area'],
      ['shield', '24/7 security'],
    ],
    structural: [
      'RCC frame structure with earthquake-resistant design',
      'Vitrified tile flooring in living areas, anti-skid tiles in wet areas',
      'Modular kitchen with granite counter and provision for chimney',
      'UPVC windows with mosquito mesh and safety grills',
      'Concealed copper wiring with modular switches',
      '100% power backup for lifts and common areas',
      'Rainwater harvesting and sewage treatment plant on site',
      'Gated community with intercom and CCTV surveillance',
    ],
    units: [
      ['2 BHK — Tower A', '112 sq.m'],
      ['3 BHK — Tower B', '158 sq.m'],
      ['4 BHK Penthouse', '265 sq.m'],
    ],
  },
  'Farm & Agri': {
    areaSuffix: 'land area',
    about:
      'Fertile, well-irrigated agricultural land with clear title and all-weather road access, minutes from the highway. Ideal for organic farming, a farmhouse retreat or long-term land banking on Jaipur’s fast-growing outskirts.',
    amenities: [
      ['check', 'Road access'],
      ['droplet', 'Bore well & drip irrigation'],
      ['zap', 'Electricity connection'],
      ['sprout', 'Fertile black soil'],
      ['trees', 'Mature tree cover'],
      ['shield', 'Fenced boundary'],
    ],
    structural: [
      'Clear, marketable title with mutation completed',
      'Level land with natural drainage, no flooding history',
      'Bore well with 3-phase electricity connection',
      'Drip irrigation lines laid across the cultivable area',
      'Barbed-wire fencing on all four sides with a gated entry',
      'Farm shed and caretaker quarters on site',
      'Approach road suitable for tractors and trucks',
      'Within notified zone for farmhouse construction',
    ],
    units: [
      ['Plot A — cultivable', '2.0 acres'],
      ['Plot B — farmhouse zone', '1.2 acres'],
    ],
  },
}

const fallback = (category) => BY_CATEGORY[category] || BY_CATEGORY.Commercial

// Owners and admins pick amenities by name only ("Gym", "Visitor Parking",
// "24×7 Security"…), so pick a matching glyph from the wording. First match
// wins; anything unrecognised gets the plain tick.
const ICON_RULES = [
  ['wifi', /wi-?fi|internet|broadband/],
  ['car', /parking|garage/],
  ['shopping', /shop|market|mall|retail|grocer/],
  ['coffee', /caf[eé]|restaurant|canteen|food/],
  ['shield', /security|cctv|guard|fire|sprinkler|safety|gated/],
  ['dumbbell', /gym|fitness|yoga/],
  ['waves', /pool|swim|spa|jacuzzi/],
  ['zap', /power|backup|electric|generator|ev\b|charging/],
  ['heart', /child|kid|school|creche|day ?care|clinic|hospital|health/],
  ['trees', /garden|park\b|lawn|green|tree/],
  ['trophy', /sport|court|tennis|badminton|cricket|football|basketball|play/],
  ['droplet', /water|rain|bore|drip|irrigation/],
  ['sun', /solar|terrace|rooftop|sunlight/],
  ['city', /club|lounge|hall|community|lift|elevator|lobby/],
  ['train', /metro|station|rail/],
  ['plane', /airport/],
  ['sprout', /soil|farm|organic|crop/],
]
export function iconForLabel(label = '') {
  const l = String(label).toLowerCase()
  const hit = ICON_RULES.find(([, re]) => re.test(l))
  return hit ? hit[0] : 'check'
}

// Icon keys components/property/icons.js can draw. Older listings carry
// icon names from a previous scheme; those are ignored in favour of the label.
const KNOWN_ICONS = new Set([
  'activity', 'battery', 'car', 'check', 'city', 'coffee', 'droplet', 'dumbbell', 'heart', 'pin',
  'plane', 'rain', 'shield', 'shopping', 'sprout', 'sun', 'train', 'trees', 'trending', 'trophy',
  'waves', 'wifi', 'zap',
])
const resolveIcon = (a) => (a.icon && KNOWN_ICONS.has(a.icon) && a.icon !== 'check' ? a.icon : iconForLabel(a.label))

// Fill in whatever the listing itself left blank.
export function withDefaults(d) {
  const f = fallback(d.category)
  const amenities = d.amenities?.length
    ? d.amenities.map((a) => ({ icon: resolveIcon(a), label: a.label }))
    : f.amenities.map(([icon, label]) => ({ icon, label }))

  return {
    ...d,
    about: d.about || f.about,
    amenities,
    sustainability: SUSTAINABILITY.map(([icon, label]) => ({ icon, label })),
    structural: f.structural,
    units: f.units.map(([name, area]) => ({ name, area, status: 'Available Now' })),
    areaLine: d.area ? `${d.area} ${f.areaSuffix}` : `${f.units.map((u) => u[1]).join(' – ')} ${f.areaSuffix}`,
    nearby: d.nearby?.length
      ? d.nearby.map((n) => ({ icon: 'pin', ...n }))
      : NEARBY.map(([icon, label, value]) => ({ icon, label, value })),
    contacts: d.owner ? [d.owner, AGENTS[0]] : AGENTS,
  }
}
