import { z } from 'zod'

const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')

// The login identity. Lower-cased so "Rahul@X.com" and "rahul@x.com" are one account.
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Enter a valid email address')
  .max(160)

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password').max(200),
})

// --- OTP sign-in / sign-up (the code is emailed) ---
export const otpSendSchema = z.object({
  email: emailSchema,
  // Only sent on the sign-up path; applied to the account once the code is verified.
  name: z.string().trim().min(2, 'Enter your full name').max(80).optional(),
  phone: phoneSchema.optional().or(z.literal('')),
})

export const otpVerifySchema = z.object({
  email: emailSchema,
  code: z.string().trim().regex(/^[0-9]{6}$/, 'Enter the 6-digit code'),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(6, 'Use at least 6 characters').max(200),
})

export const leadSchema = z.object({
  type: z.enum(['enquiry', 'visit', 'callback', 'service', 'expert']),
  propertyId: z.string().trim().max(64).optional(),
  expertId: z.string().trim().max(64).optional(),
  serviceKey: z.string().trim().max(64).optional(),
  name: z.string().trim().min(1, 'Name is required').max(80),
  phone: phoneSchema,
  email: z.string().trim().email().optional().or(z.literal('')),
  budget: z.string().trim().max(60).optional(),
  message: z.string().trim().max(1000).optional(),
  visitDate: z.string().trim().max(40).optional(),
  timeSlot: z.string().trim().max(40).optional(),
  preferredTime: z.string().trim().max(40).optional(),
  preferredDay: z.string().trim().max(40).optional(),
})

const gallerySchema = z.object({
  main: z.string().url(),
  thumbs: z.array(z.string().url()).max(20).default([]),
})

const locationSchema = z.object({
  locality: z.string().trim().min(1).max(120),
  city: z.string().trim().max(80).default('Jaipur'),
  lat: z.number().optional(),
  lng: z.number().optional(),
})

const badgesSchema = z.array(z.string().trim().max(40)).max(12)
const amenitiesSchema = z.array(
  z.object({ icon: z.string().trim().max(40), label: z.string().trim().max(60) }),
).max(40)

// Base listing shape — extended by listingSubmitSchema below (not exported).
const propertyCreateSchema = z.object({
  title: z.string().trim().min(3).max(120),
  category: z.enum(['Residential', 'Commercial', 'Industrial', 'Farm & Agri']),
  listingType: z.enum(['buy', 'rent']).default('buy'),
  price: z.number().nonnegative().max(1e12).optional(),
  priceLabel: z.string().trim().max(60).optional(),
  area: z.string().trim().max(60).optional(),
  location: locationSchema,
  badges: badgesSchema.default([]),
  amenities: amenitiesSchema.default([]),
  gallery: gallerySchema,
  description: z.string().trim().max(4000).optional(),
})

// Public listing submission — the property fields plus the owner's contact
// details (required only for guests; logged-in owners are taken from the session).
// Extra detail captured by the 7-step "List your property" wizard. All optional
// so older/simpler submissions still validate.
const nearbySchema = z
  .array(
    z.object({
      type: z.string().trim().max(30),
      name: z.string().trim().max(120),
      distanceKm: z.number().nonnegative().max(500).optional(),
    }),
  )
  .max(20)
  .default([])

const photoSchema = z
  .array(z.object({ slot: z.string().trim().max(30), label: z.string().trim().max(40), url: z.string().url() }))
  .max(20)
  .default([])

export const listingSubmitSchema = propertyCreateSchema.extend({
  name: z.string().trim().min(1).max(80).optional(),
  phone: phoneSchema.optional(),
  email: z.string().trim().email().max(120).optional().or(z.literal('')),
  // Step 1 — who is listing
  profession: z.enum(['developer', 'agent', 'owner']).optional(),
  // Step 2 — property basics
  propertyType: z.string().trim().max(30).optional(),
  configuration: z.array(z.string().trim().max(12)).max(6).default([]),
  bathrooms: z.coerce.number().int().min(0).max(20).optional(),
  possession: z.string().trim().max(40).optional(),
  possessionDate: z.string().trim().max(40).optional(),
  negotiable: z.coerce.boolean().optional(),
  // Step 3 — address
  address: z.string().trim().max(200).optional(),
  landmark: z.string().trim().max(120).optional(),
  pincode: z.string().trim().regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit pincode').optional().or(z.literal('')),
  state: z.string().trim().max(60).optional(),
  country: z.string().trim().max(60).optional(),
  // Step 4 — labelled photos
  photos: photoSchema,
  // Step 5 — nearby landmarks
  nearby: nearbySchema,
  // Step 6 — lead goals
  leadGoal: z.coerce.number().int().min(0).max(5000).optional(),
  leadSources: z.array(z.string().trim().max(40)).max(10).default([]),
})


// Owner edits: same value constraints as create, but every field optional and
// no privileged fields (status/verified/featured/ownerId) — those are admin-only.
export const propertyUpdateSchema = z
  .object({
    title: z.string().trim().min(3).max(120),
    price: z.number().nonnegative().max(1e12),
    priceLabel: z.string().trim().max(60),
    area: z.string().trim().max(60),
    badges: badgesSchema,
    amenities: amenitiesSchema,
    gallery: gallerySchema,
    description: z.string().trim().max(4000),
    location: locationSchema,
  })
  .partial()

export const propertyQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  listingType: z.string().optional(),
  locality: z.string().optional(),
  // '1'..'3' match exactly; a trailing '+' (e.g. '4+') means that many or more.
  bedrooms: z.string().regex(/^\d\+?$/).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  verified: z.coerce.boolean().optional(),
  rera: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
  sort: z.enum(['recent', 'price_asc', 'price_desc', 'popular']).default('recent'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(48).default(12),
})
