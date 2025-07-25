import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/db';
import { users, subscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription' && session.subscription && session.client_reference_id) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          await db.update(users)
            .set({
              stripeCustomerId: subscription.customer as string,
              subscriptionId: subscription.id,
              subscriptionStatus: subscription.status,
              priceId: subscription.items.data[0].price.id,
              updatedAt: new Date(),
            })
            .where(eq(users.id, session.client_reference_id));

          await db.insert(subscriptions).values({
            id: crypto.randomUUID(),
            userId: session.client_reference_id,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
            status: subscription.status,
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await db.update(users)
          .set({
            subscriptionStatus: subscription.status,
            priceId: subscription.items.data[0].price.id,
            updatedAt: new Date(),
          })
          .where(eq(users.stripeCustomerId, subscription.customer as string));

        await db.update(subscriptions)
          .set({
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
            status: subscription.status,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await db.update(users)
          .set({
            subscriptionStatus: 'canceled',
            updatedAt: new Date(),
          })
          .where(eq(users.stripeCustomerId, subscription.customer as string));

        await db.update(subscriptions)
          .set({
            status: 'canceled',
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}