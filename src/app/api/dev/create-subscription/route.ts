import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users, subscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Development endpoint to manually create a subscription
// This simulates what would happen after a successful Stripe checkout
export async function POST(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { tier = 'starter', period = 'monthly' } = body;

    // Get user from database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found in database. Run sync-user first.' }, { status: 404 });
    }

    const dbUser = user[0];

    // Simulate Stripe IDs
    const fakeStripeCustomerId = `cus_test_${Date.now()}`;
    const fakeStripeSubscriptionId = `sub_test_${Date.now()}`;
    const fakePriceId = `price_test_${tier}_${period}`;

    // Update user with subscription info
    await db
      .update(users)
      .set({
        stripeCustomerId: fakeStripeCustomerId,
        subscriptionId: fakeStripeSubscriptionId,
        subscriptionStatus: 'active',
        priceId: fakePriceId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, dbUser.id));

    // Create subscription record
    const newSubscription = await db
      .insert(subscriptions)
      .values({
        id: crypto.randomUUID(),
        userId: dbUser.id,
        stripeSubscriptionId: fakeStripeSubscriptionId,
        stripeCustomerId: fakeStripeCustomerId,
        stripePriceId: fakePriceId,
        stripeCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'active',
      })
      .returning();

    return NextResponse.json({
      message: 'Test subscription created',
      subscription: newSubscription[0],
      user: {
        id: dbUser.id,
        subscriptionStatus: 'active',
        tier,
        period,
      },
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}