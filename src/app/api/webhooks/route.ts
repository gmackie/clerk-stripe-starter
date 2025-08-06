import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDb } from '@/db';
import { webhooks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// GET /api/webhooks - Get user's webhooks
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getDb();
    const userWebhooks = await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.userId, userId));

    // Parse events JSON
    const webhooksWithParsedEvents = userWebhooks.map(webhook => ({
      ...webhook,
      events: JSON.parse(webhook.events),
    }));

    return NextResponse.json(webhooksWithParsedEvents);
  } catch (error) {
    console.error('Failed to fetch webhooks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webhooks' },
      { status: 500 }
    );
  }
}

// POST /api/webhooks - Create a new webhook
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { service, url, events } = body;

    if (!service || !url || !events || events.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate a webhook secret
    const secret = `whsec_${crypto.randomBytes(24).toString('hex')}`;

    const db = getDb();
    const [webhook] = await db
      .insert(webhooks)
      .values({
        id: crypto.randomUUID(),
        userId,
        service,
        url,
        secret,
        events: JSON.stringify(events),
        active: 1,
      })
      .returning();

    return NextResponse.json({
      ...webhook,
      events: JSON.parse(webhook.events),
    });
  } catch (error) {
    console.error('Failed to create webhook:', error);
    return NextResponse.json(
      { error: 'Failed to create webhook' },
      { status: 500 }
    );
  }
}