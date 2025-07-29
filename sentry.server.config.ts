import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Disable in development
  enabled: process.env.NODE_ENV === 'production',
  
  // Filtering
  ignoreErrors: [
    // Ignore expected errors
    'NEXT_NOT_FOUND',
    'NEXT_REDIRECT',
  ],
  
  beforeSend(event, hint) {
    // Filter out events from development
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry Event (dev):', event);
      return null;
    }
    
    // Don't send events without a release
    if (!event.release) {
      return null;
    }
    
    // Add user context if available
    if (event.user?.id) {
      event.user.id = `clerk_${event.user.id}`;
    }
    
    return event;
  },
});