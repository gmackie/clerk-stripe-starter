'use client';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { useAuth, useUser } from '@clerk/nextjs';
import { useEffect } from 'react';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();
  const { user } = useUser();

  // Track custom user properties
  useEffect(() => {
    if (user && typeof window !== 'undefined' && window.va) {
      // Track user properties for better insights
      window.va('identify', {
        userId: userId,
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
        createdAt: user.createdAt,
      });
    }
  }, [userId, user]);

  return (
    <>
      {children}
      <Analytics 
        // Enable debug mode in development
        debug={process.env.NODE_ENV === 'development'}
        // Custom beforeSend function to add more context
        beforeSend={(event) => {
          // Add user context to all events
          if (userId) {
            return {
              ...event,
              userId,
            };
          }
          return event;
        }}
      />
      <SpeedInsights 
        // Only enabled in production
        debug={false}
      />
    </>
  );
}