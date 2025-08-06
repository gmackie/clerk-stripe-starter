import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDb } from '@/db';
import { webhooks, webhookLogs } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// GET /api/webhooks/[id]/logs - Get webhook logs
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getDb();
    
    // Verify webhook ownership
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

    // Get logs
    const logs = await db
      .select()
      .from(webhookLogs)
      .where(eq(webhookLogs.webhookId, params.id))
      .orderBy(desc(webhookLogs.timestamp))
      .limit(50);

    // Parse payload JSON
    const logsWithParsedPayload = logs.map(log => ({
      ...log,
      payload: JSON.parse(log.payload),
    }));

    return NextResponse.json({ logs: logsWithParsedPayload });
  } catch (error) {
    console.error('Failed to fetch webhook logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}