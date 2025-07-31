'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Button } from '@/components/ui/button';
import { PricingCard } from '@/components/pricing/pricing-card';
import { PRICING_TIERS } from '@/lib/pricing';
import { useAnalytics } from '@/hooks/use-analytics';
import toast from 'react-hot-toast';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface UserSubscription {
  status: string | null;
  tier: string;
  priceId: string | null;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string;
}

export default function PricingPage() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const { trackEvent, trackPageView, trackButtonClick } = useAnalytics();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('monthly');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);

  useEffect(() => {
    // Track page view
    trackPageView('/pricing', 'Pricing');
    
    if (isSignedIn) {
      fetchUserSubscription();
    }
  }, [isSignedIn]);

  const fetchUserSubscription = async () => {
    try {
      const response = await fetch('/api/user/subscription');
      if (response.ok) {
        const data = await response.json();
        setUserSubscription(data);
        
        // Set billing period based on current subscription
        if (data.priceId?.includes('yearly')) {
          setBillingPeriod('annually');
        }
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handlePlanSelection = async (tierId: string) => {
    if (!isSignedIn) {
      window.location.href = '/sign-up';
      return;
    }

    // If selecting free tier
    if (tierId === 'free') {
      if (!userSubscription?.status || userSubscription.status === 'canceled') {
        toast.error('You are already on the free plan');
        return;
      }
      
      // Confirm downgrade to free
      if (!confirm('Are you sure you want to downgrade to the free plan? You will lose access to premium features at the end of your billing period.')) {
        return;
      }
    }

    setIsLoading(tierId);
    
    // Track plan selection
    trackEvent('button_clicked', {
      elementId: `select-plan-${tierId}`,
      elementText: `Select ${tierId} plan`,
      plan: tierId,
      billingPeriod,
    });
    
    try {
      const tier = PRICING_TIERS.find(t => t.id === tierId);
      if (!tier) return;

      // If user has a subscription, use the change endpoint
      if (userSubscription?.status === 'active') {
        const newPriceId = tierId === 'free' ? 'free' : tier.stripePriceIds[billingPeriod];
        
        const response = await fetch('/api/stripe/change-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            newPriceId,
            billingPeriod 
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          if (data.type === 'no_change') {
            toast.error('You are already on this plan');
          } else {
            toast.error(data.error || 'Failed to change subscription');
          }
          return;
        }

        // Handle different response types
        switch (data.type) {
          case 'checkout':
            window.location.href = data.url;
            break;
          case 'payment_required':
            toast.error('Payment update required');
            window.location.href = data.url;
            break;
          case 'downgrade_scheduled':
            toast.success(`Subscription will be canceled on ${new Date(data.cancelAt).toLocaleDateString()}`);
            await fetchUserSubscription();
            break;
          case 'upgrade':
            toast.success('🎉 Subscription upgraded successfully!');
            await fetchUserSubscription();
            break;
          case 'change':
            toast.success('Subscription updated successfully!');
            await fetchUserSubscription();
            break;
        }
      } else {
        // No active subscription, create checkout session
        const priceId = tier.stripePriceIds[billingPeriod];
        
        const response = await fetch('/api/stripe/checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priceId }),
        });

        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          toast.error('Failed to create checkout session');
        }
      }
    } catch (error) {
      console.error('Error handling subscription:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  const getCurrentPlanId = () => {
    if (!userSubscription?.priceId) return 'free';
    
    if (userSubscription.priceId.includes('enterprise')) return 'enterprise';
    if (userSubscription.priceId.includes('pro')) return 'professional';
    if (userSubscription.priceId.includes('starter')) return 'starter';
    
    return 'free';
  };

  return (
    <PageWrapper>
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Back button for signed-in users */}
          {isSignedIn && (
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-8 -ml-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}

          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Pricing</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              {userSubscription?.status === 'active' 
                ? 'Manage Your Subscription' 
                : 'Choose the right plan for your needs'}
            </p>
          </div>
          
          {userSubscription?.status === 'active' && (
            <div className="mx-auto mt-6 max-w-2xl text-center">
              <div className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2">
                <Sparkles className="mr-2 h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  You're currently on the {getCurrentPlanId()} plan
                  {userSubscription.cancelAtPeriodEnd && ' (canceling at period end)'}
                </span>
              </div>
            </div>
          )}

          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
            {userSubscription?.status === 'active'
              ? 'Upgrade or downgrade your plan anytime. Changes take effect immediately.'
              : 'Start for free, upgrade anytime. All plans include a 14-day money-back guarantee.'}
          </p>
          
          {/* Billing period toggle */}
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

          {/* Pricing cards */}
          <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-4">
            {PRICING_TIERS.map((tier) => (
              <PricingCard
                key={tier.id}
                tier={tier}
                billingPeriod={billingPeriod}
                currentPlan={getCurrentPlanId()}
                isLoading={isLoading === tier.id}
                onSelect={handlePlanSelection}
              />
            ))}
          </div>

          {/* Additional info for existing customers */}
          {userSubscription?.status === 'active' && (
            <div className="mt-16 text-center">
              <p className="text-sm text-gray-600">
                Need to update payment method or view invoices?{' '}
                <Button
                  variant="ghost"
                  onClick={async () => {
                    const response = await fetch('/api/stripe/customer-portal', {
                      method: 'POST',
                    });
                    const { url } = await response.json();
                    if (url) window.location.href = url;
                  }}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Manage billing →
                </Button>
              </p>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}