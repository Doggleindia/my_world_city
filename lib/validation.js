import { z } from 'zod'

const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, 'Enter your password').max(200),
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
export const listingSubmitSchema = propertyCreateSchema.extend({
  name: z.string().trim().min(1).max(80).optional(),
  phone: phoneSchema.optional(),
  email: z.string().trim().email().max(120).optional().or(z.literal('')),
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
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  verified: z.coerce.boolean().optional(),
  rera: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
  sort: z.enum(['recent', 'price_asc', 'price_desc', 'popular']).default('recent'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(48).default(12),
})
