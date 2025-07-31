'use client';

import { useFeatureFlagEnabled, usePostHog } from 'posthog-js/react';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export function useFeatureFlag(flagName: string, defaultValue = false) {
  const posthog = usePostHog();
  const { userId } = useAuth();
  const flagEnabled = useFeatureFlagEnabled(flagName);
  const [isEnabled, setIsEnabled] = useState(defaultValue);

  useEffect(() => {
    if (userId && posthog) {
      // Ensure user is identified before checking flags
      const checkFlag = async () => {
        const enabled = posthog.isFeatureEnabled(flagName);
        setIsEnabled(enabled ?? defaultValue);
      };
      checkFlag();
    } else {
      setIsEnabled(defaultValue);
    }
  }, [userId, posthog, flagName, defaultValue]);

  // Return the flag value from the hook or our state
  return flagEnabled ?? isEnabled;
}

export function useFeatureFlags() {
  const posthog = usePostHog();
  const { userId } = useAuth();
  const [flags, setFlags] = useState<Record<string, boolean | string>>({});

  useEffect(() => {
    if (userId && posthog) {
      const allFlags = posthog.getAllFlags();
      setFlags(allFlags);
    }
  }, [userId, posthog]);

  return flags;
}

// Hook to track events
export function usePostHogTracking() {
  const posthog = usePostHog();
  const { userId } = useAuth();

  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (posthog && userId) {
      posthog.capture(eventName, properties);
    }
  };

  return { trackEvent };
}