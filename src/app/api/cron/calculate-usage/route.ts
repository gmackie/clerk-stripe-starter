import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, subscriptions, usageTracking } from '@/db/schema';
import { eq, and, gte, lt, sql } from 'drizzle-orm';
import { stripe } from '@/lib/stripe';
import { getTierLimits, calculateOverageCharges, PRICING_TIERS } from '@/lib/pricing';

// This endpoint should be called monthly via a cron job
export async function POST(req: NextRequest) {
  try {
    // Verify the request is from an authorized source (e.g., cron job)
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the billing period (last month)
    const now = new Date();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all active subscriptions
    const activeSubscriptions = await db
      .select({
        subscription: subscriptions,
        user: users,
      })
      .from(subscriptions)
      .innerJoin(users, eq(subscriptions.userId, users.id))
      .where(eq(subscriptions.status, 'active'));

    const results = [];

    for (const { subscription, user } of activeSubscriptions) {
      if (!user.stripeCustomerId) continue;

      // Get the user's subscription tier
      const tier = PRICING_TIERS.find(t => 
        t.stripePriceIds.monthly === subscription.stripePriceId || 
        t.stripePriceIds.annually === subscription.stripePriceId
      );

      if (!tier || tier.id === 'enterprise') {
        // Skip enterprise customers (custom billing) and unknown tiers
        continue;
      }

      // Count API usage for the billing period
      const usageResult = await db
        .select({
          totalCalls: sql<number>`count(*)`,
        })
        .from(usageTracking)
        .where(
          and(
            eq(usageTracking.userId, user.clerkId),
            gte(usageTracking.timestamp, startOfLastMonth),
            lt(usageTracking.timestamp, startOfThisMonth)
          )
        );

      const totalCalls = usageResult[0]?.totalCalls || 0;
      const overageCharges = calculateOverageCharges(tier.id, totalCalls);

      if (overageCharges > 0) {
        // Create a Stripe invoice item for the overage
        try {
          await stripe.invoiceItems.create({
            customer: user.stripeCustomerId,
            amount: Math.round(overageCharges * 100), // Convert to cents
            currency: 'usd',
            description: `API usage overage for ${startOfLastMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - ${totalCalls.toLocaleString()} calls (${(totalCalls - tier.limits.apiCalls).toLocaleString()} over limit)`,
          });

          results.push({
            userId: user.id,
            email: user.email,
            tier: tier.id,
            usage: totalCalls,
            limit: tier.limits.apiCalls,
            overage: totalCalls - tier.limits.apiCalls,
            charges: overageCharges,
            status: 'billed',
          });
        } catch (stripeError) {
          console.error('Error creating invoice item:', stripeError);
          results.push({
            userId: user.id,
            email: user.email,
            tier: tier.id,
            usage: totalCalls,
            limit: tier.limits.apiCalls,
            overage: totalCalls - tier.limits.apiCalls,
            charges: overageCharges,
            status: 'error',
            error: stripeError instanceof Error ? stripeError.message : 'Unknown error',
          });
        }
      } else {
        results.push({
          userId: user.id,
          email: user.email,
          tier: tier.id,
          usage: totalCalls,
          limit: tier.limits.apiCalls,
          overage: 0,
          charges: 0,
          status: 'within_limit',
        });
      }
    }

    // Create invoices for all customers with invoice items
    const customersWithOverages = results.filter(r => r.status === 'billed');
    for (const customer of customersWithOverages) {
      try {
        const user = activeSubscriptions.find(s => s.user.id === customer.userId)?.user;
        if (user?.stripeCustomerId) {
          await stripe.invoices.create({
            customer: user.stripeCustomerId,
            auto_advance: true, // Automatically finalize and charge
            description: `Usage charges for ${startOfLastMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
          });
        }
      } catch (invoiceError) {
        console.error('Error creating invoice:', invoiceError);
      }
    }

    return NextResponse.json({
      success: true,
      period: {
        start: startOfLastMonth.toISOString(),
        end: startOfThisMonth.toISOString(),
      },
      results,
      summary: {
        total: results.length,
        billed: results.filter(r => r.status === 'billed').length,
        withinLimit: results.filter(r => r.status === 'within_limit').length,
        errors: results.filter(r => r.status === 'error').length,
        totalCharges: results.reduce((sum, r) => sum + (r.charges || 0), 0),
      },
    });
  } catch (error) {
    console.error('Error calculating usage:', error);
    return NextResponse.json(
      { error: 'Failed to calculate usage' },
      { status: 500 }
    );
  }
}