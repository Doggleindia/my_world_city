import { dbConnect } from '@/lib/db'
import User from '@/lib/models/User'
import { verifyPassword } from '@/lib/auth/password'
import { createSession } from '@/lib/auth/session'
import { syncAdminRole } from '@/lib/auth/roles'
import { loginSchema } from '@/lib/validation'
import { handler, parseBody, ok, ApiError } from '@/lib/api'
import { rateLimit, clientIp } from '@/lib/rateLimit'

// POST /api/admin/login { email, password }
// The admin console's own door: email + password, no one-time code. Only an
// account that holds the admin role can get through it — everyone else is
// turned away with the same message as a wrong password, so this endpoint
// can't be used to find out which addresses are admins.
export const POST = handler(async (req) => {
  const { email, password } = await parseBody(req, loginSchema)

  const byEmail = rateLimit(`admin:login:${email}`, 6, 10 * 60 * 1000)
  const byIp = rateLimit(`admin:login:ip:${clientIp(req)}`, 20, 10 * 60 * 1000)
  if (!byEmail.ok || !byIp.ok) throw new ApiError('Too many attempts. Try again in a few minutes.', 429)

  await dbConnect()
  const user = await User.findOne({ email })
  if (user) await syncAdminRole(user) // ADMIN_EMAILS may have changed since their last login

  const isAdmin = !!user && user.roles.includes('admin')
  if (!isAdmin || !verifyPassword(password, user.passwordHash)) {
    throw new ApiError('Invalid email or password', 401)
  }

  await createSession(user)
  return ok({
    user: {
      id: String(user._id),
      email: user.email,
      name: user.name ?? null,
      roles: user.roles,
    },
  })
})
