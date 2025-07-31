import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, usageTracking } from '@/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { getTierLimits, PRICING_TIERS } from '@/lib/pricing';
import { emailService } from '@/lib/email';
import { inngest } from '@/lib/inngest';

// This endpoint checks usage and sends alerts when users approach their limits
export async function POST(req: NextRequest) {
  try {
    // Verify the request is from an authorized source
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the current month's start date
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all users with their subscription status
    const allUsers = await db.select().from(users);
    const alerts = [];

    for (const user of allUsers) {
      // Determine the user's tier
      const tier = PRICING_TIERS.find(t => 
        user.priceId && (
          t.stripePriceIds.monthly === user.priceId || 
          t.stripePriceIds.annually === user.priceId
        )
      );
      
      const userTier = tier?.id || 'free';
      const limits = getTierLimits(userTier);
      
      // Skip if unlimited
      if (limits.apiCalls === -1) continue;

      // Count API usage for the current month
      const usageResult = await db
        .select({
          totalCalls: sql<number>`count(*)`,
        })
        .from(usageTracking)
        .where(
          and(
            eq(usageTracking.userId, user.clerkId),
            gte(usageTracking.timestamp, startOfMonth)
          )
        );

      const totalCalls = usageResult[0]?.totalCalls || 0;
      const usagePercentage = (totalCalls / limits.apiCalls) * 100;

      // Check if we should send an alert
      if (usagePercentage >= 80 && usagePercentage < 100) {
        alerts.push({
          userId: user.id,
          email: user.email,
          tier: userTier,
          usage: totalCalls,
          limit: limits.apiCalls,
          percentage: usagePercentage,
          type: 'warning',
          message: `You've used ${usagePercentage.toFixed(0)}% of your monthly API limit`,
        });

        // Trigger Inngest event for usage warning
        await inngest.send({
          name: 'user.usage.limit.warning',
          data: {
            userId: user.id,
            usage: totalCalls,
            limit: limits.apiCalls,
            percentage: Math.round(usagePercentage),
          },
        });
      } else if (usagePercentage >= 100) {
        alerts.push({
          userId: user.id,
          email: user.email,
          tier: userTier,
          usage: totalCalls,
          limit: limits.apiCalls,
          percentage: usagePercentage,
          type: 'exceeded',
          message: `You've exceeded your monthly API limit. Overage charges will apply.`,
        });

        // Trigger Inngest event for usage exceeded
        await inngest.send({
          name: 'user.usage.limit.exceeded',
          data: {
            userId: user.id,
            usage: totalCalls,
            limit: limits.apiCalls,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      date: now.toISOString(),
      alerts,
      summary: {
        total: alerts.length,
        warnings: alerts.filter(a => a.type === 'warning').length,
        exceeded: alerts.filter(a => a.type === 'exceeded').length,
      },
    });
  } catch (error) {
    console.error('Error checking usage alerts:', error);
    return NextResponse.json(
      { error: 'Failed to check usage alerts' },
      { status: 500 }
    );
  }
}