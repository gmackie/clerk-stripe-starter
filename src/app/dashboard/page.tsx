'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Code, Key, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserData {
  subscription?: {
    status: string;
    plan: string;
  };
}

interface DashboardStats {
  projects: number;
  apiKeys: number;
  monthlyUsage: number;
}

export default function DashboardPage() {
  const { user } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [stats, setStats] = useState<DashboardStats>({ projects: 0, apiKeys: 0, monthlyUsage: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchStats();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/subscription');
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch projects count
      const projectsRes = await fetch('/api/projects');
      if (projectsRes.ok) {
        const { projects } = await projectsRes.json();
        setStats(prev => ({ ...prev, projects: projects.length }));
      }

      // Fetch API keys count
      const keysRes = await fetch('/api/keys');
      if (keysRes.ok) {
        const { keys } = await keysRes.json();
        setStats(prev => ({ ...prev, apiKeys: keys.length }));
      }

      // Fetch monthly usage
      const usageRes = await fetch('/api/user/usage?period=30d');
      if (usageRes.ok) {
        const { stats } = await usageRes.json();
        setStats(prev => ({ ...prev, monthlyUsage: stats.totalRequests }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
      });
      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Failed to open customer portal');
    } finally {
      setIsLoading(false);
    }
  };

  const testApiCall = async () => {
    try {
      const response = await fetch('/api/example');
      const data = await response.json();
      setApiResponse(JSON.stringify(data, null, 2));
      toast.success('API call successful!');
    } catch (error) {
      console.error('API test error:', error);
      toast.error('API call failed');
    }
  };

  return (
    <PageWrapper showFooter={false}>
      <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Welcome back, {user?.firstName || 'there'}!
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Projects</p>
                  <p className="text-2xl font-semibold">{stats.projects}</p>
                </div>
                <Code className="h-8 w-8 text-blue-500" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 w-full"
                onClick={() => window.location.href = '/projects'}
              >
                Manage Projects →
              </Button>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">API Keys</p>
                  <p className="text-2xl font-semibold">{stats.apiKeys}</p>
                </div>
                <Key className="h-8 w-8 text-green-500" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 w-full"
                onClick={() => window.location.href = '/settings?tab=api'}
              >
                Manage Keys →
              </Button>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monthly API Calls</p>
                  <p className="text-2xl font-semibold">{stats.monthlyUsage.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 w-full"
                onClick={() => window.location.href = '/settings?tab=usage'}
              >
                View Usage →
              </Button>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> {user?.primaryEmailAddress?.emailAddress}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Name:</span> {user?.fullName || 'Not set'}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900">Subscription Status</h2>
              <div className="mt-4">
                {userData?.subscription ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Status:</span>{' '}
                      <span className={`capitalize ${
                        userData.subscription.status === 'active' ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {userData.subscription.status}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Plan:</span> {userData.subscription.plan}
                    </p>
                    <Button
                      onClick={handleManageSubscription}
                      disabled={isLoading}
                      variant="secondary"
                      size="sm"
                      className="mt-4"
                    >
                      {isLoading ? 'Loading...' : 'Manage Subscription'}
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600">No active subscription</p>
                    <Button
                      onClick={() => window.location.href = '/pricing'}
                      size="sm"
                      className="mt-4"
                    >
                      View Plans
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              <div className="mt-4 space-y-2">
                <Button
                  onClick={() => window.location.href = '/pricing'}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                >
                  Upgrade Plan
                </Button>
                <Button
                  onClick={() => user?.update({})}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                >
                  Update Profile
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900">Getting Started</h2>
              <div className="mt-4 prose prose-sm text-gray-600">
                <p>
                  This is your dashboard where you can manage your account, subscription, and access
                  all the features of our platform.
                </p>
                <ul>
                  <li>Explore the different sections of your dashboard</li>
                  <li>Manage your subscription and billing</li>
                  <li>Access your API keys and documentation</li>
                  <li>View usage statistics and analytics</li>
                </ul>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900">API Example</h2>
              <p className="mt-2 text-sm text-gray-600">
                Test your API access with this example endpoint.
              </p>
              <Button
                onClick={testApiCall}
                size="sm"
                className="mt-4"
              >
                Test API Call
              </Button>
              {apiResponse && (
                <pre className="mt-4 overflow-auto rounded bg-gray-100 p-3 text-xs">
                  {apiResponse}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}