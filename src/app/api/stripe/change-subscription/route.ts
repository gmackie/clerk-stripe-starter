import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users, subscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { newPriceId, billingPeriod } = await req.json();

    // Get user from database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentUser = user[0];

    // If user has no subscription, create a checkout session
    if (!currentUser.subscriptionId) {
      const session = await stripe.checkout.sessions.create({
        customer: currentUser.stripeCustomerId || undefined,
        payment_method_types: ['card'],
        line_items: [{ price: newPriceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
        metadata: {
          userId: currentUser.id,
        },
      });

      return NextResponse.json({ url: session.url, type: 'checkout' });
    }

    // Get current subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(currentUser.subscriptionId);
    
    // Check if it's actually a change
    const currentPriceId = subscription.items.data[0]?.price.id;
    if (currentPriceId === newPriceId) {
      return NextResponse.json({ 
        error: 'You are already on this plan',
        type: 'no_change' 
      }, { status: 400 });
    }

    // Handle downgrade to free (cancel subscription)
    if (newPriceId === 'free') {
      // Cancel at period end to allow user to use paid features until end of billing period
      const updatedSubscription = await stripe.subscriptions.update(
        currentUser.subscriptionId,
        { cancel_at_period_end: true }
      );

      // Update database
      await db
        .update(users)
        .set({
          subscriptionStatus: 'canceling',
          updatedAt: new Date(),
        })
        .where(eq(users.id, currentUser.id));

      return NextResponse.json({
        message: 'Subscription will be canceled at the end of the billing period',
        cancelAt: new Date(updatedSubscription.cancel_at! * 1000),
        type: 'downgrade_scheduled',
      });
    }

    // For upgrades/downgrades between paid plans
    try {
      // Update the subscription immediately with proration
      const updatedSubscription = await stripe.subscriptions.update(
        currentUser.subscriptionId,
        {
          cancel_at_period_end: false, // Remove any pending cancellation
          items: [
            {
              id: subscription.items.data[0].id,
              price: newPriceId,
            },
          ],
          proration_behavior: 'always_invoice', // Create invoice immediately for the difference
        }
      );

      // Update database
      await db
        .update(users)
        .set({
          priceId: newPriceId,
          subscriptionStatus: updatedSubscription.status,
          updatedAt: new Date(),
        })
        .where(eq(users.id, currentUser.id));

      // Also update subscription record
      await db
        .update(subscriptions)
        .set({
          stripePriceId: newPriceId,
          status: updatedSubscription.status,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.stripeSubscriptionId, currentUser.subscriptionId));

      // Determine if it's an upgrade or downgrade
      const isUpgrade = determineIfUpgrade(currentPriceId, newPriceId);

      return NextResponse.json({
        message: isUpgrade 
          ? 'Subscription upgraded successfully!' 
          : 'Subscription changed successfully!',
        subscription: {
          id: updatedSubscription.id,
          status: updatedSubscription.status,
          currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
        },
        type: isUpgrade ? 'upgrade' : 'change',
      });
    } catch (stripeError: any) {
      console.error('Stripe update error:', stripeError);
      
      // If there's a payment issue, redirect to customer portal
      if (stripeError.code === 'payment_required') {
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: currentUser.stripeCustomerId!,
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
        });
        
        return NextResponse.json({ 
          url: portalSession.url, 
          type: 'payment_required',
          message: 'Payment update required' 
        });
      }
      
      throw stripeError;
    }
  } catch (error) {
    console.error('Subscription change error:', error);
    return NextResponse.json(
      { error: 'Failed to change subscription' },
      { status: 500 }
    );
  }
}

// Helper function to determine if it's an upgrade
function determineIfUpgrade(currentPriceId: string, newPriceId: string): boolean {
  const tierOrder = ['starter', 'pro', 'enterprise'];
  
  const getCurrentTier = (priceId: string) => {
    if (priceId.includes('enterprise')) return 2;
    if (priceId.includes('pro')) return 1;
    if (priceId.includes('starter')) return 0;
    return -1;
  };
  
  return getCurrentTier(newPriceId) > getCurrentTier(currentPriceId);
}