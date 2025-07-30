import { Resend } from 'resend';
import WelcomeEmail from '@/emails/welcome';
import SubscriptionConfirmationEmail from '@/emails/subscription-confirmation';
import UsageAlertEmail from '@/emails/usage-alert';

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailService = {
  async sendWelcomeEmail({
    to,
    userFirstname,
  }: {
    to: string;
    userFirstname: string;
  }) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'SaaS Starter <onboarding@resend.dev>',
        to,
        subject: 'Welcome to SaaS Starter!',
        react: WelcomeEmail({
          userFirstname,
          loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-in`,
        }),
      });

      if (error) {
        console.error('Error sending welcome email:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return { success: false, error };
    }
  },

  async sendSubscriptionConfirmation({
    to,
    userFirstname,
    planName,
    amount,
    interval,
    nextBillingDate,
  }: {
    to: string;
    userFirstname: string;
    planName: string;
    amount: string;
    interval: string;
    nextBillingDate: string;
  }) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'SaaS Starter <billing@resend.dev>',
        to,
        subject: `Subscription Confirmed - ${planName} Plan`,
        react: SubscriptionConfirmationEmail({
          userFirstname,
          planName,
          amount,
          interval,
          nextBillingDate,
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
          manageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
        }),
      });

      if (error) {
        console.error('Error sending subscription confirmation:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Failed to send subscription confirmation:', error);
      return { success: false, error };
    }
  },

  async sendUsageAlert({
    to,
    userFirstname,
    usagePercentage,
    currentUsage,
    limit,
    planName,
  }: {
    to: string;
    userFirstname: string;
    usagePercentage: number;
    currentUsage: number;
    limit: number;
    planName: string;
  }) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'SaaS Starter <alerts@resend.dev>',
        to,
        subject: usagePercentage >= 100 
          ? '⚠️ API Usage Limit Exceeded' 
          : '⚠️ Approaching API Usage Limit',
        react: UsageAlertEmail({
          userFirstname,
          usagePercentage,
          currentUsage,
          limit,
          planName,
          upgradeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
          usageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=usage`,
        }),
      });

      if (error) {
        console.error('Error sending usage alert:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Failed to send usage alert:', error);
      return { success: false, error };
    }
  },

  async sendPasswordReset({
    to,
    userFirstname,
    resetUrl,
  }: {
    to: string;
    userFirstname: string;
    resetUrl: string;
  }) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'SaaS Starter <security@resend.dev>',
        to,
        subject: 'Reset Your Password',
        html: `
          <h2>Hi ${userFirstname},</h2>
          <p>You requested to reset your password. Click the link below to create a new password:</p>
          <p><a href="${resetUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p>This link will expire in 1 hour for security reasons.</p>
          <hr />
          <p style="color: #666; font-size: 14px;">The SaaS Starter Team</p>
        `,
      });

      if (error) {
        console.error('Error sending password reset:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Failed to send password reset:', error);
      return { success: false, error };
    }
  },
};