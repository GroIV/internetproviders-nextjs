import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const COOKIE_NAME = 'admin_session'

// Rate limiters - created lazily
let authRateLimiter: Ratelimit | null = null
let adminApiRateLimiter: Ratelimit | null = null

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

function getAuthRateLimiter(): Ratelimit | null {
  if (authRateLimiter) return authRateLimiter
  const redis = getRedis()
  if (!redis) return null
  // Strict limit for auth: 5 attempts per 15 minutes
  authRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    prefix: 'ratelimit:admin:auth',
  })
  return authRateLimiter
}

function getAdminApiRateLimiter(): Ratelimit | null {
  if (adminApiRateLimiter) return adminApiRateLimiter
  const redis = getRedis()
  if (!redis) return null
  // General admin API limit: 100 requests per minute
  adminApiRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '60 s'),
    prefix: 'ratelimit:admin:api',
  })
  return adminApiRateLimiter
}

function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  const realIP = request.headers.get('x-real-ip')
  if (realIP) return realIP
  return 'unknown'
}

async function hmacSha256(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(key)
  const messageData = encoder.encode(message)

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function verifySession(sessionValue: string, adminPassword: string): Promise<boolean> {
  try {
    const parts = sessionValue.split(':')
    if (parts.length !== 3) return false

    const [token, expiresAt, signature] = parts
    const sessionData = `${token}:${expiresAt}`

    // Verify signature using Web Crypto API
    const expectedSignature = await hmacSha256(adminPassword, sessionData)

    if (signature !== expectedSignature) return false

    // Check expiration
    if (Date.now() > parseInt(expiresAt)) return false

    return true
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const clientIP = getClientIP(request)

  // Rate limit auth endpoint (prevent brute force)
  if (pathname === '/api/admin/auth' && request.method === 'POST') {
    const limiter = getAuthRateLimiter()
    if (limiter) {
      const result = await limiter.limit(clientIP)
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: 'Too many login attempts. Try again later.' },
          {
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil((result.reset - Date.now()) / 1000)),
              'X-RateLimit-Limit': String(result.limit),
              'X-RateLimit-Remaining': String(result.remaining),
            }
          }
        )
      }
    }
  }

  // Only protect admin routes (except login page and auth API)
  if (pathname.startsWith('/admin') &&
      !pathname.startsWith('/admin/login') &&
      !pathname.startsWith('/api/admin/auth')) {

    const adminPassword = process.env.ADMIN_PASSWORD

    // If no password configured, allow access (development fallback)
    if (!adminPassword) {
      console.warn('ADMIN_PASSWORD not set - admin routes unprotected')
      return NextResponse.next()
    }

    const sessionCookie = request.cookies.get(COOKIE_NAME)

    if (!sessionCookie?.value || !(await verifySession(sessionCookie.value, adminPassword))) {
      // Redirect to login page
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Protect admin API routes (except auth endpoint)
  if (pathname.startsWith('/api/admin') &&
      !pathname.startsWith('/api/admin/auth')) {

    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      return NextResponse.next()
    }

    const sessionCookie = request.cookies.get(COOKIE_NAME)

    if (!sessionCookie?.value || !(await verifySession(sessionCookie.value, adminPassword))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Rate limit authenticated admin API requests
    const limiter = getAdminApiRateLimiter()
    if (limiter) {
      const result = await limiter.limit(clientIP)
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: 'Rate limit exceeded' },
          {
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil((result.reset - Date.now()) / 1000)),
              'X-RateLimit-Limit': String(result.limit),
              'X-RateLimit-Remaining': String(result.remaining),
            }
          }
        )
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
}
