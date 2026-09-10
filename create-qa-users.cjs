/*
 * Creates QA login accounts in the database named by MONGODB_URI in .env.
 *
 *   node create-qa-users.cjs "<password>"
 *
 * Safe to re-run: it refuses to touch a phone number that already belongs to a
 * non-QA account. Delete this file (and the accounts) when testing is done:
 *   node create-qa-users.cjs --remove
 */
const fs = require('fs')
const crypto = require('crypto')
const mongoose = require('mongoose')

const uri = process.env.MONGODB_URI || (fs.readFileSync('.env', 'utf8').match(/^MONGODB_URI=(.*)$/m) || [])[1].trim()
const arg = process.argv[2]
const REMOVE = arg === '--remove'
const PW = REMOVE ? null : arg

if (!REMOVE && !PW) {
  console.error('Usage: node create-qa-users.cjs "<password>"   |   node create-qa-users.cjs --remove')
  process.exit(1)
}

// Same scrypt format the app uses (lib/auth/password.js): "<saltHex>:<hashHex>"
const hash = (p) => {
  const salt = crypto.randomBytes(16).toString('hex')
  return salt + ':' + crypto.scryptSync(String(p), salt, 64).toString('hex')
}

// 90000000xx are unused in this database. Admin role is set directly, so no
// change to ADMIN_PHONES is needed (syncAdminRole only ever adds, never strips).
const ACCOUNTS = [
  { phone: '9000000001', name: 'QA Admin', email: 'qa.admin@myworldcity.test', roles: ['buyer', 'admin'] },
  { phone: '9000000002', name: 'QA Buyer', email: 'qa.buyer@myworldcity.test', roles: ['buyer'] },
  { phone: '9000000003', name: 'QA Owner', email: 'qa.owner@myworldcity.test', roles: ['buyer', 'owner'] },
]

async function main() {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 20000 })
  const users = mongoose.connection.db.collection('users')

  for (const a of ACCOUNTS) {
    const existing = await users.findOne({ phone: a.phone })

    if (existing && !/^QA /.test(existing.name || '')) {
      console.log('SKIP    ' + a.phone + ' — belongs to "' + (existing.name || 'an existing user') + '", left untouched')
      continue
    }

    if (REMOVE) {
      if (existing) {
        await users.deleteOne({ phone: a.phone })
        console.log('REMOVED ' + a.phone + '  ' + a.name)
      } else {
        console.log('ABSENT  ' + a.phone)
      }
      continue
    }

    const now = new Date()
    await users.updateOne(
      { phone: a.phone },
      {
        $set: { ...a, passwordHash: hash(PW), verified: true, mustChangePassword: false, updatedAt: now },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    )
    console.log((existing ? 'UPDATED ' : 'CREATED ') + a.phone + '  ' + a.name + '  ' + JSON.stringify(a.roles))
  }

  console.log('users in database: ' + (await users.countDocuments()))
  await mongoose.disconnect()
}

main().catch((e) => {
  console.error('ERROR ' + e.message)
  process.exit(1)
})
