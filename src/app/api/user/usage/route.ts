import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { usageTracking } from '@/db/schema';
import { eq, and, gte, sql, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '7d';
    const groupBy = searchParams.get('groupBy') || 'day';

    // Calculate start date based on period
    let startDate = new Date();
    switch (period) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Get usage data
    const usage = await db
      .select({
        endpoint: usageTracking.endpoint,
        timestamp: usageTracking.timestamp,
        responseTime: usageTracking.responseTime,
        statusCode: usageTracking.statusCode,
      })
      .from(usageTracking)
      .where(
        and(
          eq(usageTracking.userId, userId),
          gte(usageTracking.timestamp, startDate)
        )
      )
      .orderBy(desc(usageTracking.timestamp));

    // Get aggregated stats
    const stats = await db
      .select({
        totalRequests: sql<number>`count(*)`,
        avgResponseTime: sql<number>`avg(${usageTracking.responseTime})`,
        successRate: sql<number>`cast(sum(case when ${usageTracking.statusCode} < 400 then 1 else 0 end) as float) / count(*) * 100`,
      })
      .from(usageTracking)
      .where(
        and(
          eq(usageTracking.userId, userId),
          gte(usageTracking.timestamp, startDate)
        )
      );

    // Get endpoint breakdown
    const endpointStats = await db
      .select({
        endpoint: usageTracking.endpoint,
        count: sql<number>`count(*)`,
        avgResponseTime: sql<number>`avg(${usageTracking.responseTime})`,
      })
      .from(usageTracking)
      .where(
        and(
          eq(usageTracking.userId, userId),
          gte(usageTracking.timestamp, startDate)
        )
      )
      .groupBy(usageTracking.endpoint)
      .orderBy(sql`count(*) desc`);

    // Group data by time period for chart
    let chartData: any[] = [];
    
    if (groupBy === 'hour' && (period === '24h' || period === '7d')) {
      // Group by hour
      chartData = await db
        .select({
          time: sql<string>`strftime('%Y-%m-%d %H:00', ${usageTracking.timestamp}, 'unixepoch')`,
          requests: sql<number>`count(*)`,
          avgResponseTime: sql<number>`avg(${usageTracking.responseTime})`,
        })
        .from(usageTracking)
        .where(
          and(
            eq(usageTracking.userId, userId),
            gte(usageTracking.timestamp, startDate)
          )
        )
        .groupBy(sql`strftime('%Y-%m-%d %H:00', ${usageTracking.timestamp}, 'unixepoch')`)
        .orderBy(sql`strftime('%Y-%m-%d %H:00', ${usageTracking.timestamp}, 'unixepoch')`);
    } else {
      // Group by day
      chartData = await db
        .select({
          time: sql<string>`strftime('%Y-%m-%d', ${usageTracking.timestamp}, 'unixepoch')`,
          requests: sql<number>`count(*)`,
          avgResponseTime: sql<number>`avg(${usageTracking.responseTime})`,
        })
        .from(usageTracking)
        .where(
          and(
            eq(usageTracking.userId, userId),
            gte(usageTracking.timestamp, startDate)
          )
        )
        .groupBy(sql`strftime('%Y-%m-%d', ${usageTracking.timestamp}, 'unixepoch')`)
        .orderBy(sql`strftime('%Y-%m-%d', ${usageTracking.timestamp}, 'unixepoch')`);
    }

    return NextResponse.json({
      usage: usage.slice(0, 100), // Limit recent usage to 100 entries
      stats: stats[0] || {
        totalRequests: 0,
        avgResponseTime: 0,
        successRate: 100,
      },
      endpointStats,
      chartData,
      period,
    });
  } catch (error) {
    console.error('Error fetching usage data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    );
  }
}