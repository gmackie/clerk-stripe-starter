'use client';

import { track } from '@vercel/analytics';
import { useAuth } from '@clerk/nextjs';

// Custom event types for type safety
export type AnalyticsEvent = 
  | 'sign_up'
  | 'sign_in'
  | 'subscription_created'
  | 'subscription_cancelled'
  | 'subscription_upgraded'
  | 'subscription_downgraded'
  | 'payment_success'
  | 'payment_failed'
  | 'api_key_created'
  | 'api_key_deleted'
  | 'file_uploaded'
  | 'file_deleted'
  | 'feature_used'
  | 'error_occurred'
  | 'page_viewed'
  | 'button_clicked'
  | 'form_submitted';

interface EventProperties {
  // Common properties
  userId?: string;
  source?: string;
  
  // Subscription properties
  plan?: string;
  previousPlan?: string;
  amount?: number;
  interval?: 'monthly' | 'annually';
  
  // File properties
  fileType?: string;
  fileSize?: number;
  
  // Feature properties
  feature?: string;
  variant?: string;
  
  // Error properties
  errorType?: string;
  errorMessage?: string;
  
  // Interaction properties
  elementId?: string;
  elementText?: string;
  formName?: string;
  
  // Page properties
  pagePath?: string;
  pageTitle?: string;
  referrer?: string;
  
  // Custom properties
  [key: string]: any;
}

export function useAnalytics() {
  const { userId } = useAuth();

  const trackEvent = (event: AnalyticsEvent, properties?: EventProperties) => {
    // Add userId to all events if available
    const enrichedProperties = {
      ...properties,
      userId: properties?.userId || userId,
      timestamp: new Date().toISOString(),
    };

    // Track the event
    track(event, enrichedProperties);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', event, enrichedProperties);
    }
  };

  // Convenience methods for common events
  const trackPageView = (pagePath: string, pageTitle?: string) => {
    trackEvent('page_viewed', {
      pagePath,
      pageTitle,
      referrer: typeof window !== 'undefined' ? document.referrer : undefined,
    });
  };

  const trackButtonClick = (elementId: string, elementText?: string) => {
    trackEvent('button_clicked', {
      elementId,
      elementText,
    });
  };

  const trackFormSubmit = (formName: string, success: boolean = true) => {
    trackEvent('form_submitted', {
      formName,
      success,
    });
  };

  const trackFeatureUse = (feature: string, variant?: string) => {
    trackEvent('feature_used', {
      feature,
      variant,
    });
  };

  const trackError = (errorType: string, errorMessage: string) => {
    trackEvent('error_occurred', {
      errorType,
      errorMessage,
    });
  };

  const trackSubscriptionEvent = (
    type: 'created' | 'cancelled' | 'upgraded' | 'downgraded',
    plan: string,
    previousPlan?: string,
    amount?: number,
    interval?: 'monthly' | 'annually'
  ) => {
    const eventMap = {
      created: 'subscription_created',
      cancelled: 'subscription_cancelled',
      upgraded: 'subscription_upgraded',
      downgraded: 'subscription_downgraded',
    } as const;

    trackEvent(eventMap[type], {
      plan,
      previousPlan,
      amount,
      interval,
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackButtonClick,
    trackFormSubmit,
    trackFeatureUse,
    trackError,
    trackSubscriptionEvent,
  };
}