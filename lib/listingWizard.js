// Shared vocabulary for the "List your property" wizard, used by both the form
// and the API so the two can never drift apart.

export const PROFESSIONS = [
  { key: 'developer', label: 'Developer', icon: '🏗️' },
  { key: 'agent', label: 'Agent / Broker', icon: '🤝' },
  { key: 'owner', label: 'Property Owner', icon: '🏠' },
]

// Each wizard property type maps onto the category the rest of the site filters
// by, plus whether it is a sale or a rental listing.
export const PROPERTY_TYPES = [
  { key: 'apartment', label: 'Apartment', icon: 'Building2', category: 'Residential', listingType: 'buy' },
  { key: 'villa', label: 'Villa / House', icon: 'Home', category: 'Residential', listingType: 'buy' },
  { key: 'commercial', label: 'Commercial', icon: 'Building', category: 'Commercial', listingType: 'buy' },
  { key: 'plot', label: 'Plot / Land', icon: 'Mountain', category: 'Farm & Agri', listingType: 'buy' },
  { key: 'rental', label: 'Rental', icon: 'DoorOpen', category: 'Residential', listingType: 'rent' },
  { key: 'other', label: 'Other', icon: 'CircleEllipsis', category: 'Residential', listingType: 'buy' },
]

export const CONFIGURATIONS = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK']

export const POSSESSION = [
  { key: 'ready', label: 'Ready to move' },
  { key: 'under_construction', label: 'Under construction' },
  { key: 'new_launch', label: 'New launch' },
]

// Fixed photo slots so every listing is labelled the same way and buyers can
// compare like with like.
export const PHOTO_SLOTS = [
  { key: 'outside', label: 'Outside view' },
  { key: 'doorstep', label: 'Doorstep view' },
  { key: 'hall', label: 'Hall' },
  { key: 'room1', label: 'Room 1' },
  { key: 'room2', label: 'Room 2' },
  { key: 'rooftop', label: 'Rooftop' },
  { key: 'bathroom', label: 'Bathroom' },
  { key: 'kitchen', label: 'Kitchen' },
]

export const NEARBY_TYPES = [
  { key: 'school', label: '🏫 School' },
  { key: 'hospital', label: '🏥 Hospital' },
  { key: 'train', label: '🚉 Train station' },
  { key: 'metro', label: '🚇 Metro' },
  { key: 'airport', label: '✈️ Airport' },
  { key: 'mall', label: '🛍️ Mall / Market' },
  { key: 'highway', label: '🛣️ Highway' },
  { key: 'park', label: '🌳 Park' },
  { key: 'office', label: '🏢 Business hub' },
  { key: 'other', label: '📍 Other' },
]

export const LEAD_SOURCES = [
  'Meta Ads',
  'Google Ads',
  'WhatsApp Marketing',
  'Email Marketing',
  'Offline / Print',
  'Property Portals',
]

export const LEADS_MIN = 20
export const LEADS_MAX = 500

export function typeMeta(key) {
  return PROPERTY_TYPES.find((t) => t.key === key) || PROPERTY_TYPES[0]
}
