import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const COOKIE_NAME = 'admin_session'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// POST /api/admin/auth - Login
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!ADMIN_PASSWORD) {
      console.error('ADMIN_PASSWORD environment variable not set')
      return NextResponse.json(
        { success: false, error: 'Admin authentication not configured' },
        { status: 500 }
      )
    }

    // Compare passwords (supports both plain and hashed in env)
    const isValid = password === ADMIN_PASSWORD ||
                    hashPassword(password) === ADMIN_PASSWORD

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Generate session token
    const sessionToken = generateSessionToken()
    const expiresAt = Date.now() + SESSION_DURATION

    // Create signed session value
    const sessionValue = `${sessionToken}:${expiresAt}`
    const signature = crypto
      .createHmac('sha256', ADMIN_PASSWORD)
      .update(sessionValue)
      .digest('hex')
    const signedSession = `${sessionValue}:${signature}`

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, signedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000,
      path: '/',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/auth - Logout
export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  return NextResponse.json({ success: true })
}

// GET /api/admin/auth - Check session
export async function GET() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(COOKIE_NAME)

  if (!sessionCookie?.value || !ADMIN_PASSWORD) {
    return NextResponse.json({ authenticated: false })
  }

  try {
    const parts = sessionCookie.value.split(':')
    if (parts.length !== 3) {
      return NextResponse.json({ authenticated: false })
    }

    const [token, expiresAt, signature] = parts
    const sessionValue = `${token}:${expiresAt}`

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', ADMIN_PASSWORD)
      .update(sessionValue)
      .digest('hex')

    if (signature !== expectedSignature) {
      return NextResponse.json({ authenticated: false })
    }

    // Check expiration
    if (Date.now() > parseInt(expiresAt)) {
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({ authenticated: true })
  } catch {
    return NextResponse.json({ authenticated: false })
  }
}
