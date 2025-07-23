export const PRICING_TIERS = [
  {
    name: 'Free',
    id: 'free',
    description: 'Get started with basic features',
    features: [
      '1 project',
      '100 API calls/month',
      'Community support',
      'Basic features',
    ],
    price: {
      monthly: 0,
      annually: 0,
    },
    stripePriceIds: {
      monthly: '',
      annually: '',
    },
  },
  {
    name: 'Starter',
    id: 'starter',
    description: 'Perfect for individuals and small projects',
    features: [
      'Up to 5 projects',
      '1,000 API calls/month',
      'Email support',
      'Basic analytics',
    ],
    price: {
      monthly: 9,
      annually: 90,
    },
    stripePriceIds: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_MONTHLY || '',
      annually: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_YEARLY || '',
    },
  },
  {
    name: 'Professional',
    id: 'professional',
    description: 'For growing teams and businesses',
    features: [
      'Unlimited projects',
      '50,000 API calls/month',
      'Priority email support',
      'Advanced analytics',
      'Team collaboration',
      'Custom integrations',
    ],
    price: {
      monthly: 29,
      annually: 290,
    },
    stripePriceIds: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY || '',
      annually: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY || '',
    },
    popular: true,
  },
  {
    name: 'Enterprise',
    id: 'enterprise',
    description: 'For large organizations with custom needs',
    features: [
      'Everything in Professional',
      'Unlimited API calls',
      'Dedicated support',
      'Custom contracts',
      'SLA guarantees',
      'On-premise deployment',
    ],
    price: {
      monthly: 99,
      annually: 990,
    },
    stripePriceIds: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_MONTHLY || '',
      annually: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_YEARLY || '',
    },
  },
];