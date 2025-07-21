'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Button } from '@/components/ui/button';
import { PRICING_TIERS } from '@/lib/pricing';
import toast from 'react-hot-toast';

export default function PricingPage() {
  const { isSignedIn } = useUser();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('monthly');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubscribe = async (tierId: string) => {
    if (!isSignedIn) {
      window.location.href = '/sign-up';
      return;
    }

    setIsLoading(tierId);
    try {
      const tier = PRICING_TIERS.find(t => t.id === tierId);
      if (!tier) return;

      const priceId = tier.stripePriceIds[billingPeriod];
      
      const response = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <PageWrapper>
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Pricing</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Choose the right plan for your needs
            </p>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
            Start for free, upgrade anytime. All plans include a 14-day free trial.
          </p>
          
          <div className="mt-16 flex justify-center">
            <div className="grid grid-cols-2 gap-x-1 rounded-full bg-gray-200 p-1 text-center text-xs font-semibold leading-5">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`cursor-pointer rounded-full px-3 py-1 ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-gray-900'
                    : 'text-gray-500'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annually')}
                className={`cursor-pointer rounded-full px-3 py-1 ${
                  billingPeriod === 'annually'
                    ? 'bg-white text-gray-900'
                    : 'text-gray-500'
                }`}
              >
                Annually
                <span className="ml-1 text-xs text-green-600">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.id}
                className={`rounded-3xl p-8 ring-1 ${
                  tier.popular
                    ? 'bg-gray-900 ring-gray-900'
                    : 'ring-gray-200'
                }`}
              >
                <h3
                  className={`text-lg font-semibold leading-8 ${
                    tier.popular ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {tier.name}
                </h3>
                <p
                  className={`mt-4 text-sm leading-6 ${
                    tier.popular ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {tier.description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span
                    className={`text-4xl font-bold tracking-tight ${
                      tier.popular ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    ${tier.price[billingPeriod]}
                  </span>
                  <span
                    className={`text-sm font-semibold leading-6 ${
                      tier.popular ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    /{billingPeriod === 'monthly' ? 'month' : 'year'}
                  </span>
                </p>
                <Button
                  onClick={() => handleSubscribe(tier.id)}
                  disabled={isLoading === tier.id}
                  variant={tier.popular ? 'primary' : 'secondary'}
                  className="mt-6 w-full"
                >
                  {isLoading === tier.id ? 'Loading...' : 'Get started'}
                </Button>
                <ul
                  className={`mt-8 space-y-3 text-sm leading-6 ${
                    tier.popular ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <svg
                        className={`h-6 w-5 flex-none ${
                          tier.popular ? 'text-white' : 'text-blue-600'
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}