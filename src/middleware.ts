import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'admin_session'

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
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
}
