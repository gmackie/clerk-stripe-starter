import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { validateApiKey, trackApiUsage } from './auth';
import { checkRateLimit } from './rate-limit';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface ApiMiddlewareOptions {
  requireAuth?: boolean;
  rateLimit?: boolean;
}

export async function withApiMiddleware(
  handler: (req: NextRequest, context: { userId: string; subscriptionTier: string }) => Promise<NextResponse>,
  options: ApiMiddlewareOptions = { requireAuth: true, rateLimit: true }
) {
  return async function (req: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();
    let userId: string | null = null;
    let subscriptionTier = 'free';
    let statusCode = 200;

    try {
      // Authentication
      if (options.requireAuth) {
        const authHeader = req.headers.get('authorization');
        
        if (authHeader) {
          // API key authentication
          const apiKeyResult = await validateApiKey(authHeader);
          if (!apiKeyResult.isValid || !apiKeyResult.userId) {
            statusCode = 401;
            return NextResponse.json(
              { error: apiKeyResult.error || 'Invalid API key' },
              { status: 401 }
            );
          }
          userId = apiKeyResult.userId;
        } else {
          // Clerk authentication
          const clerkAuth = await auth();
          userId = clerkAuth.userId;
        }

        if (!userId) {
          statusCode = 401;
          return NextResponse.json(
            { error: 'Unauthorized - Please sign in or provide an API key' },
            { status: 401 }
          );
        }

        // Get user subscription tier
        const user = await db
          .select({ 
            subscriptionStatus: users.subscriptionStatus,
            priceId: users.priceId 
          })
          .from(users)
          .where(eq(users.clerkId, userId))
          .limit(1);

        if (user.length > 0 && user[0].subscriptionStatus === 'active') {
          // Map price ID to tier - this is simplified, you might want to improve this
          if (user[0].priceId?.includes('enterprise')) {
            subscriptionTier = 'enterprise';
          } else if (user[0].priceId?.includes('pro')) {
            subscriptionTier = 'professional';
          } else if (user[0].priceId?.includes('starter')) {
            subscriptionTier = 'starter';
          }
        }
      }

      // Rate limiting
      if (options.rateLimit && userId) {
        const rateLimitResult = await checkRateLimit(userId, subscriptionTier);
        
        if (!rateLimitResult.success) {
          statusCode = 429;
          return NextResponse.json(
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
        }

        // Add rate limit headers to successful responses
        const response = await handler(req, { userId: userId!, subscriptionTier });
        
        if (rateLimitResult.limit) {
          response.headers.set('X-RateLimit-Limit', String(rateLimitResult.limit));
          response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining || 0));
          response.headers.set('X-RateLimit-Reset', String(rateLimitResult.reset || 0));
        }

        statusCode = response.status;
        return response;
      }

      // Call handler without rate limiting
      const response = await handler(req, { userId: userId || '', subscriptionTier });
      statusCode = response.status;
      return response;

    } catch (error) {
      console.error('API middleware error:', error);
      statusCode = 500;
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    } finally {
      // Track API usage
      const authHeader = req.headers.get('authorization');
      if (authHeader && userId) {
        const responseTime = Date.now() - startTime;
        trackApiUsage(userId, req.url, responseTime, statusCode).catch(console.error);
      }
    }
  };
}