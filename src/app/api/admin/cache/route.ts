import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

interface CacheEntry {
  key: string
  type: string
  ttl: number
  size?: number
  preview?: string
}

// GET /api/admin/cache - List cache entries and stats
export async function GET(request: NextRequest) {
  const redis = getRedis()
  if (!redis) {
    return NextResponse.json({
      success: false,
      error: 'Redis not configured'
    }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const pattern = searchParams.get('pattern') || '*'
  const key = searchParams.get('key')

  try {
    // If specific key requested, return its value
    if (key) {
      const value = await redis.get(key)
      const ttl = await redis.ttl(key)
      return NextResponse.json({
        success: true,
        key,
        value,
        ttl,
      })
    }

    // Scan for keys matching pattern
    const keys: string[] = []
    let cursor = '0'
    do {
      const result: [string, string[]] = await redis.scan(cursor, { match: pattern, count: 100 })
      cursor = result[0]
      keys.push(...result[1])
    } while (cursor !== '0' && keys.length < 500)

    // Get TTL and type for each key
    const entries: CacheEntry[] = []
    const chatKeys: string[] = []
    const rateLimitKeys: string[] = []
    const otherKeys: string[] = []

    for (const k of keys) {
      const ttl = await redis.ttl(k)

      let type = 'other'
      if (k.startsWith('chat:')) {
        type = 'chat'
        chatKeys.push(k)
      } else if (k.startsWith('ratelimit:')) {
        type = 'ratelimit'
        rateLimitKeys.push(k)
      } else {
        otherKeys.push(k)
      }

      entries.push({
        key: k,
        type,
        ttl,
      })
    }

    // Get memory info if available
    let memoryUsed = 0
    try {
      const info = await redis.dbsize()
      memoryUsed = info
    } catch {
      // Not all Redis instances support this
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalKeys: keys.length,
        chatCacheKeys: chatKeys.length,
        rateLimitKeys: rateLimitKeys.length,
        otherKeys: otherKeys.length,
        dbSize: memoryUsed,
      },
      entries: entries.slice(0, 100), // Limit response size
    })
  } catch (error) {
    console.error('Cache API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch cache data'
    }, { status: 500 })
  }
}

// DELETE /api/admin/cache - Delete cache entries
export async function DELETE(request: NextRequest) {
  const redis = getRedis()
  if (!redis) {
    return NextResponse.json({
      success: false,
      error: 'Redis not configured'
    }, { status: 500 })
  }

  try {
    const { keys, pattern } = await request.json()

    let deletedCount = 0

    // Delete specific keys
    if (keys && Array.isArray(keys) && keys.length > 0) {
      for (const key of keys) {
        await redis.del(key)
        deletedCount++
      }
    }

    // Delete by pattern
    if (pattern) {
      let cursor = '0'
      do {
        const result: [string, string[]] = await redis.scan(cursor, { match: pattern, count: 100 })
        cursor = result[0]
        for (const key of result[1]) {
          await redis.del(key)
          deletedCount++
        }
      } while (cursor !== '0' && deletedCount < 1000)
    }

    return NextResponse.json({
      success: true,
      deletedCount,
    })
  } catch (error) {
    console.error('Cache delete error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete cache entries'
    }, { status: 500 })
  }
}
