import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDb } from '@/db';
import { webhooks, webhookLogs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

// POST /api/webhooks/[id]/test - Send test webhook
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getDb();
    const [webhook] = await db
      .select()
      .from(webhooks)
      .where(and(eq(webhooks.id, params.id), eq(webhooks.userId, userId)));

    if (!webhook) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      );
    }

    // Create test payload
    const testPayload = {
      id: crypto.randomUUID(),
      type: 'test',
      service: webhook.service,
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook from your SaaS application',
        webhook_id: webhook.id,
      },
    };

    // Generate signature if webhook has a secret
    let headers: HeadersInit = {
      'Content-Type': 'application/json',
      'User-Agent': 'SaaS-Webhook/1.0',
    };

    if (webhook.secret) {
      const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(JSON.stringify(testPayload))
        .digest('hex');
      
      headers['X-Webhook-Signature'] = signature;
    }

    // Send the webhook
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(testPayload),
    });

    // Log the webhook attempt
    await db.insert(webhookLogs).values({
      id: crypto.randomUUID(),
      webhookId: webhook.id,
      event: 'test',
      payload: JSON.stringify(testPayload),
      status: response.status,
      error: response.ok ? null : `HTTP ${response.status}: ${response.statusText}`,
      timestamp: new Date(),
    });

    // Update webhook last triggered info
    await db
      .update(webhooks)
      .set({
        lastTriggered: new Date(),
        lastStatus: response.status,
      })
      .where(eq(webhooks.id, webhook.id));

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      message: response.ok 
        ? 'Test webhook sent successfully' 
        : `Webhook failed with status ${response.status}`,
    });
  } catch (error) {
    console.error('Failed to send test webhook:', error);
    return NextResponse.json(
      { error: 'Failed to send test webhook' },
      { status: 500 }
    );
  }
}