import { inngest } from '@/lib/inngest';
import { emailService } from '@/lib/email';
import { getDb } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Handle user onboarding steps
export const handleOnboardingStep = inngest.createFunction(
  {
    id: 'user-onboarding-step',
    name: 'Handle User Onboarding Step',
  },
  { event: 'user.onboarding.step' },
  async ({ event, step }) => {
    const { userId, step: onboardingStep, metadata } = event.data;

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

    // Handle different onboarding steps
    switch (onboardingStep) {
      case 'welcome':
        await step.run('send-welcome-email', async () => {
          if (user.email) {
            await emailService.sendWelcomeEmail({
              to: user.email,
              userFirstname: user.name?.split(' ')[0] || 'there',
            });
          }
          return { welcomeEmailSent: true };
        });

        // Schedule next onboarding step
        await step.run('schedule-profile-reminder', async () => {
          // Send profile completion reminder in 24 hours
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);

          await inngest.send({
            name: 'user.onboarding.step',
            data: {
              userId,
              step: 'profile',
            },
          }, {
            ts: tomorrow.getTime(),
          });

          return { profileReminderScheduled: true };
        });
        break;

      case 'profile':
        await step.run('check-profile-completion', async () => {
          // Check if profile is complete
          const profileComplete = user.name && user.preferences;
          
          if (!profileComplete && user.email) {
            // Send reminder email
            console.log(`Sending profile completion reminder to ${user.email}`);
          }

          return { profileComplete };
        });
        break;

      case 'team':
        await step.run('encourage-team-invites', async () => {
          // In a real app, you might check if they've invited team members
          console.log(`Encouraging team invites for user ${userId}`);
          return { teamReminderSent: true };
        });
        break;

      case 'complete':
        await step.run('mark-onboarding-complete', async () => {
          // Update user metadata to mark onboarding as complete
          const db = getDb();
          const currentMetadata = user.metadata ? JSON.parse(user.metadata) : {};
          
          await db
            .update(users)
            .set({
              metadata: JSON.stringify({
                ...currentMetadata,
                onboardingCompleted: true,
                onboardingCompletedAt: new Date().toISOString(),
              }),
              updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

          return { onboardingComplete: true };
        });
        break;
    }

    return { 
      success: true, 
      userId,
      step: onboardingStep,
      metadata,
    };
  }
);

// Check onboarding progress for users
export const checkOnboardingProgress = inngest.createFunction(
  {
    id: 'check-onboarding-progress',
    name: 'Check Onboarding Progress',
    // Run this as a cron job daily
  },
  { cron: '0 10 * * *' }, // 10 AM UTC daily
  async ({ step }) => {
    // Get users who haven't completed onboarding
    const incompleteUsers = await step.run('get-incomplete-users', async () => {
      const db = getDb();
      const allUsers = await db.select().from(users);
      
      return allUsers.filter(user => {
        const metadata = user.metadata ? JSON.parse(user.metadata) : {};
        return !metadata.onboardingCompleted;
      });
    });

    // Send reminders to incomplete users
    await step.run('send-reminders', async () => {
      const reminders = incompleteUsers.map(async (user) => {
        const metadata = user.metadata ? JSON.parse(user.metadata) : {};
        const daysSinceSignup = Math.floor(
          (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Only send reminders for users who signed up 3+ days ago
        if (daysSinceSignup >= 3 && user.email) {
          console.log(`Sending onboarding reminder to ${user.email}`);
          // In a real app, send appropriate reminder based on their progress
        }
      });

      await Promise.all(reminders);
      return { remindersProcessed: incompleteUsers.length };
    });

    return { 
      success: true,
      usersChecked: incompleteUsers.length,
    };
  }
);