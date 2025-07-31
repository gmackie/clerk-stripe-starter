'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useEffect } from 'react';

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug();
    },
  });
}

export function PHProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

export function PostHogAuthWrapper({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (userId && user) {
      // Identify the user in PostHog
      posthog.identify(userId, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
        createdAt: user.createdAt,
      });
    } else if (!userId) {
      // Reset PostHog when user logs out
      posthog.reset();
    }
  }, [userId, user]);

  return <>{children}</>;
}