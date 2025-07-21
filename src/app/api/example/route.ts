import { NextRequest, NextResponse } from 'next/server';
import { withApiMiddleware } from '@/lib/api-middleware';

export const GET = withApiMiddleware(
  async (req: NextRequest, { userId, subscriptionTier }) => {
    return NextResponse.json({
      message: 'Hello from the API!',
      timestamp: new Date().toISOString(),
      userId,
      subscriptionTier,
      data: {
        example: 'This is example data from your API',
        features: [
          'Authentication with Clerk or API Keys',
          'Subscription management with Stripe',
          'Database with Turso',
          'Usage tracking and rate limiting',
        ],
      },
    });
  }
);