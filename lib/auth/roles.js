// Admins are configured by email address via the ADMIN_EMAILS env var
// (comma-separated). This is the single source of truth for who is an admin,
// checked on every login and on account creation.
//
// ADMIN_PHONES is still honoured so accounts that were made admin before the
// switch to email login keep their access.

function csv(key) {
  return (process.env[key] || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

// Grant the admin role to a user document if their phone is configured as an
// admin and they don't already have it. Saves only when something changed.
export async function syncAdminRole(user) {
  const isAdmin =
    (user.email && csv('ADMIN_EMAILS').includes(String(user.email).toLowerCase())) ||
    (user.phone && csv('ADMIN_PHONES').includes(String(user.phone)))

  if (isAdmin && !user.roles.includes('admin')) {
    user.roles.push('admin')
    await user.save()
    return true
  }
  return false
}
