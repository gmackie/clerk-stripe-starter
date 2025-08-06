'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Activity,
  UserCheck,
  UserX,
  DollarSign,
  BarChart3,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { UserManagement } from './user-management';
import { RevenueChart } from './revenue-chart';
import { ApiUsageChart } from './api-usage-chart';

interface AdminDashboardProps {
  stats: {
    users: {
      totalUsers: number;
      activeUsers: number;
      deletedUsers: number;
    };
    subscriptions: {
      totalSubscriptions: number;
      activeSubscriptions: number;
      trialSubscriptions: number;
      canceledSubscriptions: number;
    };
    revenueByPlan: Array<{
      priceId: string;
      count: number;
    }>;
    apiUsage: Array<{
      date: string;
      calls: number;
      errors: number;
    }>;
  };
  recentUsers: Array<{
    id: string;
    email: string;
    name: string | null;
    createdAt: Date;
    subscription: {
      status: string | null;
      priceId: string | null;
    } | null;
  }>;
}

export function AdminDashboard({ stats, recentUsers }: AdminDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Trigger page refresh
    window.location.reload();
  };

  const calculateMRR = () => {
    // Calculate Monthly Recurring Revenue
    // This is a simplified calculation - in production, get actual prices from Stripe
    const priceMap: Record<string, number> = {
      'price_starter_monthly': 19,
      'price_pro_monthly': 49,
      'price_enterprise_monthly': 199,
      'price_starter_yearly': 190 / 12,
      'price_pro_yearly': 490 / 12,
      'price_enterprise_yearly': 1990 / 12,
    };

    return stats.revenueByPlan.reduce((total, plan) => {
      const monthlyPrice = priceMap[plan.priceId] || 0;
      return total + (monthlyPrice * plan.count);
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.users.activeUsers} active, {stats.users.deletedUsers} deleted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.subscriptions.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.subscriptions.trialSubscriptions} trials, {stats.subscriptions.canceledSubscriptions} canceling
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${calculateMRR().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              MRR based on active subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Usage (30d)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.apiUsage.reduce((sum, day) => sum + day.calls, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.apiUsage.reduce((sum, day) => sum + day.errors, 0)} errors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="usage">API Usage</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-4">
          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>
                Latest user registrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {user.name?.[0] || user.email[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.name || 'No name'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={user.subscription?.status === 'active' ? 'default' : 'secondary'}>
                        {user.subscription?.status || 'Free'}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(user.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Invite User
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Create Coupon
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <Badge variant="default">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Response Time</span>
                  <Badge variant="default">45ms avg</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Error Rate</span>
                  <Badge variant="outline">0.1%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Webhook Success</span>
                  <Badge variant="default">99.8%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="revenue">
          <RevenueChart revenueByPlan={stats.revenueByPlan} />
        </TabsContent>

        <TabsContent value="usage">
          <ApiUsageChart usageData={stats.apiUsage} />
        </TabsContent>
      </Tabs>
    </div>
  );
}