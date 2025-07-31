import { PostHog } from 'posthog-node';

// Server-side PostHog client
let posthogClient: PostHog | null = null;

export function getPostHogClient() {
  if (!posthogClient && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    });
  }
  return posthogClient;
}

// Helper to check feature flags on the server
export async function isFeatureEnabled(
  distinctId: string,
  featureFlag: string,
  defaultValue = false
): Promise<boolean> {
  const client = getPostHogClient();
  if (!client) return defaultValue;

  try {
    const isEnabled = await client.isFeatureEnabled(featureFlag, distinctId);
    return isEnabled ?? defaultValue;
  } catch (error) {
    console.error('Error checking feature flag:', error);
    return defaultValue;
  }
}

// Helper to get all feature flags for a user
export async function getFeatureFlags(distinctId: string): Promise<Record<string, boolean | string>> {
  const client = getPostHogClient();
  if (!client) return {};

  try {
    const flags = await client.getAllFlags(distinctId);
    return flags || {};
  } catch (error) {
    console.error('Error getting feature flags:', error);
    return {};
  }
}

// Helper to track events on the server
export async function trackEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, any>
) {
  const client = getPostHogClient();
  if (!client) return;

  try {
    client.capture({
      distinctId,
      event,
      properties,
    });
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

// Shutdown PostHog gracefully
export async function shutdownPostHog() {
  const client = getPostHogClient();
  if (client) {
    await client.shutdown();
  }
}