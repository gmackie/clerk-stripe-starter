import { inngest } from '@/lib/inngest';
import { emailService } from '@/lib/email';
import { getDb } from '@/db';
import { users, subscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Send reminder emails for expiring trials
export const sendTrialEndingReminder = inngest.createFunction(
  {
    id: 'trial-ending-reminder',
    name: 'Send Trial Ending Reminder',
  },
  { event: 'subscription.trial.ending' },
  async ({ event, step }) => {
    const { userId, subscriptionId, trialEndDate, daysRemaining } = event.data;

    // Get user and subscription details
    const userDetails = await step.run('get-user-details', async () => {
      const db = getDb();
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      const [subscription] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.id, subscriptionId));

      if (!user || !subscription) {
        throw new Error('User or subscription not found');
      }

      return { user, subscription };
    });

    // Send reminder email based on days remaining
    await step.run('send-reminder-email', async () => {
      const { user } = userDetails;
      
      if (!user.email) {
        throw new Error('User email not found');
      }

      // You would create a specific trial ending email template
      // For now, using the generic email service
      const subject = daysRemaining === 1 
        ? 'Your trial ends tomorrow!' 
        : `Your trial ends in ${daysRemaining} days`;

      // In a real implementation, you'd have a dedicated email template
      console.log(`Sending trial reminder to ${user.email}: ${subject}`);
      
      return { 
        email: user.email, 
        subject,
        daysRemaining 
      };
    });

    // Schedule follow-up reminders if needed
    if (daysRemaining > 1) {
      await step.run('schedule-next-reminder', async () => {
        // Schedule another reminder for tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        await inngest.send({
          name: 'subscription.trial.ending',
          data: {
            userId,
            subscriptionId,
            trialEndDate,
            daysRemaining: daysRemaining - 1,
          },
        }, {
          ts: tomorrow.getTime(),
        });

        return { nextReminderScheduled: true };
      });
    }

    return { success: true, daysRemaining };
  }
);

// Handle failed payment attempts
export const handleFailedPayment = inngest.createFunction(
  {
    id: 'handle-failed-payment',
    name: 'Handle Failed Payment',
  },
  { event: 'billing.invoice.payment_failed' },
  async ({ event, step }) => {
    const { userId, invoiceId, amount, attemptCount } = event.data;

    // Get user details
    const user = await step.run('get-user', async () => {
      const db = getDb();
      const [result] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!result) {
        throw new Error('User not found');
      }

      return result;
    });

    // Send payment failure notification
    await step.run('send-failure-notification', async () => {
      if (!user.email) {
        throw new Error('User email not found');
      }

      // In a real implementation, you'd have a payment failure email template
      console.log(`Sending payment failure notification to ${user.email}`);
      console.log(`Invoice: ${invoiceId}, Amount: ${amount}, Attempt: ${attemptCount}`);

      return { notificationSent: true };
    });

    // If this is the 3rd attempt, consider suspending the subscription
    if (attemptCount >= 3) {
      await step.run('handle-subscription-suspension', async () => {
        // Update subscription status to 'past_due' or 'suspended'
        const db = getDb();
        await db
          .update(users)
          .set({ 
            subscriptionStatus: 'past_due',
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));

        console.log(`Subscription marked as past_due for user ${userId}`);
        return { subscriptionSuspended: true };
      });
    }

    return { 
      success: true, 
      attemptCount,
      suspended: attemptCount >= 3,
    };
  }
);