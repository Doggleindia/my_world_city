import { dbConnect } from '@/lib/db'
import User from '@/lib/models/User'
import { getSession } from '@/lib/auth/session'
import { handler, ok } from '@/lib/api'

export const GET = handler(async () => {
  const session = await getSession()
  if (!session) return ok({ user: null })

  await dbConnect()
  const user = await User.findById(session.uid).lean()
  if (!user) return ok({ user: null })

  return ok({
    user: {
      id: String(user._id),
      phone: user.phone,
      name: user.name ?? null,
      email: user.email ?? null,
      avatar: user.avatar ?? null,
      roles: user.roles,
    },
  })
})
