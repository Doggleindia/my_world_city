import { dbConnect } from '@/lib/db'
import User from '@/lib/models/User'
import { verifyPassword } from '@/lib/auth/password'
import { createSession } from '@/lib/auth/session'
import { syncAdminRole } from '@/lib/auth/roles'
import { loginSchema } from '@/lib/validation'
import { handler, parseBody, ok, ApiError } from '@/lib/api'
import { rateLimit } from '@/lib/rateLimit'

// POST /api/auth/login { phone, password }
export const POST = handler(async (req) => {
  const { phone, password } = await parseBody(req, loginSchema)

  const rl = rateLimit(`login:${phone}`, 8, 10 * 60 * 1000)
  if (!rl.ok) throw new ApiError('Too many attempts. Try again in a few minutes.', 429)

  await dbConnect()
  const user = await User.findOne({ phone })
  // Same generic error whether the number is unknown or the password is wrong,
  // so an attacker can't enumerate which phone numbers have accounts.
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new ApiError('Invalid phone number or password', 401)
  }

  // Keep the admin role in sync with ADMIN_PHONES on every login.
  await syncAdminRole(user)
  await createSession(user)

  return ok({
    user: {
      id: String(user._id),
      phone: user.phone,
      name: user.name ?? null,
      email: user.email ?? null,
      roles: user.roles,
      mustChangePassword: !!user.mustChangePassword,
    },
  })
})
