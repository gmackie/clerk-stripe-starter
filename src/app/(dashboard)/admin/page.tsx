import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getDb } from '@/db';
import { users, subscriptions, apiUsage } from '@/db/schema';
import { desc, count, sql } from 'drizzle-orm';
import { AdminDashboard } from '@/components/admin/admin-dashboard';

// This would typically check if user is admin
async function isAdmin(userId: string) {
  // In production, check user role/permissions
  // For demo, check against admin list or metadata
  const adminIds = process.env.ADMIN_USER_IDS?.split(',') || [];
  return adminIds.includes(userId);
}

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  
  // Check admin permission
  const isUserAdmin = await isAdmin(userId);
  if (!isUserAdmin) redirect('/dashboard');

  const db = getDb();

  // Get statistics
  const [userStats] = await db
    .select({
      totalUsers: count(users.id),
      activeUsers: count(sql`CASE WHEN ${users.isActive} = 1 THEN 1 END`),
      deletedUsers: count(sql`CASE WHEN ${users.deletedAt} IS NOT NULL THEN 1 END`),
    })
    .from(users);

  const [subscriptionStats] = await db
    .select({
      totalSubscriptions: count(subscriptions.id),
      activeSubscriptions: count(sql`CASE WHEN ${subscriptions.status} = 'active' THEN 1 END`),
      trialSubscriptions: count(sql`CASE WHEN ${subscriptions.status} = 'trialing' THEN 1 END`),
      canceledSubscriptions: count(sql`CASE WHEN ${subscriptions.cancelAtPeriodEnd} = 1 THEN 1 END`),
    })
    .from(subscriptions);

  // Get revenue by plan
  const revenueByPlan = await db
    .select({
      priceId: subscriptions.stripePriceId,
      count: count(subscriptions.id),
    })
    .from(subscriptions)
    .where(sql`${subscriptions.status} = 'active'`)
    .groupBy(subscriptions.stripePriceId);

  // Get recent users
  const recentUsers = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.createdAt,
      subscription: {
        status: subscriptions.status,
        priceId: subscriptions.stripePriceId,
      },
    })
    .from(users)
    .leftJoin(subscriptions, sql`${users.id} = ${subscriptions.userId}`)
    .orderBy(desc(users.createdAt))
    .limit(10);

  // Get API usage stats
  const apiStats = await db
    .select({
      date: sql`DATE(${apiUsage.timestamp})`.as('date'),
      calls: count(apiUsage.id),
      errors: count(sql`CASE WHEN ${apiUsage.statusCode} >= 400 THEN 1 END`),
    })
    .from(apiUsage)
    .where(sql`${apiUsage.timestamp} >= datetime('now', '-30 days')`)
    .groupBy(sql`DATE(${apiUsage.timestamp})`)
    .orderBy(desc(sql`DATE(${apiUsage.timestamp})`));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">
          Monitor and manage your application
        </p>
      </div>

      <AdminDashboard
        stats={{
          users: userStats,
          subscriptions: subscriptionStats,
          revenueByPlan,
          apiUsage: apiStats,
        }}
        recentUsers={recentUsers}
      />
    </div>
  );
}