// Admins are configured by phone number via the ADMIN_PHONES env var
// (comma-separated 10-digit numbers). This is the single source of truth for
// who is an admin, checked on every login and on account creation.

export function adminPhones() {
  return (process.env.ADMIN_PHONES || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

// Grant the admin role to a user document if their phone is configured as an
// admin and they don't already have it. Saves only when something changed.
export async function syncAdminRole(user) {
  if (adminPhones().includes(user.phone) && !user.roles.includes('admin')) {
    user.roles.push('admin')
    await user.save()
    return true
  }
  return false
}
