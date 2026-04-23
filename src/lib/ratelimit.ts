import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

/**
 * Global Rate Limiter for StackFind API
 * 
 * To use: 
 * 1. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env.local
 * 2. Import 'ratelimit' into your route handler.
 */

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Create a new ratelimiter, that allows 5 requests per 1 minute
export const playgroundRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit/playground",
})

// For public tool submissions (3 per hour per IP to prevent spam)
export const submissionRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  analytics: true,
  prefix: "@upstash/ratelimit/submission",
})

/**
 * Helper to get user IP for rate limiting
 */
export function getIP(req: Request) {
  const xff = req.headers.get("x-forwarded-for")
  return xff ? xff.split(",")[0] : "127.0.0.1"
}
