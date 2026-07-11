// Sample verified partners across service categories. Seeded on demand so the
// routing workspace has real, rankable data in dev.
export const samplePartners = [
  // --- Legal ---
  { name: 'Kaushik Legal Associates', category: 'legal', specialty: 'Property Law', experience: 18, locality: 'Jagatpura', adjacentLocalities: ['Malviya Nagar'], teamSize: 5, rating: 4.9, cases: 128, avgResponseHours: 2, availability: 'now' },
  { name: 'Sharma & Associates', category: 'legal', specialty: 'Real Estate Law', experience: 12, locality: 'Malviya Nagar', adjacentLocalities: ['Jagatpura', 'C-Scheme'], teamSize: 3, rating: 4.7, cases: 84, avgResponseHours: 3, availability: 'hours' },
  { name: 'Verma Legal Services', category: 'legal', specialty: 'Property + Corporate Law', experience: 8, locality: 'C-Scheme', adjacentLocalities: [], teamSize: 2, rating: 4.6, cases: 62, avgResponseHours: 6, availability: 'tomorrow' },
  { name: 'Rathore Law Chambers', category: 'legal', specialty: 'Title & Registration', experience: 15, locality: 'Vaishali Nagar', adjacentLocalities: ['Mansarovar'], teamSize: 4, rating: 4.5, cases: 71, avgResponseHours: 4, availability: 'now' },

  // --- Architect ---
  { name: 'Studio Ar. Mehta', category: 'architect', specialty: 'Residential Design', experience: 14, locality: 'Mansarovar', adjacentLocalities: ['Vaishali Nagar'], teamSize: 6, rating: 4.8, cases: 96, avgResponseHours: 3, availability: 'now' },
  { name: 'Ananya Design Collective', category: 'architect', specialty: 'Modern Villas', experience: 9, locality: 'Jagatpura', adjacentLocalities: ['Malviya Nagar'], teamSize: 4, rating: 4.6, cases: 54, avgResponseHours: 5, availability: 'hours' },

  // --- Interior ---
  { name: 'Kondapur Interiors', category: 'interior', specialty: 'Modular Kitchens', experience: 7, locality: 'Kondapur', adjacentLocalities: [], teamSize: 5, rating: 4.7, cases: 63, avgResponseHours: 4, availability: 'now' },
  { name: 'Nest & Co.', category: 'interior', specialty: 'Full Home Interiors', experience: 11, locality: 'C-Scheme', adjacentLocalities: ['Malviya Nagar'], teamSize: 8, rating: 4.5, cases: 88, avgResponseHours: 6, availability: 'tomorrow' },

  // --- Surveyor ---
  { name: 'Precision Land Surveyors', category: 'surveyor', specialty: 'Boundary & Plot Survey', experience: 16, locality: 'Sitapura', adjacentLocalities: ['Jagatpura'], teamSize: 3, rating: 4.6, cases: 74, avgResponseHours: 5, availability: 'hours' },

  // --- Contractor ---
  { name: 'BuildRight Constructions', category: 'contractor', specialty: 'Turnkey Construction', experience: 13, locality: 'Vaishali Nagar', adjacentLocalities: ['Mansarovar'], teamSize: 12, rating: 4.4, cases: 41, avgResponseHours: 8, availability: 'tomorrow' },

  // --- Vastu ---
  { name: 'Pandit Vastu Consultancy', category: 'vastu', specialty: 'Residential Vastu', experience: 20, locality: 'Banjara Hills', adjacentLocalities: [], teamSize: 1, rating: 4.8, cases: 132, avgResponseHours: 3, availability: 'now' },

  // --- Solar ---
  { name: 'SunGrid Energy', category: 'solar', specialty: 'Rooftop Solar', experience: 6, locality: 'Vaishali Nagar', adjacentLocalities: ['Mansarovar'], teamSize: 7, rating: 4.5, cases: 58, avgResponseHours: 5, availability: 'hours' },

  // --- Govt Liaison ---
  { name: 'RIICO Approvals Desk', category: 'govt_liaison', specialty: 'RIICO & JDA Liaison', experience: 17, locality: 'Sitapura', adjacentLocalities: ['Jagatpura'], teamSize: 4, rating: 4.3, cases: 39, avgResponseHours: 12, availability: 'tomorrow' },
]
