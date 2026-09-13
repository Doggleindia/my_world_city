import { dbConnect } from '@/lib/db'
import User from '@/lib/models/User'
import { verifyPassword } from '@/lib/auth/password'
import { createSession } from '@/lib/auth/session'
import { syncAdminRole } from '@/lib/auth/roles'
import { loginSchema } from '@/lib/validation'
import { handler, parseBody, ok, ApiError } from '@/lib/api'
import { rateLimit } from '@/lib/rateLimit'

// POST /api/auth/login { email, password }
export const POST = handler(async (req) => {
  const { email, password } = await parseBody(req, loginSchema)

  const rl = rateLimit(`login:${email}`, 8, 10 * 60 * 1000)
  if (!rl.ok) throw new ApiError('Too many attempts. Try again in a few minutes.', 429)

  await dbConnect()
  const user = await User.findOne({ email })
  // Same generic error whether the address is unknown or the password is wrong,
  // so an attacker can't enumerate which addresses have accounts.
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new ApiError('Invalid email or password', 401)
  }

  // Keep the admin role in sync with ADMIN_EMAILS on every login.
  await syncAdminRole(user)
  await createSession(user)

  return ok({
    user: {
      id: String(user._id),
      email: user.email,
      name: user.name ?? null,
      phone: user.phone ?? null,
      roles: user.roles,
      mustChangePassword: !!user.mustChangePassword,
    },
  })
})
