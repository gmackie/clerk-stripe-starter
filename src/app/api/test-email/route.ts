import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { emailService } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type = 'welcome', email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'welcome':
        result = await emailService.sendWelcomeEmail({
          to: email,
          userFirstname: 'Test User',
        });
        break;

      case 'subscription':
        result = await emailService.sendSubscriptionConfirmation({
          to: email,
          userFirstname: 'Test User',
          planName: 'Professional',
          amount: '$29.00',
          interval: 'month',
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        });
        break;

      case 'usage-warning':
        result = await emailService.sendUsageAlert({
          to: email,
          userFirstname: 'Test User',
          usagePercentage: 85,
          currentUsage: 850,
          limit: 1000,
          planName: 'Starter',
        });
        break;

      case 'usage-exceeded':
        result = await emailService.sendUsageAlert({
          to: email,
          userFirstname: 'Test User',
          usagePercentage: 120,
          currentUsage: 1200,
          limit: 1000,
          planName: 'Starter',
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid email type. Valid types: welcome, subscription, usage-warning, usage-exceeded' },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Test ${type} email sent successfully to ${email}`,
      data: result.data,
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}