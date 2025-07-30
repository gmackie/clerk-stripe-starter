import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/components';
import WelcomeEmail from '@/emails/welcome';
import SubscriptionConfirmationEmail from '@/emails/subscription-confirmation';
import UsageAlertEmail from '@/emails/usage-alert';

export async function GET(
  request: NextRequest,
  { params }: { params: { template: string } }
) {
  const { template } = params;

  let html = '';

  switch (template) {
    case 'welcome':
      html = await render(WelcomeEmail({
        userFirstname: 'John',
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'}/sign-in`,
      }));
      break;

    case 'subscription-confirmation':
      html = await render(SubscriptionConfirmationEmail({
        userFirstname: 'John',
        planName: 'Professional',
        amount: '$29.00',
        interval: 'month',
        nextBillingDate: 'January 1, 2024',
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'}/dashboard`,
        manageUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'}/settings/billing`,
      }));
      break;

    case 'usage-alert':
      const isExceeded = request.nextUrl.searchParams.get('exceeded') === 'true';
      html = await render(UsageAlertEmail({
        userFirstname: 'John',
        usagePercentage: isExceeded ? 120 : 85,
        currentUsage: isExceeded ? 1200 : 850,
        limit: 1000,
        planName: 'Starter',
        upgradeUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'}/pricing`,
        usageUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'}/settings?tab=usage`,
      }));
      break;

    default:
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
  }

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}