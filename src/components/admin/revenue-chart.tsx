'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface RevenueChartProps {
  revenueByPlan: Array<{
    priceId: string;
    count: number;
  }>;
}

export function RevenueChart({ revenueByPlan }: RevenueChartProps) {
  // Price mapping - in production, fetch from Stripe
  const priceInfo: Record<string, { name: string; amount: number; interval: string }> = {
    'price_starter_monthly': { name: 'Starter', amount: 19, interval: 'month' },
    'price_starter_yearly': { name: 'Starter', amount: 190, interval: 'year' },
    'price_pro_monthly': { name: 'Pro', amount: 49, interval: 'month' },
    'price_pro_yearly': { name: 'Pro', amount: 490, interval: 'year' },
    'price_enterprise_monthly': { name: 'Enterprise', amount: 199, interval: 'month' },
    'price_enterprise_yearly': { name: 'Enterprise', amount: 1990, interval: 'year' },
  };

  const calculateRevenue = () => {
    const monthly = { total: 0, byPlan: {} as Record<string, number> };
    const yearly = { total: 0, byPlan: {} as Record<string, number> };

    revenueByPlan.forEach(({ priceId, count }) => {
      const info = priceInfo[priceId];
      if (!info) return;

      const revenue = info.amount * count;
      if (info.interval === 'month') {
        monthly.total += revenue;
        monthly.byPlan[info.name] = (monthly.byPlan[info.name] || 0) + revenue;
      } else {
        yearly.total += revenue;
        yearly.byPlan[info.name] = (yearly.byPlan[info.name] || 0) + revenue;
      }
    });

    return { monthly, yearly, mrr: monthly.total + (yearly.total / 12) };
  };

  const revenue = calculateRevenue();

  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenue.mrr.toFixed(2)}</div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">+12.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenue.yearly.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-2">
              From yearly subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Revenue Per User</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(revenue.mrr / revenueByPlan.reduce((sum, p) => sum + p.count, 0)).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Per active subscription
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Revenue by Plan</CardTitle>
              <CardDescription>
                Monthly and annual subscription revenue breakdown
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Monthly Plans */}
            <div>
              <h4 className="font-medium mb-3">Monthly Plans</h4>
              <div className="space-y-3">
                {Object.entries(revenue.monthly.byPlan).map(([plan, amount]) => {
                  const percentage = (amount / revenue.monthly.total) * 100;
                  return (
                    <div key={plan} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{plan}</Badge>
                        <span className="text-sm text-gray-500">
                          ${amount.toLocaleString()}/mo
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Annual Plans */}
            <div>
              <h4 className="font-medium mb-3">Annual Plans</h4>
              <div className="space-y-3">
                {Object.entries(revenue.yearly.byPlan).map(([plan, amount]) => {
                  const percentage = (amount / revenue.yearly.total) * 100;
                  return (
                    <div key={plan} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{plan}</Badge>
                        <span className="text-sm text-gray-500">
                          ${amount.toLocaleString()}/yr
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Growth Metrics */}
          <div className="mt-8 pt-6 border-t">
            <h4 className="font-medium mb-4">Growth Metrics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Churn Rate</p>
                <p className="text-xl font-semibold">2.3%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Net Revenue Retention</p>
                <p className="text-xl font-semibold">112%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Customer Lifetime Value</p>
                <p className="text-xl font-semibold">$2,340</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">CAC Payback</p>
                <p className="text-xl font-semibold">8.2 months</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}