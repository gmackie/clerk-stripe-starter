'use client';

import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function JobsPage() {
  const handleTestEvent = async (eventName: string) => {
    try {
      const response = await fetch('/api/test-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName }),
      });

      if (response.ok) {
        toast.success(`Test event "${eventName}" triggered`);
      } else {
        toast.error('Failed to trigger test event');
      }
    } catch (error) {
      console.error('Error triggering test event:', error);
      toast.error('Failed to trigger test event');
    }
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Jobs dashboard is only available in development
            </h1>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Activity className="h-8 w-8" />
              Background Jobs
            </h1>
            <p className="mt-2 text-gray-600">
              Monitor and test background jobs powered by Inngest
            </p>
          </div>

          <div className="grid gap-6 mb-8">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Inngest Dashboard</h2>
              <p className="text-gray-600 mb-4">
                View and manage your background jobs in the Inngest dashboard
              </p>
              <Button
                onClick={() => window.open('http://localhost:8288', '_blank')}
                variant="primary"
              >
                Open Inngest Dashboard
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Make sure the Inngest dev server is running
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Test Events</h2>
              <p className="text-gray-600 mb-4">
                Trigger test events to verify your background job handlers
              </p>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="font-medium">Subscription Events</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestEvent('subscription.created')}
                    className="w-full"
                  >
                    Test Subscription Created
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestEvent('trial.ending')}
                    className="w-full"
                  >
                    Test Trial Ending
                  </Button>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Usage Events</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestEvent('usage.warning')}
                    className="w-full"
                  >
                    Test Usage Warning
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestEvent('usage.exceeded')}
                    className="w-full"
                  >
                    Test Usage Exceeded
                  </Button>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">File Events</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestEvent('file.uploaded')}
                    className="w-full"
                  >
                    Test File Uploaded
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestEvent('file.process')}
                    className="w-full"
                  >
                    Test File Processing
                  </Button>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Other Events</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestEvent('payment.failed')}
                    className="w-full"
                  >
                    Test Payment Failed
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestEvent('onboarding.step')}
                    className="w-full"
                  >
                    Test Onboarding Step
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Job Types</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-gray-600">
                      Sends welcome emails, subscription confirmations, and usage alerts
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">File Processing</h3>
                    <p className="text-sm text-gray-600">
                      Generates thumbnails and extracts metadata from uploaded files
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <RefreshCw className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Scheduled Tasks</h3>
                    <p className="text-sm text-gray-600">
                      Daily onboarding progress checks and trial reminders
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Error Recovery</h3>
                    <p className="text-sm text-gray-600">
                      Handles failed payments and subscription issues with retries
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}