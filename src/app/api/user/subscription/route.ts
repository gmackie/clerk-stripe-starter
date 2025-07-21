import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { PRICING_TIERS } from '@/lib/pricing';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    
    if (user.length === 0) {
      return NextResponse.json({ subscription: null });
    }

    const userData = user[0];
    
    if (!userData.subscriptionId || !userData.priceId) {
      return NextResponse.json({ subscription: null });
    }

    const tier = PRICING_TIERS.find(t => 
      t.stripePriceIds.monthly === userData.priceId || 
      t.stripePriceIds.annually === userData.priceId
    );

    return NextResponse.json({
      subscription: {
        status: userData.subscriptionStatus,
        plan: tier?.name || 'Unknown',
      },
    });
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}