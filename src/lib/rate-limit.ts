import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create a new ratelimiter that allows different rates based on subscription tier
export function getRateLimiter() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('Upstash Redis not configured, rate limiting disabled');
    return null;
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  return {
    free: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
      analytics: true,
      prefix: 'ratelimit:free',
    }),
    starter: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
      analytics: true,
      prefix: 'ratelimit:starter',
    }),
    professional: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(1000, '1 m'), // 1000 requests per minute
      analytics: true,
      prefix: 'ratelimit:professional',
    }),
    enterprise: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10000, '1 m'), // 10000 requests per minute
      analytics: true,
      prefix: 'ratelimit:enterprise',
    }),
  };
}

export async function checkRateLimit(
  userId: string,
  subscriptionTier: string = 'free'
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
  const rateLimiters = getRateLimiter();
  
  if (!rateLimiters) {
    // If rate limiting is not configured, allow all requests
    return { success: true };
  }

  const limiter = rateLimiters[subscriptionTier as keyof typeof rateLimiters] || rateLimiters.free;
  const { success, limit, remaining, reset } = await limiter.limit(userId);

  return {
    success,
    limit,
    remaining,
    reset,
  };
}