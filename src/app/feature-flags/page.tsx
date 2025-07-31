'use client';

import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card } from '@/components/ui/card';
import { useFeatureFlags } from '@/hooks/use-feature-flag';
import { FEATURE_FLAGS, FEATURE_FLAG_GROUPS, FEATURE_FLAG_DEFAULTS } from '@/lib/feature-flags';
import { ToggleLeft, ToggleRight, Flag, Info } from 'lucide-react';

export default function FeatureFlagsPage() {
  const flags = useFeatureFlags();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Feature flags dashboard is only available in development
            </h1>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const getFlagValue = (flag: string): boolean => {
    if (flag in flags) {
      return flags[flag] === true;
    }
    return FEATURE_FLAG_DEFAULTS[flag as keyof typeof FEATURE_FLAG_DEFAULTS] || false;
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Flag className="h-8 w-8" />
              Feature Flags
            </h1>
            <p className="mt-2 text-gray-600">
              Monitor and test feature flags in your application
            </p>
          </div>

          <div className="mb-6">
            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">PostHog Configuration</p>
                  <p className="text-blue-700 mt-1">
                    To use feature flags, set up your PostHog account and add these environment variables:
                  </p>
                  <code className="block mt-2 p-2 bg-blue-100 rounded text-xs">
                    NEXT_PUBLIC_POSTHOG_KEY=phk_xxxxx<br />
                    NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
                  </code>
                  <p className="text-blue-700 mt-2">
                    Feature flags can be managed in your PostHog dashboard.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-8">
            {Object.entries(FEATURE_FLAG_GROUPS).map(([groupName, groupFlags]) => (
              <Card key={groupName} className="p-6">
                <h2 className="text-lg font-semibold mb-4 capitalize">
                  {groupName} Features
                </h2>
                <div className="space-y-4">
                  {groupFlags.map((flag) => {
                    const isEnabled = getFlagValue(flag);
                    return (
                      <div
                        key={flag}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          {isEnabled ? (
                            <ToggleRight className="h-5 w-5 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-5 w-5 text-gray-400" />
                          )}
                          <div>
                            <p className="font-medium text-sm">{flag}</p>
                            <p className="text-xs text-gray-500">
                              {getFeatureDescription(flag)}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            isEnabled
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {isEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-8">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Using Feature Flags in Code</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm mb-2">Client-side (React Components)</h3>
                  <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-x-auto">
{`import { useFeatureFlag } from '@/hooks/use-feature-flag';
import { FEATURE_FLAGS } from '@/lib/feature-flags';

function MyComponent() {
  const isDarkModeEnabled = useFeatureFlag(FEATURE_FLAGS.DARK_MODE);
  
  if (isDarkModeEnabled) {
    return <DarkModeVersion />;
  }
  return <LightModeVersion />;
}`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-medium text-sm mb-2">Server-side (API Routes)</h3>
                  <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-x-auto">
{`import { isFeatureEnabled } from '@/lib/posthog';
import { FEATURE_FLAGS } from '@/lib/feature-flags';

export async function GET(request: Request) {
  const userId = await getUserId();
  
  const hasNewApi = await isFeatureEnabled(
    userId,
    FEATURE_FLAGS.API_V2
  );
  
  if (hasNewApi) {
    return handleV2Request();
  }
  return handleV1Request();
}`}
                  </pre>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

function getFeatureDescription(flag: string): string {
  const descriptions: Record<string, string> = {
    [FEATURE_FLAGS.NEW_DASHBOARD_DESIGN]: 'Modern dashboard UI with improved UX',
    [FEATURE_FLAGS.DARK_MODE]: 'Dark theme support across the application',
    [FEATURE_FLAGS.ADVANCED_ANALYTICS]: 'Advanced analytics and reporting features',
    [FEATURE_FLAGS.USAGE_BASED_BILLING]: 'Pay per use billing model',
    [FEATURE_FLAGS.ANNUAL_DISCOUNT]: 'Discount for annual subscriptions',
    [FEATURE_FLAGS.CRYPTO_PAYMENTS]: 'Accept cryptocurrency payments',
    [FEATURE_FLAGS.API_V2]: 'New version of the API with breaking changes',
    [FEATURE_FLAGS.RATE_LIMIT_INCREASE]: 'Increased rate limits for API calls',
    [FEATURE_FLAGS.WEBHOOK_FILTERING]: 'Filter webhooks by event type',
    [FEATURE_FLAGS.LARGE_FILE_UPLOADS]: 'Support for files larger than 10MB',
    [FEATURE_FLAGS.VIDEO_PROCESSING]: 'Process and transcode video files',
    [FEATURE_FLAGS.AI_IMAGE_ANALYSIS]: 'AI-powered image analysis and tagging',
    [FEATURE_FLAGS.BETA_FEATURES]: 'Access to beta features',
    [FEATURE_FLAGS.AI_ASSISTANT]: 'AI-powered assistant for users',
    [FEATURE_FLAGS.REALTIME_COLLABORATION]: 'Real-time collaboration features',
    [FEATURE_FLAGS.EDGE_CACHING]: 'Edge caching for improved performance',
    [FEATURE_FLAGS.LAZY_LOADING]: 'Lazy load components for better performance',
    [FEATURE_FLAGS.TWO_FACTOR_AUTH]: 'Two-factor authentication for extra security',
    [FEATURE_FLAGS.AUDIT_LOGS]: 'Detailed audit logging for compliance',
  };
  
  return descriptions[flag] || 'No description available';
}