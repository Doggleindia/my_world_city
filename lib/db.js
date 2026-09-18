import dns from 'dns'
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

// Cache the connection across hot-reloads (dev) and across serverless invocations
// (Vercel/Amplify) so we don't open a new pool on every request.
let cached = global._mongoose
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null }
}

// Some networks (and this project's Windows dev machines) run a local DNS
// resolver that refuses SRV lookups, so `mongodb+srv://` fails with
// querySrv ECONNREFUSED even though the cluster is reachable. Retry once
// through public resolvers rather than making everyone hand-edit .env.
function isSrvDnsFailure(err) {
  const m = String(err?.message || '')
  return /querySrv|ENOTFOUND|ECONNREFUSED|EAI_AGAIN|ESERVFAIL/i.test(m) && /srv|_mongodb/i.test(m)
}

// Explicit, short timeouts. Without them mongoose waits 30s to pick a server,
// and with the SRV retry below that is long enough to blow past the 60s budget
// Next gives each page while prerendering — which fails the whole build.
async function connect(uri) {
  return mongoose.connect(uri, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
    socketTimeoutMS: 20000,
  })
}

async function connectWithSrvFallback(uri) {
  try {
    return await connect(uri)
  } catch (err) {
    if (!uri.startsWith('mongodb+srv://') || !isSrvDnsFailure(err)) throw err
    console.warn('[db] SRV lookup failed on this network — retrying via public DNS (8.8.8.8)')
    dns.setServers(['8.8.8.8', '1.1.1.1'])
    return connect(uri)
  }
}

export async function dbConnect() {
  if (cached.conn) return cached.conn

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set. Add it to .env (see the ACTIVE CONFIGURATION block).')
  }

  if (!cached.promise) {
    cached.promise = connectWithSrvFallback(MONGODB_URI)
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }
  return cached.conn
}
