import { dbConnect } from '@/lib/db'
import User from '@/lib/models/User'
import { verifyPassword, hashPassword } from '@/lib/auth/password'
import { changePasswordSchema } from '@/lib/validation'
import { handler, parseBody, ok, requireUser, ApiError } from '@/lib/api'

// POST /api/auth/change-password { currentPassword, newPassword }
// Lets an owner replace their temporary password with one of their own.
export const POST = handler(async (req) => {
  const session = await requireUser()
  const { currentPassword, newPassword } = await parseBody(req, changePasswordSchema)

  await dbConnect()
  const user = await User.findById(session.uid)
  if (!user || !verifyPassword(currentPassword, user.passwordHash)) {
    throw new ApiError('Current password is incorrect', 401)
  }

  user.passwordHash = hashPassword(newPassword)
  user.mustChangePassword = false
  await user.save()

  return ok({ changed: true })
})
