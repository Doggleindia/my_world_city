// Centralized content + image references for the landing page.
const img = (id, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

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
    title: "UrbanNest's Smart Home Integration Streamlines Living Experience for New Homeowners",
    desc: 'Integration services that allow new homeowners to control appliances, lighting, and security systems.',
    img: img('1558002038-1055907df827'),
  },
  {
    title: "GreenHaven's Sustainable Housing Development Redefines Eco-Friendly Living",
    desc: 'Sustainable housing, focusing on energy efficient designs and materials that minimise environmental impact.',
    img: img('1518780664697-55e3ad937233'),
  },
  {
    title: "SecureSpace's Advanced Security Solutions Enhance Property Safety for Real Estate Investors",
    desc: 'Security solutions provide real estate investors with peace of mind through surveillance and monitoring technologies.',
    img: img('1496307653780-42ee777d4833'),
  },
  {
    title: 'PropTech Innovations Digitize Real Estate Transactions for a Seamless Buying Experience',
    desc: 'Real estate transactions by utilizing blockchain technology, ensuring transparency and safety for buyers and sellers.',
    img: img('1451187580459-43490279c0fa'),
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
  { slug: 'neha-sharma', initials: 'AS', cat: 'Architecture', tag: 'ARCHITECTURE', name: 'Ar. Neha Sharma', role: 'Senior Architect', specialty: 'Residential & commercial design' },
  { slug: 'rajesh-mehta', initials: 'RM', cat: 'Legal', tag: 'LEGAL', name: 'Adv. Rajesh Mehta', role: 'Legal Advisor', specialty: 'Title verification & registration' },
  { slug: 'vikram-singh', initials: 'VS', cat: 'Engineering', tag: 'ENGINEERING', name: 'Er. Vikram Singh', role: 'Structural Engineer', specialty: 'RCC & structural design' },
  { slug: 'suresh-kumar', initials: 'SK', cat: 'Construction', tag: 'CONSTRUCTION', name: 'Suresh Kumar', role: 'Civil Contractor', specialty: 'Turnkey home construction' },
  { slug: 'priya-agarwal', initials: 'PA', cat: 'Interior', tag: 'INTERIOR', name: 'Priya Agarwal', role: 'Interior Designer', specialty: 'Luxury residential interiors' },
  { slug: 'mahesh-joshi', initials: 'MJ', cat: 'Approvals', tag: 'APPROVALS', name: 'Mahesh Joshi', role: 'Govt Liaison', specialty: 'JDA / RIICO clearances' },
  { slug: 'anil-gupta', initials: 'AG', cat: 'Finance', tag: 'FINANCE', name: 'Anil Gupta', role: 'Home Loan Advisor', specialty: 'Construction & home loans' },
  { slug: 'pandit-ramesh', initials: 'PR', cat: 'Vastu', tag: 'VASTU', name: 'Pandit Ramesh', role: 'Vastu Consultant', specialty: 'Residential & commercial Vastu' },
  { slug: 'deepak-verma', initials: 'DV', cat: 'Solar', tag: 'ENERGY', name: 'Deepak Verma', role: 'Solar Installer', specialty: 'Rooftop solar systems' },
]

export const expertProfile = {
  slug: 'neha-sharma',
  firstName: 'Neha',
  name: 'Ar. Neha Sharma',
  role: 'Senior Architect',
  cat: 'Architecture',
  tag: 'ARCHITECTURE',
  initials: 'NS',
  specialty: 'Residential & commercial design',
  photo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80',
  location: 'Vaishali Nagar',
  experience: '12 years exp',
  languages: 'Hindi / English',
  intro:
    'Specializing in contemporary residential landmarks and large-scale commercial infrastructures, Neha blends traditional Rajasthani structural wisdom with modern geometric precision.',
  stats: [
    { value: '80+', label: 'Projects' },
    { value: '12 yrs', label: 'Experience' },
    { value: '12', label: 'Cities' },
    { value: '100%', label: 'Delivery Rate' },
  ],
  about: [
    "Ar. Neha Sharma's journey in architecture is deeply rooted in the Pink City's unique blend of heritage and ambition. After graduating from the prestigious SPA, she dedicated over 12 years to perfecting the art of 'Vernacular Modernism' — a style that respects Jaipur's climate and history while meeting the demands of global citizens.",
    'Her approach is holistic, managing projects from the first sketch to the final brick. She believes that a building should not only be a functional space but a legacy piece that grows in value and character over time.',
  ],
  quickFacts: [
    'Specialize in luxury residential and boutique retail interiors.',
    'Expert in Vastu-Shastra integration with modern floor plans.',
    "Recipient of the 'Rajasthan Architect Excellence' Award 2023.",
    'Active consultant for smart-city infrastructure projects.',
  ],
  worksOn: [
    'Residential villas',
    'Vastu-aligned design',
    'Heritage restoration',
    'Boutique retail',
    'Commercial skyscrapers',
    'Sustainable landscaping',
    'Turnkey execution',
    'Smart home integration',
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
}

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
