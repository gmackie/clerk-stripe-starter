'use client';

import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users, DollarSign, Activity, Clock, Globe, Smartphone } from 'lucide-react';
import { useAnalytics } from '@/hooks/use-analytics';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
  const { trackEvent, trackButtonClick, trackFeatureUse } = useAnalytics();
  const [testCount, setTestCount] = useState(0);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Analytics dashboard is only available in development
            </h1>
            <p className="mt-2 text-gray-600">
              View your analytics in the Vercel dashboard
            </p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const handleTestEvent = () => {
    setTestCount(testCount + 1);
    trackEvent('button_clicked', {
      elementId: 'test-analytics-button',
      elementText: 'Test Analytics Event',
      testNumber: testCount + 1,
    });
    toast.success(`Test event #${testCount + 1} tracked!`);
  };

  const handleFeatureTest = (feature: string) => {
    trackFeatureUse(feature);
    toast.success(`Feature "${feature}" usage tracked!`);
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="h-8 w-8" />
              Analytics & Monitoring
            </h1>
            <p className="mt-2 text-gray-600">
              Monitor application performance and user behavior with Vercel Analytics
            </p>
          </div>

          <div className="grid gap-6 mb-8">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Vercel Analytics Dashboard</h2>
              <p className="text-gray-600 mb-4">
                View detailed analytics, performance metrics, and user insights in your Vercel dashboard
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={() => window.open('https://vercel.com/dashboard', '_blank')}
                  variant="primary"
                >
                  Open Vercel Dashboard
                </Button>
                <Button
                  onClick={() => window.open('https://vercel.com/docs/analytics', '_blank')}
                  variant="secondary"
                >
                  View Documentation
                </Button>
              </div>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">What's Being Tracked</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">User Behavior</h4>
                      <p className="text-sm text-gray-600">
                        Page views, button clicks, form submissions
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <DollarSign className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Subscription Events</h4>
                      <p className="text-sm text-gray-600">
                        Plan selections, upgrades, downgrades, cancellations
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Activity className="h-5 w-5 text-purple-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Feature Usage</h4>
                      <p className="text-sm text-gray-600">
                        API calls, file uploads, feature flag interactions
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Performance Metrics</h4>
                      <p className="text-sm text-gray-600">
                        Page load times, API response times, Core Web Vitals
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Globe className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Traffic Analytics</h4>
                      <p className="text-sm text-gray-600">
                        Visitors, page views, bounce rate, session duration
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Conversion Tracking</h4>
                      <p className="text-sm text-gray-600">
                        Sign-ups, subscriptions, feature adoption
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Smartphone className="h-5 w-5 text-purple-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Device & Browser</h4>
                      <p className="text-sm text-gray-600">
                        Device types, browsers, operating systems
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <BarChart3 className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Custom Events</h4>
                      <p className="text-sm text-gray-600">
                        Business-specific events and user actions
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Test Analytics Events</h3>
              <p className="text-gray-600 mb-4">
                Test the analytics integration by triggering sample events
              </p>
              
              <div className="space-y-4">
                <div>
                  <Button onClick={handleTestEvent} variant="primary">
                    Send Test Event ({testCount} sent)
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    Sends a button click event with metadata
                  </p>
                </div>

                <div className="grid gap-2 md:grid-cols-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFeatureTest('file-upload')}
                  >
                    Track File Upload
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFeatureTest('api-call')}
                  >
                    Track API Call
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFeatureTest('dark-mode')}
                  >
                    Track Dark Mode
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Implementation Examples</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Track Custom Events</h4>
                  <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-x-auto">
{`import { useAnalytics } from '@/hooks/use-analytics';

function MyComponent() {
  const { trackEvent } = useAnalytics();
  
  const handleAction = () => {
    trackEvent('custom_action', {
      category: 'engagement',
      value: 42,
    });
  };
}`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Track Page Views</h4>
                  <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-x-auto">
{`useEffect(() => {
  trackPageView('/dashboard', 'Dashboard');
}, []);`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Track Conversions</h4>
                  <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-x-auto">
{`trackSubscriptionEvent(
  'created',
  'professional',
  'free',
  29.00,
  'monthly'
);`}
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