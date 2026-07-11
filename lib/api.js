import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

export function ok(data, init) {
  return NextResponse.json({ ok: true, ...data }, init)
}

export function fail(message, status = 400, extra) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status })
}

// Parse + validate a JSON body with a Zod schema. Returns { data } or throws an ApiError.
export async function parseBody(req, schema) {
  let json
  try {
    json = await req.json()
  } catch {
    throw new ApiError('Invalid JSON body', 400)
  }
  const result = schema.safeParse(json)
  if (!result.success) {
    throw new ApiError('Validation failed', 422, {
      issues: result.error.flatten().fieldErrors,
    })
  }
  return result.data
}

export function parseQuery(req, schema) {
  const params = Object.fromEntries(new URL(req.url).searchParams)
  const result = schema.safeParse(params)
  if (!result.success) {
    throw new ApiError('Invalid query', 422, { issues: result.error.flatten().fieldErrors })
  }
  return result.data
}

export class ApiError extends Error {
  constructor(message, status = 400, extra) {
    super(message)
    this.status = status
    this.extra = extra
  }
}

// True for a 24-char hex Mongo ObjectId string.
export function isObjectId(id) {
  return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)
}

// Guard a route param before hitting Mongoose — a malformed id would otherwise
// throw a CastError that surfaces as a generic 500. Treat it as "not found".
export function assertObjectId(id, label = 'Resource') {
  if (!isObjectId(id)) throw new ApiError(`${label} not found`, 404)
  return id
}

// Require an authenticated session; throws 401 otherwise.
export async function requireUser() {
  const session = await getSession()
  if (!session) throw new ApiError('Authentication required', 401)
  return session
}

// Require one of the given roles; throws 403 otherwise.
export async function requireRole(...roles) {
  const session = await requireUser()
  const has = (session.roles ?? []).some((r) => roles.includes(r))
  if (!has) throw new ApiError('Forbidden', 403)
  return session
}

// Wrap a route handler so thrown ApiErrors become clean JSON responses.
export function handler(fn) {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx)
    } catch (e) {
      if (e instanceof ApiError) return fail(e.message, e.status, e.extra)
      console.error('[api] unhandled error:', e)
      return fail('Internal server error', 500)
    }
  }
}
