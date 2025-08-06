'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, AlertCircle, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface ApiUsageChartProps {
  usageData: Array<{
    date: string;
    calls: number;
    errors: number;
  }>;
}

export function ApiUsageChart({ usageData }: ApiUsageChartProps) {
  const totalCalls = usageData.reduce((sum, day) => sum + day.calls, 0);
  const totalErrors = usageData.reduce((sum, day) => sum + day.errors, 0);
  const errorRate = totalCalls > 0 ? (totalErrors / totalCalls) * 100 : 0;
  const avgCallsPerDay = totalCalls / Math.max(usageData.length, 1);

  // Find peak usage
  const peakDay = usageData.reduce((peak, day) => 
    day.calls > peak.calls ? day : peak
  , usageData[0] || { date: '', calls: 0, errors: 0 });

  // Calculate trend (compare last 7 days to previous 7 days)
  const recentDays = usageData.slice(0, 7);
  const previousDays = usageData.slice(7, 14);
  const recentAvg = recentDays.reduce((sum, d) => sum + d.calls, 0) / Math.max(recentDays.length, 1);
  const previousAvg = previousDays.reduce((sum, d) => sum + d.calls, 0) / Math.max(previousDays.length, 1);
  const trend = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total API Calls</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              {totalErrors} errors total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily Usage</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgCallsPerDay).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              API calls per day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              vs previous week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Usage Over Time</CardTitle>
              <CardDescription>
                Daily API calls and errors for the last 30 days
              </CardDescription>
            </div>
            <Select defaultValue="30d">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {/* Simple bar chart visualization */}
          <div className="space-y-3">
            {usageData.slice(0, 10).map((day) => {
              const percentage = (day.calls / Math.max(...usageData.map(d => d.calls))) * 100;
              const errorPercentage = day.calls > 0 ? (day.errors / day.calls) * 100 : 0;
              
              return (
                <div key={day.date} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {format(new Date(day.date), 'MMM d')}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-900 font-medium">
                        {day.calls.toLocaleString()} calls
                      </span>
                      {day.errors > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {day.errors} errors
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="relative w-full bg-gray-200 rounded-full h-6">
                    <div 
                      className="absolute top-0 left-0 bg-blue-500 h-full rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${percentage}%` }}
                    >
                      {percentage > 20 && (
                        <span className="text-xs text-white font-medium">
                          {day.calls}
                        </span>
                      )}
                    </div>
                    {errorPercentage > 0 && (
                      <div 
                        className="absolute top-0 right-0 bg-red-500 h-full rounded-r-full"
                        style={{ width: `${errorPercentage}%` }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Peak Usage Info */}
          {peakDay && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Peak Usage Day</p>
              <p className="text-sm text-blue-700">
                {format(new Date(peakDay.date), 'MMMM d, yyyy')} - {peakDay.calls.toLocaleString()} API calls
              </p>
            </div>
          )}

          {/* Endpoint Breakdown */}
          <div className="mt-6">
            <h4 className="font-medium mb-3">Top Endpoints</h4>
            <div className="space-y-2">
              {[
                { endpoint: '/api/user', calls: 12543, percentage: 35 },
                { endpoint: '/api/keys', calls: 8921, percentage: 25 },
                { endpoint: '/api/subscription', calls: 6432, percentage: 18 },
                { endpoint: '/api/upload', calls: 4321, percentage: 12 },
                { endpoint: '/api/webhooks', calls: 3567, percentage: 10 },
              ].map((endpoint) => (
                <div key={endpoint.endpoint} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {endpoint.endpoint}
                    </code>
                    <span className="text-sm text-gray-500">
                      {endpoint.calls.toLocaleString()} calls
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${endpoint.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-10 text-right">
                      {endpoint.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}