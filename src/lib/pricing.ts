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
    trialDays: 0,
    limits: {
      apiCalls: 100,
      projects: 1,
    },
    overage: {
      apiCalls: 0.02, // $0.02 per additional API call
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
      '14-day free trial',
      '$0.01 per additional API call',
    ],
    price: {
      monthly: 9,
      annually: 90,
    },
    stripePriceIds: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_MONTHLY || '',
      annually: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_YEARLY || '',
    },
    trialDays: 14,
    limits: {
      apiCalls: 1000,
      projects: 5,
    },
    overage: {
      apiCalls: 0.01, // $0.01 per additional API call
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
      '14-day free trial',
      '$0.005 per additional API call',
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
    trialDays: 14,
    limits: {
      apiCalls: 50000,
      projects: -1, // unlimited
    },
    overage: {
      apiCalls: 0.005, // $0.005 per additional API call
    },
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
      '30-day free trial',
    ],
    price: {
      monthly: 99,
      annually: 990,
    },
    stripePriceIds: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_MONTHLY || '',
      annually: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_YEARLY || '',
    },
    trialDays: 30,
    limits: {
      apiCalls: -1, // unlimited
      projects: -1, // unlimited
    },
    overage: {
      apiCalls: 0, // no overage charges
    },
  },
];

// Helper function to get tier limits
export function getTierLimits(tierId: string) {
  const tier = PRICING_TIERS.find(t => t.id === tierId);
  return tier?.limits || { apiCalls: 100, projects: 1 };
}

// Helper function to calculate overage charges
export function calculateOverageCharges(tierId: string, usage: number) {
  const tier = PRICING_TIERS.find(t => t.id === tierId);
  if (!tier || tier.limits.apiCalls === -1) return 0;
  
  const overage = Math.max(0, usage - tier.limits.apiCalls);
  return overage * tier.overage.apiCalls;
}