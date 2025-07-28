'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  tier: {
    id: string;
    name: string;
    description: string;
    features: string[];
    price: { monthly: number; annually: number };
    stripePriceIds: { monthly: string; annually: string };
    popular?: boolean;
    trialDays?: number;
  };
  billingPeriod: 'monthly' | 'annually';
  currentPlan?: string;
  isLoading: boolean;
  onSelect: (tierId: string) => void;
}

export function PricingCard({
  tier,
  billingPeriod,
  currentPlan,
  isLoading,
  onSelect,
}: PricingCardProps) {
  const isCurrentPlan = currentPlan === tier.id;
  const price = tier.price[billingPeriod];
  const isFreeTier = tier.id === 'free';

  const getButtonText = () => {
    if (isLoading) return 'Processing...';
    if (isCurrentPlan) return 'Current Plan';
    if (isFreeTier) return 'Downgrade to Free';
    if (currentPlan && TIER_ORDER[tier.id] < TIER_ORDER[currentPlan]) return 'Downgrade';
    return tier.popular ? 'Upgrade to Pro' : 'Get Started';
  };

  const getButtonVariant = () => {
    if (isCurrentPlan) return 'secondary';
    if (tier.popular) return 'primary';
    return 'secondary';
  };

  return (
    <div
      className={cn(
        "rounded-3xl p-8 ring-1 transition-all",
        tier.popular ? "bg-gray-900 ring-gray-900 shadow-2xl scale-105" : "ring-gray-200",
        isCurrentPlan && "ring-2 ring-blue-600"
      )}
    >
      {isCurrentPlan && (
        <div className="mb-4">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
            Current Plan
          </span>
        </div>
      )}
      
      {tier.popular && !isCurrentPlan && (
        <div className="mb-4">
          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1 text-xs font-medium text-white">
            Most Popular
          </span>
        </div>
      )}

      <h3
        className={cn(
          "text-lg font-semibold leading-8",
          tier.popular ? "text-white" : "text-gray-900"
        )}
      >
        {tier.name}
      </h3>
      
      <p
        className={cn(
          "mt-4 text-sm leading-6",
          tier.popular ? "text-gray-300" : "text-gray-600"
        )}
      >
        {tier.description}
      </p>

      <p className="mt-6 flex items-baseline gap-x-1">
        <span
          className={cn(
            "text-4xl font-bold tracking-tight",
            tier.popular ? "text-white" : "text-gray-900"
          )}
        >
          ${price}
        </span>
        <span
          className={cn(
            "text-sm font-semibold leading-6",
            tier.popular ? "text-gray-300" : "text-gray-600"
          )}
        >
          /{billingPeriod === 'monthly' ? 'month' : 'year'}
        </span>
      </p>

      {billingPeriod === 'annually' && !isFreeTier && (
        <p className={cn(
          "text-sm",
          tier.popular ? "text-gray-300" : "text-green-600"
        )}>
          Save ${(tier.price.monthly * 12 - tier.price.annually)} per year
        </p>
      )}

      {tier.trialDays && tier.trialDays > 0 && !isCurrentPlan && !isFreeTier && (
        <p className={cn(
          "text-sm mt-2 font-medium",
          tier.popular ? "text-blue-300" : "text-blue-600"
        )}>
          ✨ {tier.trialDays}-day free trial included
        </p>
      )}

      <Button
        onClick={() => onSelect(tier.id)}
        disabled={isLoading || isCurrentPlan}
        variant={getButtonVariant()}
        className="mt-6 w-full"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {getButtonText()}
      </Button>

      <ul
        className={cn(
          "mt-8 space-y-3 text-sm leading-6",
          tier.popular ? "text-gray-300" : "text-gray-600"
        )}
      >
        {tier.features.map((feature) => (
          <li key={feature} className="flex gap-x-3">
            <Check
              className={cn(
                "h-6 w-5 flex-none",
                tier.popular ? "text-white" : "text-blue-600"
              )}
            />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Helper to determine tier order for upgrade/downgrade logic
const TIER_ORDER: Record<string, number> = {
  free: 0,
  starter: 1,
  professional: 2,
  enterprise: 3,
};