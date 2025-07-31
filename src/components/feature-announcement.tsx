'use client';

import { useFeatureFlag } from '@/hooks/use-feature-flag';
import { FEATURE_FLAGS } from '@/lib/feature-flags';
import { X, Sparkles, Zap, Shield } from 'lucide-react';
import { useState } from 'react';

export function FeatureAnnouncement() {
  const [dismissed, setDismissed] = useState(false);
  
  // Check multiple feature flags
  const hasAIAssistant = useFeatureFlag(FEATURE_FLAGS.AI_ASSISTANT);
  const hasCryptoPayments = useFeatureFlag(FEATURE_FLAGS.CRYPTO_PAYMENTS);
  const hasTwoFactor = useFeatureFlag(FEATURE_FLAGS.TWO_FACTOR_AUTH);
  const hasBetaFeatures = useFeatureFlag(FEATURE_FLAGS.BETA_FEATURES);

  // Only show if at least one new feature is enabled
  const hasNewFeatures = hasAIAssistant || hasCryptoPayments || hasTwoFactor;

  if (!hasNewFeatures || dismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Sparkles className="h-5 w-5" />
            <p className="text-sm font-medium">
              New features are now available!
            </p>
            <div className="hidden sm:flex items-center space-x-6">
              {hasAIAssistant && (
                <span className="flex items-center space-x-1 text-sm">
                  <Zap className="h-4 w-4" />
                  <span>AI Assistant</span>
                </span>
              )}
              {hasCryptoPayments && (
                <span className="flex items-center space-x-1 text-sm">
                  <span>🪙</span>
                  <span>Crypto Payments</span>
                </span>
              )}
              {hasTwoFactor && (
                <span className="flex items-center space-x-1 text-sm">
                  <Shield className="h-4 w-4" />
                  <span>2FA Security</span>
                </span>
              )}
            </div>
            {hasBetaFeatures && (
              <span className="px-2 py-0.5 text-xs bg-white/20 rounded-full">
                Beta Access
              </span>
            )}
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/80 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}