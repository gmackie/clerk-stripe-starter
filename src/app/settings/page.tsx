'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ApiKeysManager } from '@/components/settings/api-keys';
import { ProfileForm } from '@/components/settings/profile-form';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  return (
    <PageWrapper>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="mt-2 text-gray-600">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="bg-white shadow rounded-lg">
            <Tabs defaultValue="profile" className="p-6">
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="api">API Keys</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <ProfileForm />
              </TabsContent>

              <TabsContent value="billing">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Billing & Subscription</h2>
                    <p className="text-sm text-gray-600 mb-4">
                      Manage your subscription, view invoices, and update payment methods.
                    </p>
                    <Button 
                      onClick={() => window.location.href = '/settings/billing'}
                      variant="primary"
                    >
                      Manage Billing
                    </Button>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-md font-medium mb-2">Quick Actions</h3>
                    <div className="space-y-2">
                      <Button 
                        variant="secondary" 
                        className="w-full justify-start"
                        onClick={() => window.location.href = '/pricing'}
                      >
                        View Plans & Pricing
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="w-full justify-start"
                        onClick={async () => {
                          const response = await fetch('/api/stripe/customer-portal', {
                            method: 'POST',
                          });
                          const { url } = await response.json();
                          if (url) window.location.href = url;
                        }}
                      >
                        Open Stripe Customer Portal
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notifications">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Email Notifications</h2>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        defaultChecked
                      />
                      <span className="ml-2 text-sm text-gray-700">Product updates</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        defaultChecked
                      />
                      <span className="ml-2 text-sm text-gray-700">Billing notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Marketing emails</span>
                    </label>
                  </div>
                  <Button className="mt-6" variant="secondary">
                    Save Preferences
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="api">
                <ApiKeysManager />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}