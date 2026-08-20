/**
 * Removes every record created by the QA suite.
 * Matches only the QA marker phone / title, so real data is never touched.
 * Usage: node qa-report/cleanup.mjs
 */
import mongoose from 'mongoose'
import fs from 'fs'

const QA_PHONE = '7000000001'
const QA_TITLE = 'QA TEST Listing - delete me'
const QA_NAME = 'QA TEST User'

const env = Object.fromEntries(
  fs.readFileSync('.env', 'utf8').split('\n')
    .filter((l) => l.trim() && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] }),
)

await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 })
const db = mongoose.connection.db

const user = await db.collection('users').findOne({ phone: QA_PHONE })
let saved = 0, props = 0
if (user) {
  saved = (await db.collection('savedproperties').deleteMany({ userId: user._id })).deletedCount
  props = (await db.collection('properties').deleteMany({ ownerId: user._id })).deletedCount
}
const propsByTitle = (await db.collection('properties').deleteMany({ title: QA_TITLE })).deletedCount
const leads = (await db.collection('leads').deleteMany({ $or: [{ phone: QA_PHONE }, { name: QA_NAME }] })).deletedCount
const users = (await db.collection('users').deleteMany({ phone: QA_PHONE })).deletedCount

console.log('QA teardown complete:')
console.log(`  users removed          : ${users}`)
console.log(`  properties removed     : ${props + propsByTitle}`)
console.log(`  leads removed          : ${leads}`)
console.log(`  saved-properties removed: ${saved}`)

// Confirm nothing is left behind.
const left = {
  users: await db.collection('users').countDocuments({ phone: QA_PHONE }),
  properties: await db.collection('properties').countDocuments({ title: QA_TITLE }),
  leads: await db.collection('leads').countDocuments({ phone: QA_PHONE }),
}
console.log('  residual QA records    :', JSON.stringify(left))

console.log('\nRemaining real data:')
for (const c of ['users', 'properties', 'leads', 'experts']) {
  console.log(`  ${c}: ${await db.collection(c).countDocuments()}`)
}
process.exit(0)
