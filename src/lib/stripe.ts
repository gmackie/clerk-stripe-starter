import Stripe from 'stripe';

let _stripe: Stripe | null = null;

function getStripeInstance() {
  if (!_stripe && process.env.STRIPE_SECRET_KEY) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }
  return _stripe!;
}

// Export stripe as a getter to maintain compatibility
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    const stripeInstance = getStripeInstance();
    return stripeInstance[prop as keyof Stripe];
  },
});

export const getStripeSession = async (priceId: string, userId: string, email: string) => {
  const session = await stripe.checkout.sessions.create({
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
    client_reference_id: userId,
    metadata: {
      userId,
    },
  });

  return session;
};

export const createCustomerPortal = async (customerId: string) => {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });

  return session;
};