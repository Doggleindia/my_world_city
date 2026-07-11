import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

// Cache the connection across hot-reloads (dev) and across serverless invocations
// (Vercel) so we don't open a new pool on every request.
let cached = global._mongoose
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null }
}

export async function dbConnect() {
  if (cached.conn) return cached.conn

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set. Add it to .env.local (see .env.example).')
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }
  return cached.conn
}
