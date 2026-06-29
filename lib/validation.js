import { z } from 'zod'

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')

export const otpSendSchema = z.object({
  phone: phoneSchema,
})

export const otpVerifySchema = z.object({
  phone: phoneSchema,
  code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code'),
  name: z.string().trim().min(1).max(80).optional(),
})

export const leadSchema = z.object({
  type: z.enum(['enquiry', 'visit', 'callback', 'service', 'expert']),
  propertyId: z.string().optional(),
  expertId: z.string().optional(),
  serviceKey: z.string().optional(),
  name: z.string().trim().min(1, 'Name is required').max(80),
  phone: phoneSchema,
  email: z.string().trim().email().optional().or(z.literal('')),
  message: z.string().trim().max(1000).optional(),
  visitDate: z.string().optional(),
  timeSlot: z.string().optional(),
  preferredTime: z.string().optional(),
  preferredDay: z.string().optional(),
})

const gallerySchema = z.object({
  main: z.string().url(),
  thumbs: z.array(z.string().url()).default([]),
})

export const propertyCreateSchema = z.object({
  title: z.string().trim().min(3).max(120),
  category: z.enum(['Residential', 'Commercial', 'Industrial', 'Farm & Agri']),
  listingType: z.enum(['buy', 'rent']).default('buy'),
  price: z.number().nonnegative().optional(),
  priceLabel: z.string().optional(),
  area: z.string().optional(),
  location: z.object({
    locality: z.string().trim().min(1),
    city: z.string().default('Jaipur'),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
  badges: z.array(z.string()).default([]),
  amenities: z.array(z.object({ icon: z.string(), label: z.string() })).default([]),
  gallery: gallerySchema,
  description: z.string().trim().max(4000).optional(),
})

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
