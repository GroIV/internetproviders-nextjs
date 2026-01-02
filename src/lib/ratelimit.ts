import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Rate limiter instance - created lazily
let ratelimit: Ratelimit | null = null
let rateLimitWarningLogged = false

/**
 * Get the rate limiter instance.
 * Returns null if Upstash Redis is not configured.
 */
function getRateLimiter(): Ratelimit | null {
  if (ratelimit) return ratelimit

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!redisUrl || !redisToken) {
    if (!rateLimitWarningLogged) {
      console.warn(
        '[Rate Limit] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not configured. ' +
        'Rate limiting is disabled. Set up Upstash Redis for production use.'
      )
      rateLimitWarningLogged = true
    }
    return null
  }

  try {
    const redis = new Redis({
      url: redisUrl,
      token: redisToken,
    })

    // Create rate limiter with sliding window
    // 20 requests per 60 seconds per IP
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '60 s'),
      analytics: true,
      prefix: 'ratelimit:chat',
    })

    return ratelimit
  } catch (error) {
    console.error('[Rate Limit] Failed to initialize:', error)
    return null
  }
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}

/**
 * Check rate limit for an identifier (usually IP address).
 * Returns success: true if request is allowed.
 * Returns success: true if rate limiting is not configured (graceful degradation).
 */
export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  const limiter = getRateLimiter()

  // If rate limiter not configured, allow all requests
  if (!limiter) {
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
    }
  }

  try {
    const result = await limiter.limit(identifier)

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      retryAfter: result.success ? undefined : Math.ceil((result.reset - Date.now()) / 1000),
    }
  } catch (error) {
    console.error('[Rate Limit] Error checking limit:', error)
    // On error, allow the request but log it
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
    }
  }
}

/**
 * Get the client IP address from request headers.
 * Works with Vercel, Cloudflare, and other proxies.
 */
export function getClientIP(headers: Headers): string {
  // Vercel
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  // Cloudflare
  const cfConnectingIP = headers.get('cf-connecting-ip')
  if (cfConnectingIP) {
    return cfConnectingIP
  }

  // Real IP header
  const realIP = headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // Fallback
  return 'unknown'
}
