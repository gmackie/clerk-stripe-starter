import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/db';
import { users, subscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';
import { emailService } from '@/lib/email';
import { PRICING_TIERS } from '@/lib/pricing';
import { inngest } from '@/lib/inngest';

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
            trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          });

          // Send subscription confirmation email
          const user = await db
            .select()
            .from(users)
            .where(eq(users.id, session.client_reference_id))
            .limit(1);

          if (user.length > 0) {
            const tier = PRICING_TIERS.find(t => 
              t.stripePriceIds.monthly === subscription.items.data[0].price.id ||
              t.stripePriceIds.annually === subscription.items.data[0].price.id
            );

            const price = subscription.items.data[0].price;
            const interval = price.recurring?.interval || 'month';
            const amount = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: price.currency.toUpperCase(),
            }).format((price.unit_amount || 0) / 100);

            await emailService.sendSubscriptionConfirmation({
              to: user[0].email,
              userFirstname: user[0].name?.split(' ')[0] || 'there',
              planName: tier?.name || 'Professional',
              amount,
              interval,
              nextBillingDate: new Date((subscription as any).current_period_end * 1000).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
            });

            // Trigger Inngest event for subscription created
            await inngest.send({
              name: 'user.subscription.created',
              data: {
                userId: user[0].id,
                subscriptionId: subscription.id,
                priceId: subscription.items.data[0].price.id,
                planName: tier?.name || 'Professional',
              },
            });
          }
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
            trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
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