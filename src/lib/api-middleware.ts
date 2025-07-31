import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { validateApiKey, trackApiUsage } from './auth';
import { checkRateLimit } from './rate-limit';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as Sentry from '@sentry/nextjs';
import { isFeatureEnabled } from './posthog';
import { FEATURE_FLAGS } from './feature-flags';

interface ApiMiddlewareOptions {
  requireAuth?: boolean;
  rateLimit?: boolean;
}

export function withApiMiddleware(
  handler: (req: NextRequest, context: { userId: string; subscriptionTier: string }) => Promise<NextResponse>,
  options: ApiMiddlewareOptions = { requireAuth: true, rateLimit: true }
) {
  return async function (req: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();
    let userId: string | null = null;
    let subscriptionTier = 'free';
    let statusCode = 200;
    let response: NextResponse;

    try {
      // Step 1: Handle authentication if required
      if (options.requireAuth) {
        // Check for API key first
        const authHeader = req.headers.get('authorization');
        
        if (authHeader) {
          const apiKeyResult = await validateApiKey(authHeader);
          if (!apiKeyResult.isValid || !apiKeyResult.userId) {
            response = NextResponse.json(
              { error: apiKeyResult.error || 'Invalid API key' },
              { status: 401 }
            );
            statusCode = 401;
            return response;
          }
          userId = apiKeyResult.userId;
        } else {
          // Try Clerk authentication
          const clerkAuth = await auth();
          userId = clerkAuth.userId;
        }

        // If no userId at this point, return 401
        if (!userId) {
          response = NextResponse.json(
            { error: 'Unauthorized - Please sign in or provide an API key' },
            { status: 401 }
          );
          statusCode = 401;
          return response;
        }

        // Step 2: Get user subscription tier
        try {
          const user = await db
            .select({ 
              subscriptionStatus: users.subscriptionStatus,
              priceId: users.priceId 
            })
            .from(users)
            .where(eq(users.clerkId, userId))
            .limit(1);

          if (user.length > 0 && user[0].subscriptionStatus === 'active') {
            if (user[0].priceId?.includes('enterprise')) {
              subscriptionTier = 'enterprise';
            } else if (user[0].priceId?.includes('pro')) {
              subscriptionTier = 'professional';
            } else if (user[0].priceId?.includes('starter')) {
              subscriptionTier = 'starter';
            }
          }
        } catch (dbError) {
          console.error('Database error fetching user subscription:', dbError);
          // Continue with free tier if database fails
        }
      }

      // Step 3: Handle rate limiting if enabled
      if (options.rateLimit && userId) {
        // Check if user has rate limit increase feature flag
        const hasRateLimitIncrease = await isFeatureEnabled(
          userId,
          FEATURE_FLAGS.RATE_LIMIT_INCREASE,
          false
        );
        
        // Modify tier for rate limiting if feature flag is enabled
        const effectiveTier = hasRateLimitIncrease && subscriptionTier !== 'enterprise' 
          ? 'professional' // Bump up one tier for rate limiting
          : subscriptionTier;
        
        const rateLimitResult = await checkRateLimit(userId, effectiveTier);
        
        if (!rateLimitResult.success) {
          response = NextResponse.json(
            { 
              error: 'Rate limit exceeded',
              limit: rateLimitResult.limit,
              remaining: rateLimitResult.remaining,
              reset: rateLimitResult.reset,
            },
            { 
              status: 429,
              headers: {
                'X-RateLimit-Limit': String(rateLimitResult.limit || 0),
                'X-RateLimit-Remaining': String(rateLimitResult.remaining || 0),
                'X-RateLimit-Reset': String(rateLimitResult.reset || 0),
              }
            }
          );
          statusCode = 429;
          return response;
        }

        // Call handler with rate limit headers
        response = await handler(req, { userId: userId!, subscriptionTier });
        
        if (rateLimitResult.limit) {
          response.headers.set('X-RateLimit-Limit', String(rateLimitResult.limit));
          response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining || 0));
          response.headers.set('X-RateLimit-Reset', String(rateLimitResult.reset || 0));
        }
      } else {
        // Call handler without rate limiting
        response = await handler(req, { userId: userId || '', subscriptionTier });
      }

      statusCode = response.status;
      return response;

    } catch (error) {
      console.error('API middleware error:', error);
      
      // Capture error in Sentry with context
      Sentry.captureException(error, {
        tags: {
          api: true,
          authenticated: !!userId,
          tier: subscriptionTier,
        },
        extra: {
          endpoint: req.url,
          method: req.method,
          userId,
          headers: Object.fromEntries(req.headers.entries()),
        },
        user: userId ? { id: userId } : undefined,
      });
      
      response = NextResponse.json(
        { 
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: process.env.NODE_ENV === 'development' ? error : undefined
        },
        { status: 500 }
      );
      statusCode = 500;
      return response;
    } finally {
      // Track API usage if we have both auth header and userId
      try {
        const authHeader = req.headers.get('authorization');
        if (authHeader && userId && statusCode) {
          const responseTime = Date.now() - startTime;
          const endpoint = new URL(req.url).pathname;
          await trackApiUsage(userId, endpoint, responseTime, statusCode);
        }
      } catch (trackError) {
        console.error('Error tracking API usage:', trackError);
      }
    }
  };
}