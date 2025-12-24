/**
 * Caching Layer
 *
 * In-memory cache for development.
 * Can be swapped for Redis/Upstash in production.
 */

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const cache = new Map<string, CacheEntry<unknown>>()

/**
 * Get a cached value
 */
export function get<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.data
}

/**
 * Set a cached value with TTL in seconds
 */
export function set<T>(key: string, data: T, ttlSeconds: number): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  })
}

/**
 * Check if a key exists and is not expired
 */
export function has(key: string): boolean {
  return get(key) !== null
}
