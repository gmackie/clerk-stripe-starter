import { track } from '@vercel/analytics/server';

// Server-side analytics tracking
export async function trackServerEvent(
  event: string,
  properties?: Record<string, any>
) {
  try {
    await track(event, properties);
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Server Analytics Event:', event, properties);
    }
  } catch (error) {
    console.error('Error tracking server event:', error);
  }
}

// Convenience methods for common server events
export async function trackSubscriptionEvent(
  type: 'created' | 'updated' | 'cancelled',
  userId: string,
  plan: string,
  amount?: number,
  interval?: string
) {
  const eventMap = {
    created: 'subscription_created',
    updated: 'subscription_updated',
    cancelled: 'subscription_cancelled',
  };

  await trackServerEvent(eventMap[type], {
    userId,
    plan,
    amount,
    interval,
    timestamp: new Date().toISOString(),
  });
}

export async function trackApiUsage(
  userId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTime?: number
) {
  await trackServerEvent('api_usage', {
    userId,
    endpoint,
    method,
    statusCode,
    responseTime,
    timestamp: new Date().toISOString(),
  });
}

export async function trackWebhookEvent(
  source: 'stripe' | 'clerk',
  eventType: string,
  success: boolean,
  error?: string
) {
  await trackServerEvent('webhook_received', {
    source,
    eventType,
    success,
    error,
    timestamp: new Date().toISOString(),
  });
}