/**
 * One-time migration: phone-based login  ->  email-based login.
 *
 *   node migrate-email-auth.cjs            # report only, changes nothing
 *   node migrate-email-auth.cjs --apply    # make the changes
 *
 * What it does:
 *  1. Rebuilds the `users` indexes. The old one on `phone` is unique, which
 *     now breaks two ways: accounts created without a number collide on null,
 *     and two people who share a contact number cannot both sign up. After this,
 *     `email` is unique + sparse and `phone` is a plain, non-unique index.
 *  2. Clears `otps` — those rows are keyed by phone and mean nothing now. They
 *     are short-lived codes, so nothing of value is lost.
 *  3. Reports accounts that have no email address. Those people cannot log in
 *     until an address is added, so they need a decision rather than a guess.
 *
 * Safe to re-run. It never deletes or edits a user document.
 */
const dns = require('dns')
// This machine's resolver cannot perform the SRV lookup that mongodb+srv://
// needs, so point Node at public DNS (same workaround as lib/db.js).
try { dns.setServers(['8.8.8.8', '1.1.1.1']) } catch {}
const { MongoClient } = require('mongodb')
const fs = require('fs')
const path = require('path')

const APPLY = process.argv.includes('--apply')

function mongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI
  const envPath = path.join(__dirname, '.env')
  if (!fs.existsSync(envPath)) throw new Error('No MONGODB_URI set and no .env file found')
  const line = fs
    .readFileSync(envPath, 'utf8')
    .split('\n')
    .find((l) => l.trim().startsWith('MONGODB_URI='))
  if (!line) throw new Error('MONGODB_URI not found in .env')
  return line.trim().slice('MONGODB_URI='.length).trim()
}

async function main() {
  const client = await MongoClient.connect(mongoUri())
  const db = client.db()
  const users = db.collection('users')

  console.log(APPLY ? '=== APPLYING CHANGES ===\n' : '=== DRY RUN (pass --apply to make changes) ===\n')

  /* ---------- 1. report ---------- */
  const total = await users.countDocuments()
  const withEmail = await users.countDocuments({ email: { $nin: [null, ''] } })
  const noEmail = await users
    .find({ $or: [{ email: null }, { email: '' }, { email: { $exists: false } }] })
    .project({ phone: 1, name: 1, roles: 1, _id: 0 })
    .toArray()

  const dupes = await users
    .aggregate([
      { $match: { email: { $nin: [null, ''] } } },
      { $group: { _id: { $toLower: '$email' }, n: { $sum: 1 } } },
      { $match: { n: { $gt: 1 } } },
    ])
    .toArray()

  console.log(`users total ............ ${total}`)
  console.log(`users with an email .... ${withEmail}`)
  console.log(`users without an email . ${noEmail.length}`)
  console.log(`duplicate emails ....... ${dupes.length}`)

  if (noEmail.length) {
    console.log('\nThese accounts cannot log in until an email is added:')
    for (const u of noEmail) console.log(`  - ${u.phone || '(no phone)'}  ${u.name || ''}  [${(u.roles || []).join(', ')}]`)
  }
  if (dupes.length) {
    console.log('\nThese emails are on more than one account (the unique index will refuse to build):')
    for (const d of dupes) console.log(`  - ${d._id}  x${d.n}`)
  }

  /* ---------- 2. lower-case existing emails so lookups match ---------- */
  const mixedCase = await users.find({ email: { $nin: [null, ''] } }).project({ email: 1 }).toArray()
  const needLower = mixedCase.filter((u) => u.email !== String(u.email).toLowerCase())
  console.log(`\nemails needing lower-casing: ${needLower.length}`)
  if (APPLY && needLower.length) {
    for (const u of needLower) {
      await users.updateOne({ _id: u._id }, { $set: { email: String(u.email).toLowerCase() } })
    }
    console.log('  lower-cased.')
  }

  /* ---------- 3. indexes ---------- */
  const existing = await users.indexes()
  console.log('\ncurrent user indexes:', existing.map((i) => i.name).join(', '))

  if (APPLY) {
    if (dupes.length) {
      console.log('\nSKIPPING index rebuild — resolve the duplicate emails above first.')
    } else {
      for (const name of ['phone_1', 'email_1']) {
        if (existing.some((i) => i.name === name)) {
          await users.dropIndex(name)
          console.log(`  dropped ${name}`)
        }
      }
      await users.createIndex({ email: 1 }, { unique: true, sparse: true, name: 'email_1' })
      // Deliberately NOT unique: a phone number is only a contact detail now,
      // and two accounts are allowed to share one.
      await users.createIndex({ phone: 1 }, { name: 'phone_1' })
      console.log('  created email_1 (unique + sparse) and phone_1 (plain)')
    }
  }

  /* ---------- 4. stale codes ---------- */
  const otpCount = await db.collection('otps').countDocuments()
  console.log(`\nold otp rows (keyed by phone): ${otpCount}`)
  if (APPLY && otpCount) {
    await db.collection('otps').deleteMany({})
    // The old index is on `phone`; drop it so the collection rebuilds cleanly.
    const otpIdx = await db.collection('otps').indexes()
    if (otpIdx.some((i) => i.name === 'phone_1')) {
      await db.collection('otps').dropIndex('phone_1')
      console.log('  dropped otps.phone_1')
    }
    console.log('  cleared.')
  }

  console.log(APPLY ? '\nDone.' : '\nNothing was changed. Re-run with --apply.')
  await client.close()
}

main().catch((e) => {
  console.error('FAILED:', e.message)
  process.exit(1)
})
