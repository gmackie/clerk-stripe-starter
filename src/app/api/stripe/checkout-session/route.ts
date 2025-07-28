import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { PRICING_TIERS } from '@/lib/pricing';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId } = await req.json();
    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    }).then(res => res.json());

    const email = clerkUser.email_addresses?.[0]?.email_address;
    if (!email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    let user = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (user.length === 0) {
      await db.insert(users).values({
        id: crypto.randomUUID(),
        clerkId: userId,
        email,
        name: `${clerkUser.first_name || ''} ${clerkUser.last_name || ''}`.trim() || null,
      });
      user = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    }

    // Find the pricing tier for this price ID to get trial days
    const tier = PRICING_TIERS.find(
      t => t.stripePriceIds.monthly === priceId || t.stripePriceIds.annually === priceId
    );

    const sessionConfig: any = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      customer_email: email,
      client_reference_id: user[0].id,
      metadata: {
        userId: user[0].id,
      },
    };

    // Add trial period if applicable
    if (tier && tier.trialDays > 0) {
      sessionConfig.subscription_data = {
        trial_period_days: tier.trialDays,
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}