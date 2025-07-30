'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mail, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const emailTypes = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    description: 'Sent when a new user signs up',
  },
  {
    id: 'subscription',
    name: 'Subscription Confirmation',
    description: 'Sent when a user subscribes to a paid plan',
  },
  {
    id: 'usage-warning',
    name: 'Usage Warning (80%)',
    description: 'Sent when user reaches 80% of their API limit',
  },
  {
    id: 'usage-exceeded',
    name: 'Usage Exceeded (100%+)',
    description: 'Sent when user exceeds their API limit',
  },
];

export default function EmailPreviewPage() {
  const [selectedType, setSelectedType] = useState('welcome');
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendTest = async () => {
    if (!testEmail) {
      toast.error('Please enter an email address');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          email: testEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Test email sent to ${testEmail}`);
      } else {
        toast.error(data.error || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email');
    } finally {
      setSending(false);
    }
  };

  const getPreviewUrl = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    switch (selectedType) {
      case 'welcome':
        return `${baseUrl}/emails/welcome`;
      case 'subscription':
        return `${baseUrl}/emails/subscription-confirmation`;
      case 'usage-warning':
      case 'usage-exceeded':
        return `${baseUrl}/emails/usage-alert`;
      default:
        return '';
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Mail className="h-8 w-8" />
              Email Templates
            </h1>
            <p className="mt-2 text-gray-600">
              Preview and test email templates used in the application
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Email Types</h2>
                <div className="space-y-2">
                  {emailTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedType === type.id
                          ? 'bg-blue-50 border-blue-200 border'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium">{type.name}</div>
                      <div className="text-sm text-gray-600">{type.description}</div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium mb-3">Send Test Email</h3>
                  <input
                    type="email"
                    placeholder="test@example.com"
                    className="w-full px-3 py-2 border rounded-md mb-3"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                  <Button
                    onClick={handleSendTest}
                    disabled={sending || !testEmail}
                    className="w-full"
                  >
                    {sending ? (
                      'Sending...'
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Test Email
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Note: Requires Resend API key to be configured
                  </p>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="p-0 overflow-hidden">
                <div className="bg-gray-100 px-6 py-3 border-b">
                  <h2 className="font-semibold">Preview</h2>
                </div>
                <div className="h-[800px]">
                  <iframe
                    src={getPreviewUrl()}
                    className="w-full h-full"
                    title="Email Preview"
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}