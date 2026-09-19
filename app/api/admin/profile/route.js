import { z } from 'zod'
import { dbConnect } from '@/lib/db'
import User from '@/lib/models/User'
import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { handler, parseBody, ok, requireRole, ApiError } from '@/lib/api'

// The name shown across the console. Letters, spaces and the usual name
// punctuation only — it is rendered in the header of every admin page.
const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Enter your full name')
    .max(60, 'Keep it under 60 characters')
    .regex(/^[\p{L}\p{M} .'’-]+$/u, 'Letters and spaces only'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password').max(200),
  newPassword: z.string().min(8, 'Use at least 8 characters').max(200),
})

// PATCH /api/admin/profile { name }
// Lets the signed-in admin set their own display name.
export const PATCH = handler(async (req) => {
  const session = await requireRole('admin')
  const { name } = await parseBody(req, schema)

  await dbConnect()
  const user = await User.findByIdAndUpdate(session.uid, { $set: { name } }, { new: true }).lean()
  if (!user) throw new ApiError('Account not found', 404)

  return ok({ user: { id: String(user._id), email: user.email, name: user.name, roles: user.roles } })
})

// PUT /api/admin/profile { currentPassword, newPassword }
// Changes the console password while signed in. The current password is
// required so a walked-away-from session can't be used to lock the owner out.
export const PUT = handler(async (req) => {
  const session = await requireRole('admin')
  const { currentPassword, newPassword } = await parseBody(req, passwordSchema)

  await dbConnect()
  const user = await User.findById(session.uid)
  if (!user) throw new ApiError('Account not found', 404)
  if (!verifyPassword(currentPassword, user.passwordHash)) throw new ApiError('Current password is incorrect', 401)
  if (currentPassword === newPassword) throw new ApiError('Choose a password you haven’t used before', 422)

  user.passwordHash = hashPassword(newPassword)
  user.mustChangePassword = false
  await user.save()
  return ok({ changed: true })
})
