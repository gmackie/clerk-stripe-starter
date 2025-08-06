import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDb } from '@/db';
import { webhooks } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// PATCH /api/webhooks/[id] - Update webhook
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { active } = body;

    const db = getDb();
    const [updated] = await db
      .update(webhooks)
      .set({
        active: active ? 1 : 0,
        updatedAt: new Date(),
      })
      .where(and(eq(webhooks.id, params.id), eq(webhooks.userId, userId)))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...updated,
      events: JSON.parse(updated.events),
    });
  } catch (error) {
    console.error('Failed to update webhook:', error);
    return NextResponse.json(
      { error: 'Failed to update webhook' },
      { status: 500 }
    );
  }
}

// DELETE /api/webhooks/[id] - Delete webhook
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getDb();
    const [deleted] = await db
      .delete(webhooks)
      .where(and(eq(webhooks.id, params.id), eq(webhooks.userId, userId)))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete webhook:', error);
    return NextResponse.json(
      { error: 'Failed to delete webhook' },
      { status: 500 }
    );
  }
}