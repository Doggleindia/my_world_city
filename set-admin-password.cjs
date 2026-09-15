/*
 * Sets (or resets) the admin-console password for an account.
 *
 *   node set-admin-password.cjs <email> "<password>"
 *   node set-admin-password.cjs --all-admins "<password>"   # every account holding the admin role
 *
 * The password is stored as a scrypt hash in the same "<saltHex>:<hashHex>"
 * format the app uses (lib/auth/password.js) — never in plain text. Accounts
 * are matched by email; the account must already exist.
 */
const dns = require('dns')
// This machine's resolver cannot perform the SRV lookup that mongodb+srv://
// needs, so point Node at public DNS (same workaround as lib/db.js).
try { dns.setServers(['8.8.8.8', '1.1.1.1']) } catch {}
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { MongoClient } = require('mongodb')

const [target, password] = process.argv.slice(2)
if (!target || !password) {
  console.error('Usage: node set-admin-password.cjs <email|--all-admins> "<password>"')
  process.exit(1)
}
if (password.length < 8) {
  console.error('Use a password of at least 8 characters.')
  process.exit(1)
}

function mongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI
  const line = fs
    .readFileSync(path.join(__dirname, '.env'), 'utf8')
    .split('\n')
    .find((l) => l.trim().startsWith('MONGODB_URI='))
  if (!line) throw new Error('MONGODB_URI not found in .env')
  return line.trim().slice('MONGODB_URI='.length).trim()
}

const hash = (p) => {
  const salt = crypto.randomBytes(16).toString('hex')
  return salt + ':' + crypto.scryptSync(String(p), salt, 64).toString('hex')
}

async function main() {
  const client = await MongoClient.connect(mongoUri())
  const users = client.db().collection('users')

  const filter = target === '--all-admins' ? { roles: 'admin' } : { email: target.trim().toLowerCase() }
  const matched = await users.find(filter).project({ email: 1, name: 1, roles: 1 }).toArray()

  if (!matched.length) {
    console.error(target === '--all-admins' ? 'No admin accounts found.' : `No account with email ${target}.`)
    process.exit(1)
  }

  for (const u of matched) {
    if (!u.email) {
      console.log(`SKIP    (no email) ${u.name || u._id} — cannot log in to the console without an email`)
      continue
    }
    await users.updateOne(
      { _id: u._id },
      { $set: { passwordHash: hash(password), mustChangePassword: false, updatedAt: new Date() } },
    )
    console.log(`SET     ${u.email}  ${u.name || ''}  [${(u.roles || []).join(', ')}]`)
  }

  await client.close()
}

main().catch((e) => {
  console.error('FAILED:', e.message)
  process.exit(1)
})
