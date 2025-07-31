import { inngest } from '@/lib/inngest';
import { emailService } from '@/lib/email';
import { getDb } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Send welcome email after subscription created
export const handleSubscriptionCreated = inngest.createFunction(
  { id: 'subscription-created', name: 'Handle Subscription Created' },
  { event: 'user.subscription.created' },
  async ({ event }) => {
    const { userId, planName } = event.data;

    // Get user details
    const db = getDb();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user || !user.email) {
      throw new Error('User not found or email missing');
    }

    // Send subscription confirmation email
    await emailService.sendSubscriptionConfirmationEmail({
      to: user.email,
      userFirstname: user.name?.split(' ')[0] || 'there',
      planName,
      // These would come from Stripe in a real implementation
      amount: '$29.00',
      interval: 'month',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    });

    return { success: true, email: user.email };
  }
);

// Send warning email when approaching usage limit
export const handleUsageLimitWarning = inngest.createFunction(
  { id: 'usage-limit-warning', name: 'Send Usage Limit Warning' },
  { event: 'user.usage.limit.warning' },
  async ({ event }) => {
    const { userId, usage, limit, percentage } = event.data;

    // Get user details
    const db = getDb();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user || !user.email) {
      throw new Error('User not found or email missing');
    }

    // Send usage warning email
    await emailService.sendUsageAlertEmail({
      to: user.email,
      userFirstname: user.name?.split(' ')[0] || 'there',
      usagePercentage: percentage,
      currentUsage: usage,
      limit,
      isExceeded: false,
    });

    return { success: true, email: user.email };
  }
);

// Send email when usage limit exceeded
export const handleUsageLimitExceeded = inngest.createFunction(
  { id: 'usage-limit-exceeded', name: 'Send Usage Limit Exceeded Alert' },
  { event: 'user.usage.limit.exceeded' },
  async ({ event }) => {
    const { userId, usage, limit } = event.data;

    // Get user details
    const db = getDb();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user || !user.email) {
      throw new Error('User not found or email missing');
    }

    // Send usage exceeded email
    await emailService.sendUsageAlertEmail({
      to: user.email,
      userFirstname: user.name?.split(' ')[0] || 'there',
      usagePercentage: Math.round((usage / limit) * 100),
      currentUsage: usage,
      limit,
      isExceeded: true,
    });

    return { success: true, email: user.email };
  }
);