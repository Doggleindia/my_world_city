// Centralized content + image references for the landing page.
const img = (id, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

// Shared primary navigation (used by Navbar across every page).
export const navLinks = [
  { label: 'Find Property', href: '/find-property' },
  { label: 'Build Property', href: '/develop' },
  { label: 'Services', href: '/services' },
  { label: 'Premium', href: '/find-property' },
]

export const hero = {
  bg: img('1503387762-592deb58ef4e', 1600),
}

export const actionCards = [
  {
    key: 'buy',
    icon: 'Home',
    title: 'Buy a Property',
    desc: 'I want to buy or lease a verified property',
    color: 'text-emerald-600',
    bar: 'bg-emerald-500',
  },
  {
    key: 'build',
    icon: 'Building2',
    title: 'Build',
    desc: 'I want to build on my land , handled',
    color: 'text-blue-600',
    bar: 'bg-blue-500',
  },
  {
    key: 'manage',
    icon: 'Users',
    title: 'Operate & Manage',
    desc: 'I own a property and need it leased and maintained',
    color: 'text-ember',
    bar: 'bg-ember',
  },
  {
    key: 'invest',
    icon: 'TrendingUp',
    title: 'Invest',
    desc: 'I want pre-leased, yield-focused property',
    color: 'text-amber-500',
    bar: 'bg-amber-500',
  },
]

export const stats = [
  { value: '1,800+', label: 'VERIFIED PROPERTIES' },
  { value: '₹4,200 Cr+', label: 'LISTED VALUE' },
  { value: '240+', label: 'TRUSTED PARTNERS' },
  { value: '12 yrs', label: 'ON-GROUND EXPERTISE' },
]

export const categories = [
  { title: 'Industrial', listings: '120+ Listings', img: img('1581094794329-c8112a89af12') },
  { title: 'Residential', listings: '450+ Listings', img: img('1564013799919-ab600027ffc6') },
  { title: 'Commercial', listings: '85+ Listings', img: img('1486406146926-c627a92ad1ab') },
  { title: 'Farm & Agri', listings: '140+ Listings', img: img('1500382017468-9049fed747ef') },
]

export const featured = [
  { tag: 'INDUSTRIAL', title: 'Industrial Land', loc: 'Sitapura — 4.5 acres', img: img('1500382017468-9049fed747ef') },
  { tag: 'RESIDENTIAL', title: 'Premium Villa', loc: 'Mansarovar — 2.1 acres', img: img('1586023492125-27b2c045efd7') },
  { tag: 'COMMERCIAL', title: 'Corporate Plaza', loc: 'C-Scheme — 1.8 acres', img: img('1545324418-cc1a3fa10c00') },
  { tag: 'COMMERCIAL', title: 'Office Tower', loc: 'Malviya Nagar — 0.9 acres', img: img('1497366216548-37526070297c') },
  { tag: 'AGRICULTURAL', title: 'Farm Land', loc: 'Bagru — 6.0 acres', img: img('1416879595882-3373a0480b5b') },
  { tag: 'RESIDENTIAL', title: 'Luxury Apartment', loc: 'Vaishali Nagar — 3.2 acres', img: img('1502672260266-1c1ef2d93688') },
]

export const experts = [
  { tag: 'Certified Experts', icon: 'Scale', title: 'Legal', desc: 'Paperwork, RERA agreements you can trust' },
  { tag: 'On-Site Survey', icon: 'Ruler', title: 'Surveyor', desc: 'Site measurements and boundary verification' },
  { tag: 'Design & Planning', icon: 'PencilRuler', title: 'Architect', desc: 'Plans, layout, structural design' },
  { tag: 'Construction', icon: 'Wrench', title: 'Contractor', desc: 'Build crews, materials, on-site execution' },
  { tag: 'Compliance', icon: 'Stamp', title: 'Govt Liaison', desc: 'Approvals, permits, NOC documentation' },
  { tag: 'Supply Chain', icon: 'Truck', title: 'Building Material', desc: 'Cement, steel, fittings, sanitary supply' },
  { tag: 'Finishing', icon: 'Sofa', title: 'Interior', desc: 'Layout, finishes, furniture & styling' },
  { tag: 'Consulting', icon: 'Compass', title: 'Vastu', desc: 'Direction, energy flow, spatial balance' },
]

export const gallery = [
  img('1545324418-cc1a3fa10c00'),
  img('1486406146926-c627a92ad1ab'),
  img('1512453979798-5ea266f8880c'),
  img('1493246507139-91e8fad9978e'),
  img('1480714378408-67cf0d13bc1b'),
  img('1502005229762-cf1b2da7c5d6'),
]

export const insights = [
  {
    slug: 'smart-home-integration-new-homeowners',
    title: "Smart Home Integration Streamlines the Living Experience for New Homeowners",
    desc: 'Integration services that let new homeowners control appliances, lighting, and security from a single app.',
    img: img('1558002038-1055907df827'),
    category: 'Smart Living',
    date: 'June 2026',
    readTime: '4 min read',
    body: [
      'For families moving into a new home in Jaipur, the first few weeks are usually spent wiring up a patchwork of disconnected gadgets — a smart bulb here, a video doorbell there, a thermostat that only talks to its own app. Integration changes that. A properly integrated home brings lighting, climate, security cameras, door locks and entertainment under one roof, controllable from a phone or a voice assistant.',
      'The practical wins show up fast. Lighting and air-conditioning schedules cut electricity bills through the long Jaipur summer. Motion-aware cameras and smart locks mean you can let a verified service partner in remotely and watch the work happen. And because everything reports to a single dashboard, a fault — a left-open gate, a running geyser — surfaces immediately instead of after the bill arrives.',
      'Our advice to first-time buyers is to plan the backbone before the furniture. Decide on one ecosystem, run the wiring and Wi-Fi coverage during fit-out rather than after, and insist that your contractor leaves clean documentation of every connected device. Done right, integration is invisible: the house simply does the obvious thing at the obvious time.',
    ],
  },
  {
    slug: 'sustainable-housing-eco-friendly-living',
    title: "Sustainable Housing Development Redefines Eco-Friendly Living",
    desc: 'Energy-efficient designs and low-impact materials that cut running costs and carbon together.',
    img: img('1518780664697-55e3ad937233'),
    category: 'Sustainability',
    date: 'June 2026',
    readTime: '5 min read',
    body: [
      'Sustainable housing is no longer a premium add-on — in a city as sun-rich and water-stressed as Jaipur, it is simply good engineering. The newest developments lead with passive design: orientation that keeps walls out of the harshest afternoon sun, cross-ventilation that reduces the hours an air-conditioner has to run, and high-albedo roofing that keeps the top floor liveable.',
      'On top of the passive layer comes the active one. Rooftop solar now pays for itself within a few years at current tariffs, rainwater harvesting recharges groundwater that the whole locality depends on, and greywater recycling turns kitchen and bath runoff into garden irrigation. Material choices matter too — fly-ash bricks, low-VOC paints and locally sourced stone shrink both the carbon footprint and the transport cost.',
      'For investors, the case is straightforward: lower running costs make a home easier to rent and easier to resell, and green-certified buildings increasingly command a premium. Every sustainable listing on My World City is checked for the claims it makes, so buyers know an "eco-friendly" tag reflects real systems, not marketing.',
    ],
  },
  {
    slug: 'advanced-security-solutions-investors',
    title: "Advanced Security Solutions Enhance Property Safety for Real Estate Investors",
    desc: 'Surveillance, access control and monitoring that protect properties owners cannot watch every day.',
    img: img('1496307653780-42ee777d4833'),
    category: 'Security',
    date: 'May 2026',
    readTime: '4 min read',
    body: [
      'For an investor holding a plot in Sitapura or a villa in Jagatpura that sits empty between tenants, security is the difference between a passive asset and a constant worry. Modern systems are built for exactly this absentee-owner reality — cloud cameras that stream to a phone, motion sensors that distinguish a stray dog from a person, and smart locks that issue time-limited codes to caretakers and contractors.',
      'The shift from recording to prevention is the real change. Older CCTV only told you what had already gone wrong. Today’s monitoring pushes a live alert the moment a boundary is crossed, and many setups pair with a local response service that can reach the site in minutes. Access logs also settle disputes: you know exactly who entered, when, and for how long.',
      'Before buying any security package, owners should confirm three things — that footage is stored off-site so it survives tampering, that the system keeps working through a power cut, and that someone is contractually responsible for responding to alerts. A camera nobody watches is just a deterrent sticker.',
    ],
  },
  {
    slug: 'proptech-digitizing-real-estate-transactions',
    title: 'PropTech Innovations Digitize Real Estate Transactions for a Seamless Buying Experience',
    desc: 'Verified records, digital documentation and transparent workflows that make buying faster and safer.',
    img: img('1451187580459-43490279c0fa'),
    category: 'PropTech',
    date: 'May 2026',
    readTime: '6 min read',
    body: [
      'Property in India has historically been bought on paper and on trust — physical files, cash-heavy negotiations and a title history that takes weeks to untangle. PropTech is rewriting that workflow. Digitised land records, e-stamping and online registration appointments have already cut the friction at the government counter, and verified digital listings are doing the same for the search itself.',
      'The biggest gain is transparency. When a listing carries a verified tag, a buyer can see that the title, the measurements and the ownership chain have been checked before the first site visit. Digital documentation keeps every agreement, payment receipt and approval in one timeline, so nobody is reconstructing the deal from a shoebox of papers six months later.',
      'This is the thesis My World City is built on: every property real, every partner verified, every step recorded. By moving enquiries, document checks and payments onto one transparent platform, the goal is simple — make a property transaction in Jaipur feel as predictable as any other major purchase, with no surprises hiding in the fine print.',
    ],
  },
]

// ---- Property listing page ----
export const activeChips = [
  'Buy',
  'Residential',
  'Plot',
  'Jaipur',
  '₹40L – ₹1.2Cr',
  '1000–2500 sq.yd',
]

const listingImgs = [
  img('1500382017468-9049fed747ef'), // farm / land
  img('1586023492125-27b2c045efd7'), // living room interior
  img('1564013799919-ab600027ffc6'), // white villa
  img('1497366216548-37526070297c'), // dark commercial building
]

export const listings = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  tag: 'INDUSTRIAL',
  title: 'Industrial Land',
  loc: 'Sitapura — 4.5 acres',
  img: listingImgs[i % listingImgs.length],
}))

// ---- Property detail page ----
export const property = {
  category: 'RESIDENTIAL',
  title: 'Modern 3BHK Villa',
  area: '2,400 sq ft • 223 sq m',
  location: 'Jagatpura, Jaipur',
  verified: true,
  photoCount: 18,
  breadcrumb: ['Home', 'Residential', 'Jagatpura', 'Modern 3BHK Villa'],
  badges: ['3 BHK', '3 Bath', '2 Parking', 'Ready to move', 'Freehold'],
  gallery: {
    main: img('1568605114967-8130f3a36994', 1400),
    thumbs: [
      img('1618221195710-dd6b41faaea6', 700), // dining
      img('1556909114-f6e7ad7d3136', 700), // kitchen
      img('1522708323590-d24dbb6b0267', 700), // bedroom
      img('1571003123894-1f0594d2b5d9', 700), // pool
    ],
  },
  keyDetails: [
    [{ l: 'Super Area', v: '2800 sq.ft' }, { l: 'Developer', v: 'Aura Developers' }],
    [{ l: 'Configuration', v: '3 Bedrooms, 3 Bathrooms' }, { l: 'Floor', v: 'Ground + 1' }],
    [{ l: 'Facing', v: 'North-East' }, { l: 'Furnishing', v: 'Semi-Furnished' }],
    [{ l: 'Possession', v: 'Immediate' }, { l: 'Project Status', v: 'Completed' }],
  ],
  amenities: [
    { icon: 'Users', label: 'Clubhouse' },
    { icon: 'ShieldCheck', label: '24×7 Security' },
    { icon: 'Zap', label: 'Power Backup' },
    { icon: 'ArrowUpDown', label: 'Lift' },
    { icon: 'Trees', label: 'Landscaped Park' },
    { icon: 'Droplet', label: 'Water 24×7' },
    { icon: 'Fence', label: 'Gated Community' },
    { icon: 'Dumbbell', label: 'Gym' },
  ],
  about:
    'Discover the epitome of luxury living in this architectural masterpiece located in the heart of Jagatpura. This villa combines traditional Jaipur heritage with modern minimalist design, offering expansive living spaces bathed in natural light. Perfectly situated near major transport hubs, it represents a verified, secure investment for families seeking a premium lifestyle.',
  distances: [
    { label: 'Ring Road', value: '1.2 km' },
    { label: 'Railway Station', value: '4.5 km' },
    { label: 'Airport', value: '6.8 km' },
  ],
  agent: {
    name: 'Amit Sharma',
    role: 'OWNER',
    responds: 'Usually responds in ~2 hrs',
    avatar: 'https://i.pravatar.cc/120?img=12',
  },
}

export const ownershipSteps = [
  { n: 1, title: 'Legal Check', desc: 'Title, ownership & document verification.', ring: 'bg-teal-500' },
  { n: 2, title: 'Home Loan', desc: 'Financing options & loan eligibility.', ring: 'bg-blue-600' },
  { n: 3, title: 'Agreement', desc: 'Sale agreement, token amount & terms.', ring: 'bg-red-600' },
  { n: 4, title: 'Registration', desc: 'Stamp duty, registry & mutation.', ring: 'bg-amber-500' },
  { n: 5, title: 'Possession', desc: 'Final inspection & handover', ring: 'bg-pink-500' },
]

// ---- Experts directory page ----
export const expertCategories = [
  'All',
  'Legal',
  'Architecture',
  'Engineering',
  'Construction',
  'Interior',
  'Approvals',
  'Finance',
  'Vastu',
  'Solar',
]

export const expertList = [
  { slug: 'neha-sharma', initials: 'NS', cat: 'Architecture', tag: 'ARCHITECTURE', name: 'Ar. Neha Sharma', role: 'Senior Architect', specialty: 'Residential & commercial design' },
  { slug: 'rajesh-mehta', initials: 'RM', cat: 'Legal', tag: 'LEGAL', name: 'Adv. Rajesh Mehta', role: 'Legal Advisor', specialty: 'Title verification & registration' },
  { slug: 'vikram-singh', initials: 'VS', cat: 'Engineering', tag: 'ENGINEERING', name: 'Er. Vikram Singh', role: 'Structural Engineer', specialty: 'RCC & structural design' },
  { slug: 'suresh-kumar', initials: 'SK', cat: 'Construction', tag: 'CONSTRUCTION', name: 'Suresh Kumar', role: 'Civil Contractor', specialty: 'Turnkey home construction' },
  { slug: 'priya-agarwal', initials: 'PA', cat: 'Interior', tag: 'INTERIOR', name: 'Priya Agarwal', role: 'Interior Designer', specialty: 'Luxury residential interiors' },
  { slug: 'mahesh-joshi', initials: 'MJ', cat: 'Approvals', tag: 'APPROVALS', name: 'Mahesh Joshi', role: 'Govt Liaison', specialty: 'JDA / RIICO clearances' },
  { slug: 'anil-gupta', initials: 'AG', cat: 'Finance', tag: 'FINANCE', name: 'Anil Gupta', role: 'Home Loan Advisor', specialty: 'Construction & home loans' },
  { slug: 'pandit-ramesh', initials: 'PR', cat: 'Vastu', tag: 'VASTU', name: 'Pandit Ramesh', role: 'Vastu Consultant', specialty: 'Residential & commercial Vastu' },
  { slug: 'deepak-verma', initials: 'DV', cat: 'Solar', tag: 'ENERGY', name: 'Deepak Verma', role: 'Solar Installer', specialty: 'Rooftop solar systems' },
]

// Profile content keyed by expert category. buildProfile() (in the [slug] route)
// overlays each expert's identity (name, role, initials…) on top of the matching
// block, so a lawyer renders legal content and an architect renders design content.
export const expertContentByCat = {
  Architecture: {
    photo: 'https://i.pravatar.cc/600?img=47',
    location: 'Vaishali Nagar',
    experience: '12 years exp',
    languages: 'Hindi / English',
    intro:
      'Specializing in contemporary residential landmarks and large-scale commercial infrastructure, blending traditional Rajasthani structural wisdom with modern geometric precision.',
    stats: [
      { value: '80+', label: 'Projects' },
      { value: '12 yrs', label: 'Experience' },
      { value: '12', label: 'Cities' },
      { value: '100%', label: 'Delivery Rate' },
    ],
    about: [
      "This architect's journey is deeply rooted in the Pink City's unique blend of heritage and ambition. After graduating from a top school of planning, they dedicated over a decade to perfecting 'Vernacular Modernism' — a style that respects Jaipur's climate and history while meeting the demands of global citizens.",
      'Their approach is holistic, managing projects from the first sketch to the final brick — a building should not only be a functional space but a legacy piece that grows in value and character over time.',
    ],
    quickFacts: [
      'Specialize in luxury residential and boutique retail design.',
      'Expert in Vastu-Shastra integration with modern floor plans.',
      "Recipient of the 'Rajasthan Architect Excellence' Award 2023.",
      'Active consultant for smart-city infrastructure projects.',
    ],
    worksOn: [
      'Residential villas', 'Vastu-aligned design', 'Heritage restoration', 'Boutique retail',
      'Commercial skyscrapers', 'Sustainable landscaping', 'Turnkey execution', 'Smart home integration',
    ],
    qualifications: [
      { icon: 'GraduationCap', title: 'B Arch', desc: 'School of Planning and Architecture, New Delhi.', bg: 'bg-emerald-500' },
      { icon: 'BadgeCheck', title: 'COA Registered', desc: 'Member of Council of Architecture (India).', bg: 'bg-amber-500' },
      { icon: 'Leaf', title: 'IGBC Accredited', desc: 'Indian Green Building Council Professional.', bg: 'bg-brand' },
      { icon: 'Newspaper', title: 'AD Featured', desc: 'Featured in Architectural Digest — Top 50 Architects.', bg: 'bg-red-600' },
    ],
    projects: [
      { year: '2025', title: 'Verma Residence', meta: 'Jagatpura • Residential Villa', desc: 'A 6,000 sq. ft. private estate focused on indoor-outdoor living with a central light-well atrium.', img: img('1564013799919-ab600027ffc6', 1000) },
      { year: '2024', title: 'RIICO Office Tower', meta: 'Sitapura • Commercial', desc: 'Sustainable corporate headquarters featuring a LEED Gold-certified double-skin facade.', img: img('1486406146926-c627a92ad1ab', 1000) },
      { year: '2024', title: 'C-Scheme Boutique Floor', meta: 'C-Scheme • Interior Design', desc: 'High-end residential floor renovation blending colonial proportions with minimalist aesthetics.', img: img('1586023492125-27b2c045efd7', 1000) },
      { year: '2023', title: 'Mansarovar Twin Villas', meta: 'Mansarovar • Residential', desc: 'A pair of mirrored residences designed for an extended family, sharing a central landscaped court.', img: img('1568605114967-8130f3a36994', 1000) },
    ],
  },

  Legal: {
    photo: 'https://i.pravatar.cc/600?img=12',
    location: 'C-Scheme',
    experience: '15 years exp',
    languages: 'Hindi / English',
    intro:
      'Property-law specialist focused on watertight title verification, RERA compliance and registration — so your purchase is secure from the very first rupee.',
    stats: [
      { value: '600+', label: 'Matters' },
      { value: '15 yrs', label: 'Experience' },
      { value: '98%', label: 'Clearance Rate' },
      { value: '7 days', label: 'Avg Turnaround' },
    ],
    about: [
      'With over fifteen years at the Rajasthan High Court and district registry offices, this advisor has reviewed thousands of title chains and caught the encumbrances that derail deals after money changes hands.',
      'The practice is built on a simple promise: no client signs a sale deed until every link in the ownership history is verified and every statutory clearance is in hand.',
    ],
    quickFacts: [
      'Specialize in title search and encumbrance verification.',
      'Empanelled for RERA agreement drafting and review.',
      'Handles registration, mutation and stamp-duty assessment end-to-end.',
      'Advisor on 200+ dispute-free property transfers.',
    ],
    worksOn: [
      'Title verification', 'RERA agreements', 'Sale & gift deeds', 'Encumbrance checks',
      'Property registration', 'Dispute resolution', 'Power of attorney', 'Due diligence',
    ],
    qualifications: [
      { icon: 'Scale', title: 'LL.B', desc: 'University of Rajasthan, Faculty of Law.', bg: 'bg-emerald-500' },
      { icon: 'BadgeCheck', title: 'Bar Council', desc: 'Enrolled with the Bar Council of Rajasthan.', bg: 'bg-amber-500' },
      { icon: 'FileCheck', title: 'RERA Empanelled', desc: 'Listed legal counsel for RERA matters.', bg: 'bg-brand' },
      { icon: 'Award', title: 'Notary Public', desc: 'Government-appointed Notary, Jaipur district.', bg: 'bg-red-600' },
    ],
    projects: [
      { year: '2025', title: 'Sitapura Land Aggregation', meta: 'Sitapura • Title Due Diligence', desc: 'Cleared a 12-acre industrial assembly across nine owners, resolving two pending litigations before transfer.', img: img('1500382017468-9049fed747ef', 1000) },
      { year: '2024', title: 'Mansarovar Society Conveyance', meta: 'Mansarovar • Registration', desc: 'Structured the deemed-conveyance and registration for a 64-flat housing society.', img: img('1486406146926-c627a92ad1ab', 1000) },
      { year: '2024', title: 'NRI Estate Settlement', meta: 'C-Scheme • Succession', desc: 'Drafted partition and power-of-attorney instruments for an overseas family estate.', img: img('1564013799919-ab600027ffc6', 1000) },
      { year: '2023', title: 'Commercial Lease Audit', meta: 'Malviya Nagar • Documentation', desc: 'Audited and re-papered 30+ retail leases for a commercial plaza ahead of sale.', img: img('1497366216548-37526070297c', 1000) },
    ],
  },

  Engineering: {
    photo: 'https://i.pravatar.cc/600?img=33',
    location: 'Malviya Nagar',
    experience: '14 years exp',
    languages: 'Hindi / English',
    intro:
      'Structural engineer specializing in RCC design, seismic analysis and on-site quality control for residential and industrial builds across Rajasthan.',
    stats: [
      { value: '200+', label: 'Structures' },
      { value: '14 yrs', label: 'Experience' },
      { value: '0', label: 'Failures' },
      { value: '100%', label: 'Code Compliant' },
    ],
    about: [
      'A licensed structural engineer who treats every drawing as a safety promise — designs are load-tested, seismic-checked for Zone II, and detailed down to the bar-bending schedule before a single column is cast.',
      'Years of site supervision mean designs that are not just sound on paper but buildable, economical, and verified at every pour.',
    ],
    quickFacts: [
      'Specialize in RCC framed structures and foundations.',
      'Seismic and wind-load analysis for mid-rise buildings.',
      'On-site quality audits and concrete-mix verification.',
      'Retrofitting and structural-stability certification.',
    ],
    worksOn: [
      'RCC structural design', 'Foundation design', 'Seismic analysis', 'Soil & geotech review',
      'Bar-bending schedules', 'Site supervision', 'Structural audits', 'Retrofitting',
    ],
    qualifications: [
      { icon: 'GraduationCap', title: 'B.Tech Civil', desc: 'MNIT Jaipur — Civil Engineering.', bg: 'bg-emerald-500' },
      { icon: 'BadgeCheck', title: 'IE(I) Member', desc: 'Member, Institution of Engineers (India).', bg: 'bg-amber-500' },
      { icon: 'ShieldCheck', title: 'Licensed Engineer', desc: 'Registered structural engineer, JDA panel.', bg: 'bg-brand' },
      { icon: 'Award', title: 'M.Tech Structures', desc: 'Specialization in Structural Engineering.', bg: 'bg-red-600' },
    ],
    projects: [
      { year: '2025', title: 'Sitapura Warehouse Frame', meta: 'Sitapura • Industrial', desc: 'Designed a clear-span pre-engineered structure for a 40,000 sq. ft. logistics warehouse.', img: img('1581094794329-c8112a89af12', 1000) },
      { year: '2024', title: 'Jagatpura G+3 Apartments', meta: 'Jagatpura • Residential', desc: 'RCC framed design and foundation system for a four-storey apartment block on soft soil.', img: img('1564013799919-ab600027ffc6', 1000) },
      { year: '2024', title: 'Heritage Haveli Retrofit', meta: 'Old City • Restoration', desc: 'Structural retrofitting and stability certification for a 90-year-old stone haveli.', img: img('1586023492125-27b2c045efd7', 1000) },
      { year: '2023', title: 'C-Scheme Office Slab', meta: 'C-Scheme • Commercial', desc: 'Post-tensioned slab design enabling a column-free conference floor.', img: img('1486406146926-c627a92ad1ab', 1000) },
    ],
  },

  Construction: {
    photo: 'https://i.pravatar.cc/600?img=51',
    location: 'Jagatpura',
    experience: '18 years exp',
    languages: 'Hindi / English',
    intro:
      'Civil contractor delivering turnkey homes and commercial builds — from foundation to finishing — with transparent costing and milestone-based execution.',
    stats: [
      { value: '120+', label: 'Homes Built' },
      { value: '18 yrs', label: 'Experience' },
      { value: '95%', label: 'On-Time' },
      { value: '4.8★', label: 'Client Rating' },
    ],
    about: [
      'Eighteen years of building across Jaipur means a crew that knows local soil, labour and material rates cold — and a project manager who keeps the site running to schedule.',
      'Every project runs on a published milestone plan with quality checks at each stage, so clients always know what is being built, when, and for how much.',
    ],
    quickFacts: [
      'Specialize in turnkey residential construction.',
      'Transparent BOQ and milestone-linked billing.',
      'In-house crews for civil, plumbing and electrical.',
      'Dedicated site engineer on every project.',
    ],
    worksOn: [
      'Turnkey home construction', 'Civil & RCC work', 'Renovation & extension', 'Project scheduling',
      'Material procurement', 'Quality control', 'Waterproofing', 'Site management',
    ],
    qualifications: [
      { icon: 'HardHat', title: 'Class-A Contractor', desc: 'Registered Class-A civil contractor, Rajasthan.', bg: 'bg-emerald-500' },
      { icon: 'BadgeCheck', title: 'Verified Crews', desc: 'Background-checked in-house labour teams.', bg: 'bg-amber-500' },
      { icon: 'ShieldCheck', title: 'Quality Certified', desc: 'ISO-aligned site quality processes.', bg: 'bg-brand' },
      { icon: 'Award', title: '120+ Handovers', desc: 'Completed homes across Jaipur since 2007.', bg: 'bg-red-600' },
    ],
    projects: [
      { year: '2025', title: 'Jagatpura Duplex', meta: 'Jagatpura • Turnkey Villa', desc: 'A 3,200 sq. ft. duplex delivered in 11 months, foundation to handover.', img: img('1568605114967-8130f3a36994', 1000) },
      { year: '2024', title: 'Mansarovar Rowhouses', meta: 'Mansarovar • Residential', desc: 'Six rowhouses built in parallel with shared procurement to cut costs 12%.', img: img('1564013799919-ab600027ffc6', 1000) },
      { year: '2024', title: 'Vaishali Retail Shell', meta: 'Vaishali Nagar • Commercial', desc: 'Core-and-shell construction for a ground-plus-two retail block.', img: img('1497366216548-37526070297c', 1000) },
      { year: '2023', title: 'Bagru Farmhouse', meta: 'Bagru • Farm Build', desc: 'Off-grid farmhouse with rainwater harvesting and a solar-ready roof.', img: img('1416879595882-3373a0480b5b', 1000) },
    ],
  },

  Interior: {
    photo: 'https://i.pravatar.cc/600?img=45',
    location: 'C-Scheme',
    experience: '10 years exp',
    languages: 'Hindi / English',
    intro:
      'Interior designer crafting luxury residential and boutique retail spaces — warm material palettes, smart storage and lighting that makes a home feel finished.',
    stats: [
      { value: '90+', label: 'Spaces' },
      { value: '10 yrs', label: 'Experience' },
      { value: '40+', label: 'Repeat Clients' },
      { value: '4.9★', label: 'Client Rating' },
    ],
    about: [
      'A decade of designing homes that feel personal rather than staged — every brief starts with how a family actually lives, then layers in material, light and proportion.',
      'From modular kitchens to full turnkey fit-outs, the studio manages design, procurement and on-site execution under one roof.',
    ],
    quickFacts: [
      'Specialize in luxury residential interiors.',
      'Turnkey fit-outs with in-house execution.',
      'Vastu-aware layouts and lighting design.',
      'Bespoke modular kitchens and wardrobes.',
    ],
    worksOn: [
      'Residential interiors', 'Modular kitchens', 'Lighting design', 'Boutique retail',
      'Furniture & styling', 'Space planning', 'Turnkey fit-outs', 'Material consulting',
    ],
    qualifications: [
      { icon: 'GraduationCap', title: 'B.Des Interior', desc: 'Bachelor of Design — Interior Architecture.', bg: 'bg-emerald-500' },
      { icon: 'BadgeCheck', title: 'IIID Member', desc: 'Institute of Indian Interior Designers.', bg: 'bg-amber-500' },
      { icon: 'Sofa', title: 'Turnkey Studio', desc: 'In-house carpentry and execution team.', bg: 'bg-brand' },
      { icon: 'Newspaper', title: 'Published Work', desc: 'Featured in regional design publications.', bg: 'bg-red-600' },
    ],
    projects: [
      { year: '2025', title: 'C-Scheme Apartment', meta: 'C-Scheme • Residential', desc: 'A warm-minimalist 3BHK fit-out with a custom oak-and-brass kitchen.', img: img('1586023492125-27b2c045efd7', 1000) },
      { year: '2024', title: 'Boutique Jewellery Store', meta: 'Johari Bazaar • Retail', desc: 'Lighting-led retail design that doubled dwell time at the counter.', img: img('1545324418-cc1a3fa10c00', 1000) },
      { year: '2024', title: 'Mansarovar Villa Interiors', meta: 'Mansarovar • Residential', desc: 'Full turnkey interiors across four bedrooms and a home theatre.', img: img('1568605114967-8130f3a36994', 1000) },
      { year: '2023', title: 'Café Fit-out', meta: 'Vaishali Nagar • Hospitality', desc: 'A 40-cover café with a terrazzo bar and layered warm lighting.', img: img('1502672260266-1c1ef2d93688', 1000) },
    ],
  },

  Approvals: {
    photo: 'https://i.pravatar.cc/600?img=59',
    location: 'Lal Kothi',
    experience: '16 years exp',
    languages: 'Hindi / English',
    intro:
      'Government-liaison specialist who secures JDA and RIICO building-plan sanctions, NOCs and completion certificates — so your project breaks ground on time.',
    stats: [
      { value: '500+', label: 'Approvals' },
      { value: '16 yrs', label: 'Experience' },
      { value: '95%', label: 'First-Pass' },
      { value: '6 wks', label: 'Avg Sanction' },
    ],
    about: [
      'Sixteen years navigating JDA, RIICO and municipal departments means knowing exactly which file goes where, what each officer needs, and how to keep an application from stalling.',
      'The service compiles the full submission package, files it, follows up, and answers every departmental query until the sanctioned plan and NOCs are in your hand.',
    ],
    quickFacts: [
      'Specialize in JDA and RIICO clearances.',
      'Handles fire, environment and utility NOCs.',
      'Land-use conversion and map approvals.',
      'Completion and occupancy certificates.',
    ],
    worksOn: [
      'Building plan sanction', 'JDA liaison', 'RIICO clearances', 'Fire & environment NOC',
      'Land-use conversion', 'Map approval', 'Completion certificate', 'Utility connections',
    ],
    qualifications: [
      { icon: 'Landmark', title: 'JDA Empanelled', desc: 'Registered liaison agent with the JDA.', bg: 'bg-emerald-500' },
      { icon: 'BadgeCheck', title: 'RIICO Panel', desc: 'Empanelled for RIICO industrial clearances.', bg: 'bg-amber-500' },
      { icon: 'FileCheck', title: 'NOC Specialist', desc: 'Fire, environment and water NOC handling.', bg: 'bg-brand' },
      { icon: 'Award', title: '500+ Sanctions', desc: 'Plans cleared across Jaipur since 2009.', bg: 'bg-red-600' },
    ],
    projects: [
      { year: '2025', title: 'Sitapura Factory Sanction', meta: 'Sitapura • RIICO', desc: 'Secured building-plan sanction and fire NOC for a 2-acre manufacturing unit.', img: img('1581094794329-c8112a89af12', 1000) },
      { year: '2024', title: 'Jagatpura Group Housing', meta: 'Jagatpura • JDA', desc: 'Cleared map approval and environment NOC for a 90-unit housing project.', img: img('1486406146926-c627a92ad1ab', 1000) },
      { year: '2024', title: 'Agri-to-Residential Conversion', meta: 'Bagru • Land Use', desc: 'Completed land-use conversion for a 4-acre residential layout.', img: img('1500382017468-9049fed747ef', 1000) },
      { year: '2023', title: 'C-Scheme Occupancy', meta: 'C-Scheme • Completion', desc: 'Obtained completion and occupancy certificates for a commercial tower.', img: img('1497366216548-37526070297c', 1000) },
    ],
  },

  Finance: {
    photo: 'https://i.pravatar.cc/600?img=68',
    location: 'Bani Park',
    experience: '11 years exp',
    languages: 'Hindi / English',
    intro:
      'Home-loan advisor matching buyers and builders to the right lender — best rates, clean documentation, and fast sanctions on home and construction finance.',
    stats: [
      { value: '₹450 Cr+', label: 'Loans Facilitated' },
      { value: '11 yrs', label: 'Experience' },
      { value: '30+', label: 'Lender Tie-ups' },
      { value: '92%', label: 'Sanction Rate' },
    ],
    about: [
      'Eleven years across leading banks and NBFCs means knowing which lender says yes to which profile — salaried, self-employed, or NRI — and at what rate.',
      'The service is end-to-end: eligibility assessment, document prep, application, and follow-up through disbursement, including PMAY subsidy where eligible.',
    ],
    quickFacts: [
      'Specialize in home and construction loans.',
      'Access to 30+ banks and NBFCs.',
      'PMAY subsidy and balance-transfer advisory.',
      'NRI and self-employed loan structuring.',
    ],
    worksOn: [
      'Home loans', 'Construction loans', 'Balance transfer', 'Loan eligibility',
      'Documentation', 'PMAY subsidy', 'Credit advisory', 'NRI loans',
    ],
    qualifications: [
      { icon: 'GraduationCap', title: 'MBA Finance', desc: 'Post-graduate in Finance & Banking.', bg: 'bg-emerald-500' },
      { icon: 'BadgeCheck', title: 'AMFI / IRDAI', desc: 'Certified financial products advisor.', bg: 'bg-amber-500' },
      { icon: 'Banknote', title: '30+ Lenders', desc: 'Direct tie-ups with banks and NBFCs.', bg: 'bg-brand' },
      { icon: 'Award', title: '₹450 Cr+', desc: 'Cumulative loans facilitated to date.', bg: 'bg-red-600' },
    ],
    projects: [
      { year: '2025', title: 'Self-Employed Villa Loan', meta: 'Jagatpura • Home Loan', desc: 'Structured a ₹1.4 Cr loan for a self-employed buyer at a market-best rate.', img: img('1564013799919-ab600027ffc6', 1000) },
      { year: '2024', title: 'Construction Finance', meta: 'Mansarovar • Build Loan', desc: 'Staged construction-linked disbursement for a ground-up home build.', img: img('1568605114967-8130f3a36994', 1000) },
      { year: '2024', title: 'PMAY Subsidy Case', meta: 'Bagru • Subsidy', desc: 'Secured a CLSS subsidy that cut the borrower’s effective rate sharply.', img: img('1586023492125-27b2c045efd7', 1000) },
      { year: '2023', title: 'NRI Apartment Loan', meta: 'C-Scheme • NRI Loan', desc: 'Arranged repatriable home finance for an overseas investor.', img: img('1502672260266-1c1ef2d93688', 1000) },
    ],
  },

  Vastu: {
    photo: 'https://i.pravatar.cc/600?img=60',
    location: 'Raja Park',
    experience: '20 years exp',
    languages: 'Hindi / Sanskrit / English',
    intro:
      'Vastu consultant aligning homes, factories and commercial spaces with directional energy — practical remedies that work alongside modern floor plans.',
    stats: [
      { value: '1,000+', label: 'Consults' },
      { value: '20 yrs', label: 'Experience' },
      { value: '15', label: 'Cities' },
      { value: '4.9★', label: 'Client Rating' },
    ],
    about: [
      'Two decades of Vastu practice grounded in classical texts but applied pragmatically — remedies that respect the architecture instead of demanding demolition.',
      'Works hand-in-hand with architects and interior designers so directional alignment is built in from the layout stage rather than patched in later.',
    ],
    quickFacts: [
      'Specialize in residential and commercial Vastu.',
      'Plot selection and entrance-direction guidance.',
      'Non-destructive remedies and energy balancing.',
      'Collaborates directly with architects.',
    ],
    worksOn: [
      'Residential Vastu', 'Commercial Vastu', 'Plot selection', 'Entrance direction',
      'Energy balancing', 'Vastu remedies', 'Factory Vastu', 'Renovation Vastu',
    ],
    qualifications: [
      { icon: 'Compass', title: 'Vastu Acharya', desc: 'Formal training in classical Vastu Shastra.', bg: 'bg-emerald-500' },
      { icon: 'BadgeCheck', title: '20 yrs Practice', desc: 'Two decades of consulting experience.', bg: 'bg-amber-500' },
      { icon: 'BookOpen', title: 'Author', desc: 'Published guides on applied Vastu.', bg: 'bg-brand' },
      { icon: 'Award', title: '1,000+ Consults', desc: 'Homes and businesses across India.', bg: 'bg-red-600' },
    ],
    projects: [
      { year: '2025', title: 'Mansarovar Home Audit', meta: 'Mansarovar • Residential', desc: 'Re-planned entrance and kitchen orientation without structural changes.', img: img('1568605114967-8130f3a36994', 1000) },
      { year: '2024', title: 'Sitapura Factory Layout', meta: 'Sitapura • Industrial', desc: 'Directional layout of production and storage zones for a new unit.', img: img('1581094794329-c8112a89af12', 1000) },
      { year: '2024', title: 'C-Scheme Office Vastu', meta: 'C-Scheme • Commercial', desc: 'Seating and cabin alignment for a corporate office floor.', img: img('1486406146926-c627a92ad1ab', 1000) },
      { year: '2023', title: 'Plot Selection Advisory', meta: 'Jagatpura • Pre-purchase', desc: 'Evaluated three plots and shortlisted the most auspicious for a family build.', img: img('1500382017468-9049fed747ef', 1000) },
    ],
  },

  Solar: {
    photo: 'https://i.pravatar.cc/600?img=64',
    location: 'Vaishali Nagar',
    experience: '9 years exp',
    languages: 'Hindi / English',
    intro:
      'Solar installer designing rooftop systems that pay for themselves — clean sizing, net-metering setup, and subsidy paperwork handled for homes and businesses.',
    stats: [
      { value: '3 MW+', label: 'Installed' },
      { value: '9 yrs', label: 'Experience' },
      { value: '700+', label: 'Rooftops' },
      { value: '25 yr', label: 'Panel Warranty' },
    ],
    about: [
      'Nine years and several megawatts of rooftop solar across Jaipur — systems sized to actual consumption, not oversold, with realistic payback projections up front.',
      'Handles the full journey: site survey, system design, installation, net-metering with the discom, and the state and central subsidy paperwork.',
    ],
    quickFacts: [
      'Specialize in rooftop on-grid solar.',
      'Net-metering and discom liaison.',
      'State and central subsidy assistance.',
      'Annual maintenance and monitoring.',
    ],
    worksOn: [
      'Rooftop solar', 'On-grid systems', 'Off-grid systems', 'Net metering',
      'Inverters & batteries', 'Solar water heaters', 'System maintenance', 'Subsidy assistance',
    ],
    qualifications: [
      { icon: 'GraduationCap', title: 'B.Tech EEE', desc: 'Electrical & Electronics Engineering.', bg: 'bg-emerald-500' },
      { icon: 'BadgeCheck', title: 'MNRE Channel Partner', desc: 'Approved renewable-energy installer.', bg: 'bg-amber-500' },
      { icon: 'Sun', title: '3 MW+ Installed', desc: 'Cumulative rooftop capacity commissioned.', bg: 'bg-brand' },
      { icon: 'Leaf', title: 'Green Certified', desc: 'Clean-energy compliance and safety certified.', bg: 'bg-red-600' },
    ],
    projects: [
      { year: '2025', title: 'Vaishali Rooftop 10kW', meta: 'Vaishali Nagar • Residential', desc: 'A 10kW on-grid system with net metering, ~70% bill reduction.', img: img('1518780664697-55e3ad937233', 1000) },
      { year: '2024', title: 'Sitapura Factory 250kW', meta: 'Sitapura • Industrial', desc: 'Large rooftop array for a manufacturing unit with load monitoring.', img: img('1581094794329-c8112a89af12', 1000) },
      { year: '2024', title: 'Society Solar Common Area', meta: 'Mansarovar • Residential', desc: 'Common-area solar for a housing society’s lifts and lighting.', img: img('1564013799919-ab600027ffc6', 1000) },
      { year: '2023', title: 'Farmhouse Off-grid', meta: 'Bagru • Off-grid', desc: 'Battery-backed off-grid system for a farmhouse beyond the grid.', img: img('1416879595882-3373a0480b5b', 1000) },
    ],
  },
}

// Default profile content when a category has no dedicated block.
export const expertProfileFallback = expertContentByCat.Architecture

export const expertDomains = ['Architecture', 'Legal', 'Engineering', 'Construction']
export const expertExperience = ['Any', '5+ Years', '10+ Years', '15+ Years']
export const expertLocations = ['C-Scheme', 'Malviya Nagar', 'Mansarovar']

// ---- Develop / Build Property page ----
export const developHeroImg = img('1571003123894-1f0594d2b5d9', 1600)

export const developFeatures = [
  {
    icon: 'Map',
    title: 'Guided step-by-step',
    desc: 'A crystal-clear roadmap from the first soil test to the final key handover. No guesswork, just progress.',
    bg: 'bg-indigo-500',
  },
  {
    icon: 'ShieldCheck',
    title: 'Verified experts',
    desc: 'Every architect, engineer, and contractor is vetted for quality, legal standing, and past performance.',
    bg: 'bg-emerald-500',
  },
  {
    icon: 'Sparkles',
    title: 'One team',
    desc: 'A unified dashboard where all your stakeholders collaborate. One vision, one point of truth.',
    bg: 'bg-amber-500',
  },
]

export const developSteps = [
  {
    n: 1,
    title: 'Land & Legal',
    desc: 'Securing the foundation. We verify land titles, conduct topographical surveys, and handle government liaisons.',
    ring: 'bg-emerald-500',
    img: img('1500382017468-9049fed747ef', 1000),
    faqs: [
      {
        q: 'What happens in this step',
        a: 'We run a full title search, check encumbrances and ownership history, conduct a topographical and boundary survey, and confirm the land is legally clear to build on.',
      },
      { q: 'Who is involved', a: 'Title lawyers, licensed surveyors, and our government liaison team.' },
      { q: 'How long does it take', a: 'Typically 2–4 weeks, depending on record availability.' },
      { q: 'What do I receive at the end', a: 'A verified title report, survey map, and a clear-to-proceed certificate.' },
    ],
  },
  {
    n: 2,
    title: 'Design & Planning',
    desc: "Visualizing perfection. Our architects and structural engineers work to blend Jaipur's heritage with modern luxury.",
    ring: 'bg-red-600',
    img: img('1497366811353-6870744d04b2', 1000),
    faqs: [
      {
        q: 'What happens in this step',
        a: 'Architects translate your brief into concept designs, floor plans, 3D renders, and structural drawings ready for sanction.',
      },
      { q: 'Who is involved', a: 'Architects, structural engineers, and interior planners.' },
      { q: 'How long does it take', a: '4–8 weeks across concept, revisions, and final drawings.' },
      { q: 'What do I receive at the end', a: 'Approved architectural drawings, 3D visualizations, and a structural plan.' },
    ],
  },
  {
    n: 3,
    title: 'Approvals & Permits',
    desc: 'Navigating bureaucracy with ease. We secure all municipal clearances, utility connections, and environment permits.',
    ring: 'bg-brand',
    img: img('1451187580459-43490279c0fa', 1000),
    faqs: [
      {
        q: 'What happens in this step',
        a: 'This is where your design becomes legally allowed to be built. We compile your full submission package — site plans, structural drawings, ownership documents — and file it with the relevant authority (JDA for most of Jaipur, RIICO for industrial plots). Alongside the building plan sanction, we secure the NOCs you need: fire, environment, water, and electricity, depending on the project. Our liaison team follows up with the authorities, answers their queries, and pushes the file through. By the end of this step, you have an approved plan and clear permission to break ground.',
      },
      { q: 'Who is involved', a: 'Our liaison team, JDA/RIICO officials, and the relevant NOC departments.' },
      { q: 'How long does it take', a: '6–12 weeks, depending on authority workload and project type.' },
      { q: 'What do I receive at the end', a: 'A sanctioned building plan and all required NOCs.' },
    ],
  },
  {
    n: 4,
    title: 'Construction',
    desc: 'The transformation begins. Civil contractors and project managers ensure quality control and timeline adherence at every stage.',
    ring: 'bg-amber-500',
    img: img('1581094794329-c8112a89af12', 1000),
    faqs: [
      {
        q: 'What happens in this step',
        a: 'Foundation, structure, and finishing work are executed in phases with on-site supervision, material quality checks, and milestone tracking.',
      },
      { q: 'Who is involved', a: 'Civil contractors, site engineers, and your dedicated project manager.' },
      { q: 'How long does it take', a: '6–18 months based on size and specification.' },
      { q: 'What do I receive at the end', a: 'A completed structure built to approved drawings and quality standards.' },
    ],
  },
  {
    n: 5,
    title: 'Utilities & Systems',
    desc: 'Powering your future. Integration of smart electrical grids, premium plumbing, and sustainable solar solutions.',
    ring: 'bg-emerald-500',
    img: img('1518780664697-55e3ad937233', 1000),
    faqs: [
      {
        q: 'What happens in this step',
        a: 'Electrical wiring, plumbing, water systems, and optional solar and smart-home integrations are installed and tested.',
      },
      { q: 'Who is involved', a: 'MEP engineers, electricians, plumbers, and solar specialists.' },
      { q: 'How long does it take', a: '3–6 weeks, often overlapping with finishing.' },
      { q: 'What do I receive at the end', a: 'Fully functional, tested utility systems with compliance certificates.' },
    ],
  },
  {
    n: 6,
    title: 'Finishing & Handover',
    desc: 'The final flourish. Interior designers and Vastu consultants ensure your space is harmonious, beautiful, and ready for you.',
    ring: 'bg-brand',
    img: img('1586023492125-27b2c045efd7', 1000),
    faqs: [
      {
        q: 'What happens in this step',
        a: 'Interior finishes, fittings, painting, and Vastu alignment are completed, followed by a final snag check and handover.',
      },
      { q: 'Who is involved', a: 'Interior designers, Vastu consultants, and the handover team.' },
      { q: 'How long does it take', a: '4–8 weeks for finishing and final inspection.' },
      { q: 'What do I receive at the end', a: 'Keys, a completion certificate, warranties, and your finished home.' },
    ],
  },
]

export const reliability = [
  {
    icon: 'BadgeCheck',
    title: 'All experts verified',
    desc: 'Background checks, past projects, and performance audits for every single partner on our platform.',
    bg: 'bg-amber-500',
  },
  {
    icon: 'UserCheck',
    title: 'One point of contact',
    desc: "A dedicated Project Success Manager who coordinates all stakeholders so you don't have to.",
    bg: 'bg-brand',
  },
  {
    icon: 'Eye',
    title: 'Absolute Transparency',
    desc: 'Live budget tracking and construction updates via your dashboard. No hidden costs, ever.',
    bg: 'bg-red-600',
  },
]

// ---- Saved properties page ----
export const savedProperties = [
  {
    id: 1,
    tag: 'INDUSTRIAL',
    title: 'Industrial Land',
    loc: 'Sitapura — 4.5 acres',
    img: img('1564013799919-ab600027ffc6'),
  },
]

// ---- Services page ----
export const serviceSteps = [
  { icon: 'ClipboardList', title: '1. Request a service', desc: 'Tell us what you need', bg: 'bg-emerald-500' },
  { icon: 'Handshake', title: '2. Match partner', desc: 'Top-rated pros selected', bg: 'bg-amber-500' },
  { icon: 'MessageSquare', title: '3. Direct contact', desc: 'Seamless communication', bg: 'bg-red-600' },
]

export const services = [
  {
    icon: 'Scale',
    title: 'Legal',
    desc: 'Expert property law & documentation.',
    tagline: 'Title checks, registration & agreements',
    need: 'I need help with property title verification and registration.',
    partners: 14,
    bg: 'bg-amber-500',
  },
  {
    icon: 'Ruler',
    title: 'Surveyor',
    desc: 'Accurate land & property measurement.',
    tagline: 'Land measurement & boundary surveys',
    need: 'I need a site survey and boundary verification for my plot.',
    partners: 14,
    bg: 'bg-emerald-500',
  },
  {
    icon: 'PencilRuler',
    title: 'Architect',
    desc: 'Award-winning designs for Jaipur homes.',
    tagline: 'Design, layout & structural plans',
    need: 'I need design and layout plans for my home.',
    partners: 14,
    bg: 'bg-red-600',
  },
  {
    icon: 'Wrench',
    title: 'Contractor',
    desc: 'Reliable construction & civil work.',
    tagline: 'Construction, civil work & execution',
    need: 'I need a contractor for construction and civil work.',
    partners: 14,
    bg: 'bg-brand',
  },
  {
    icon: 'Landmark',
    title: 'Govt Liaison',
    desc: 'Smooth approvals & license handling.',
    tagline: 'Approvals, permits & NOC handling',
    need: 'I need help with approvals, permits and NOC documentation.',
    partners: 14,
    bg: 'bg-emerald-500',
  },
  {
    icon: 'Home',
    title: 'Building Material',
    desc: 'Wholesale rates for premium supplies.',
    tagline: 'Cement, steel, fittings & supplies',
    need: 'I need a quote for building materials and supplies.',
    partners: 14,
    bg: 'bg-red-600',
  },
  {
    icon: 'Sun',
    title: 'Solar',
    desc: 'Clean energy for sustainable living.',
    tagline: 'Panels, inverters & clean energy setup',
    need: 'I want to install a rooftop solar setup for my home.',
    partners: 14,
    bg: 'bg-brand',
  },
  {
    icon: 'Lightbulb',
    title: 'Consultant',
    desc: 'Vastu & project management expertise.',
    tagline: 'Vastu & end-to-end project management',
    need: 'I need Vastu consultation and project management support.',
    partners: 14,
    bg: 'bg-amber-500',
  },
]
