'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { getTierLimits, calculateOverageCharges } from '@/lib/pricing';

interface UsageData {
  usage: any[];
  stats: {
    totalRequests: number;
    avgResponseTime: number;
    successRate: number;
  };
  endpointStats: {
    endpoint: string;
    count: number;
    avgResponseTime: number;
  }[];
  chartData: {
    time: string;
    requests: number;
    avgResponseTime: number;
  }[];
  period: string;
}

export function UsageDashboard() {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [subscription, setSubscription] = useState<any>(null);
  const [monthlyUsage, setMonthlyUsage] = useState<number>(0);

  useEffect(() => {
    fetchUsageData();
    fetchSubscription();
    fetchMonthlyUsage();
  }, [period]);

  const fetchUsageData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/user/usage?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setUsageData(data);
      }
    } catch (error) {
      console.error('Error fetching usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/user/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const fetchMonthlyUsage = async () => {
    try {
      const response = await fetch('/api/user/usage?period=30d');
      if (response.ok) {
        const data = await response.json();
        setMonthlyUsage(data.stats.totalRequests);
      }
    } catch (error) {
      console.error('Error fetching monthly usage:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!usageData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No usage data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">API Usage Dashboard</h2>
        <p className="text-sm text-gray-600 mb-4">
          Monitor your API usage and performance metrics
        </p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        <Button
          variant={period === '24h' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setPeriod('24h')}
        >
          Last 24 Hours
        </Button>
        <Button
          variant={period === '7d' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setPeriod('7d')}
        >
          Last 7 Days
        </Button>
        <Button
          variant={period === '30d' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setPeriod('30d')}
        >
          Last 30 Days
        </Button>
        <Button
          variant={period === '90d' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setPeriod('90d')}
        >
          Last 90 Days
        </Button>
      </div>

      {/* Usage Limit Card */}
      {subscription && (
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-md font-semibold">Monthly API Usage</h3>
              <p className="text-sm text-gray-600">Current billing period</p>
            </div>
            
            {(() => {
              const tier = subscription.tier || 'free';
              const limits = getTierLimits(tier);
              const usage = monthlyUsage;
              const percentage = limits.apiCalls === -1 ? 0 : (usage / limits.apiCalls) * 100;
              const overage = limits.apiCalls === -1 ? 0 : Math.max(0, usage - limits.apiCalls);
              const overageCharges = calculateOverageCharges(tier, usage);
              
              return (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>
                        {usage.toLocaleString()} / {limits.apiCalls === -1 ? 'Unlimited' : limits.apiCalls.toLocaleString()} calls
                      </span>
                      <span className={percentage > 90 ? 'text-red-600 font-medium' : ''}>
                        {limits.apiCalls === -1 ? '∞' : `${percentage.toFixed(0)}%`}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          percentage > 100 ? 'bg-red-500' : percentage > 90 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>
                  </div>
                  
                  {overage > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-red-900">Usage Limit Exceeded</p>
                          <p className="text-red-700">
                            {overage.toLocaleString()} calls over limit • ${overageCharges.toFixed(2)} in overage charges
                          </p>
                          <p className="text-red-600 mt-1">
                            <a href="/pricing" className="underline">Upgrade your plan</a> to avoid overage charges
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {percentage > 80 && percentage <= 100 && overage === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-yellow-900">Approaching Usage Limit</p>
                          <p className="text-yellow-700">
                            You've used {percentage.toFixed(0)}% of your monthly allowance
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-semibold">
                {usageData.stats.totalRequests.toLocaleString()}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-semibold">
                {usageData.stats.avgResponseTime?.toFixed(0) || 0}ms
              </p>
            </div>
            <Clock className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-semibold">
                {usageData.stats.successRate?.toFixed(1) || 100}%
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
        </Card>
      </div>

      {/* Usage Chart */}
      <Card className="p-6">
        <h3 className="text-md font-semibold mb-4">Request Volume</h3>
        <div className="h-64 flex items-end justify-between gap-1">
          {usageData.chartData.length > 0 ? (
            usageData.chartData.map((data, index) => {
              const maxRequests = Math.max(...usageData.chartData.map(d => d.requests));
              const height = maxRequests > 0 ? (data.requests / maxRequests) * 100 : 0;
              return (
                <div
                  key={index}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 transition-colors rounded-t"
                  style={{ height: `${height}%` }}
                  title={`${data.time}: ${data.requests} requests`}
                />
              );
            })
          ) : (
            <div className="w-full text-center text-gray-500">
              No data for selected period
            </div>
          )}
        </div>
      </Card>

      {/* Endpoint Breakdown */}
      <Card className="p-6">
        <h3 className="text-md font-semibold mb-4">Endpoint Usage</h3>
        <div className="space-y-3">
          {usageData.endpointStats.length > 0 ? (
            usageData.endpointStats.slice(0, 5).map((endpoint, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">{endpoint.endpoint}</p>
                  <p className="text-xs text-gray-500">
                    {endpoint.count} requests • {endpoint.avgResponseTime?.toFixed(0) || 0}ms avg
                  </p>
                </div>
                <div className="w-32">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(endpoint.count / usageData.stats.totalRequests) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No endpoint data available</p>
          )}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-md font-semibold mb-4">Recent API Calls</h3>
        <div className="space-y-2">
          {usageData.usage.length > 0 ? (
            usageData.usage.slice(0, 10).map((call, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      call.statusCode < 400 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <span className="font-mono">{call.endpoint}</span>
                </div>
                <div className="flex items-center gap-4 text-gray-500">
                  <span>{call.responseTime}ms</span>
                  <span>{new Date(call.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No recent activity</p>
          )}
        </div>
      </Card>
    </div>
  );
}