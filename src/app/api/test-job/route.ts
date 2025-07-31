import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { inngest } from '@/lib/inngest';

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Test jobs only available in development' },
      { status: 403 }
    );
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { eventName } = await request.json();
    
    // Map test event names to actual Inngest events
    const eventMap: Record<string, () => Promise<void>> = {
      'subscription.created': async () => {
        await inngest.send({
          name: 'user.subscription.created',
          data: {
            userId: 'test-user-id',
            subscriptionId: 'test-sub-id',
            priceId: 'test-price-id',
            planName: 'Professional',
          },
        });
      },
      'trial.ending': async () => {
        await inngest.send({
          name: 'subscription.trial.ending',
          data: {
            userId: 'test-user-id',
            subscriptionId: 'test-sub-id',
            trialEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            daysRemaining: 3,
          },
        });
      },
      'usage.warning': async () => {
        await inngest.send({
          name: 'user.usage.limit.warning',
          data: {
            userId: 'test-user-id',
            usage: 850,
            limit: 1000,
            percentage: 85,
          },
        });
      },
      'usage.exceeded': async () => {
        await inngest.send({
          name: 'user.usage.limit.exceeded',
          data: {
            userId: 'test-user-id',
            usage: 1200,
            limit: 1000,
          },
        });
      },
      'file.uploaded': async () => {
        await inngest.send({
          name: 'user.file.uploaded',
          data: {
            userId: 'test-user-id',
            fileId: 'test-file-id',
            filename: 'test-image.jpg',
            size: 1024 * 1024, // 1MB
            mimeType: 'image/jpeg',
          },
        });
      },
      'file.process': async () => {
        await inngest.send({
          name: 'user.file.process',
          data: {
            userId: 'test-user-id',
            fileId: 'test-file-id',
            fileUrl: 'https://example.com/test.jpg',
            mimeType: 'image/jpeg',
            processingType: 'thumbnail',
          },
        });
      },
      'payment.failed': async () => {
        await inngest.send({
          name: 'billing.invoice.payment_failed',
          data: {
            userId: 'test-user-id',
            invoiceId: 'test-invoice-id',
            amount: 2900, // $29.00
            attemptCount: 1,
          },
        });
      },
      'onboarding.step': async () => {
        await inngest.send({
          name: 'user.onboarding.step',
          data: {
            userId: 'test-user-id',
            step: 'welcome',
          },
        });
      },
    };

    const handler = eventMap[eventName];
    if (!handler) {
      return NextResponse.json(
        { error: 'Unknown event name' },
        { status: 400 }
      );
    }

    await handler();

    return NextResponse.json({
      success: true,
      message: `Test event "${eventName}" sent to Inngest`,
    });
  } catch (error) {
    console.error('Error sending test event:', error);
    return NextResponse.json(
      { error: 'Failed to send test event' },
      { status: 500 }
    );
  }
}