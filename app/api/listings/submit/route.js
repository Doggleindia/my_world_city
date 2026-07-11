import { dbConnect } from '@/lib/db'
import User from '@/lib/models/User'
import Property from '@/lib/models/Property'
import { listingSubmitSchema } from '@/lib/validation'
import { getSession, createSession } from '@/lib/auth/session'
import { hashPassword, generateTempPassword } from '@/lib/auth/password'
import { syncAdminRole } from '@/lib/auth/roles'
import { handler, parseBody, ok, ApiError } from '@/lib/api'
import { toPropertyCard } from '@/lib/serialize'

function slugify(s) {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 60) +
    '-' +
    Math.random().toString(36).slice(2, 7)
  )
}

async function createListing(ownerId, data) {
  const doc = await Property.create({
    title: data.title,
    category: data.category,
    listingType: data.listingType,
    price: data.price,
    priceLabel: data.priceLabel,
    area: data.area,
    location: data.location,
    badges: data.badges,
    amenities: data.amenities,
    gallery: data.gallery,
    description: data.description,
    ownerId,
    slug: slugify(data.title),
    photoCount: 1 + (data.gallery?.thumbs?.length || 0),
    status: 'pending',
  })
  return doc
}

// POST /api/listings/submit
//   Guests:      body includes { name, phone } — creates the owner account with a
//                temporary password (returned once), logs them in, files a pending listing.
//   Logged-in:   contact fields ignored — files another pending listing on their account.
// Every listing starts as `pending` and only goes live after admin approval.
export const POST = handler(async (req) => {
  const data = await parseBody(req, listingSubmitSchema)
  await dbConnect()

  const session = await getSession()

  // --- Logged-in owner: just add another pending listing. ---
  if (session) {
    const doc = await createListing(session.uid, data)
    return ok(
      { property: toPropertyCard(doc.toObject()), id: String(doc._id), status: 'pending' },
      { status: 201 },
    )
  }

  // --- Guest: name + phone are required to open an account. ---
  if (!data.name || !data.phone) {
    throw new ApiError('Your name and mobile number are required to list a property', 422)
  }

  let user = await User.findOne({ phone: data.phone })
  let tempPassword = null

  if (user && user.passwordHash) {
    // The number already has a real account — don't leak or reset it. Ask them to log in.
    throw new ApiError('This number is already registered. Please log in to add a listing.', 409, {
      existingAccount: true,
    })
  }

  tempPassword = generateTempPassword()
  const passwordHash = hashPassword(tempPassword)

  if (user) {
    // Pre-existing passwordless user (e.g. an old lead) — attach owner access.
    user.passwordHash = passwordHash
    user.mustChangePassword = true
    if (data.name && !user.name) user.name = data.name
    if (data.email && !user.email) user.email = data.email
    if (!user.roles.includes('owner')) user.roles.push('owner')
    await user.save()
  } else {
    user = await User.create({
      phone: data.phone,
      name: data.name,
      email: data.email || undefined,
      passwordHash,
      mustChangePassword: true,
      roles: ['owner'],
      verified: false,
    })
  }

  await syncAdminRole(user) // in case this phone is configured as an admin
  const doc = await createListing(user._id, data)
  await createSession(user) // auto-login so they land straight in their dashboard

  return ok(
    {
      property: toPropertyCard(doc.toObject()),
      id: String(doc._id),
      status: 'pending',
      // Shown once on the success screen. In production this would also be sent by SMS.
      tempPassword,
      phone: user.phone,
    },
    { status: 201 },
  )
})
