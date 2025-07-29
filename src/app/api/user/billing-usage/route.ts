import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users, usageTracking } from '@/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { getTierLimits, calculateOverageCharges, PRICING_TIERS } from '@/lib/pricing';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user details
    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Determine the user's tier
    const tier = PRICING_TIERS.find(t => 
      user[0].priceId && (
        t.stripePriceIds.monthly === user[0].priceId || 
        t.stripePriceIds.annually === user[0].priceId
      )
    );
    
    const userTier = tier?.id || 'free';
    const limits = getTierLimits(userTier);

    // Get current month's usage
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const usageResult = await db
      .select({
        totalCalls: sql<number>`count(*)`,
      })
      .from(usageTracking)
      .where(
        and(
          eq(usageTracking.userId, userId),
          gte(usageTracking.timestamp, startOfMonth)
        )
      );

    const totalCalls = usageResult[0]?.totalCalls || 0;
    const overage = limits.apiCalls === -1 ? 0 : Math.max(0, totalCalls - limits.apiCalls);
    const overageCharges = calculateOverageCharges(userTier, totalCalls);
    const usagePercentage = limits.apiCalls === -1 ? 0 : (totalCalls / limits.apiCalls) * 100;

    // Get daily usage for the current month
    const dailyUsage = await db
      .select({
        date: sql<string>`date(${usageTracking.timestamp}, 'unixepoch')`,
        count: sql<number>`count(*)`,
      })
      .from(usageTracking)
      .where(
        and(
          eq(usageTracking.userId, userId),
          gte(usageTracking.timestamp, startOfMonth)
        )
      )
      .groupBy(sql`date(${usageTracking.timestamp}, 'unixepoch')`)
      .orderBy(sql`date(${usageTracking.timestamp}, 'unixepoch')`);

    return NextResponse.json({
      billing: {
        period: {
          start: startOfMonth.toISOString(),
          end: endOfMonth.toISOString(),
          daysRemaining: Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        },
        tier: {
          id: userTier,
          name: tier?.name || 'Free',
          limits: limits,
        },
        usage: {
          total: totalCalls,
          percentage: usagePercentage,
          overage: overage,
          charges: overageCharges,
          projectedTotal: Math.round(totalCalls * (endOfMonth.getDate() / now.getDate())),
        },
        dailyUsage: dailyUsage,
      },
    });
  } catch (error) {
    console.error('Error fetching billing usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing usage' },
      { status: 500 }
    );
  }
}