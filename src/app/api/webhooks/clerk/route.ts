import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body || !body.type) {
    return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
  }

  try {
    switch (body.type) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name } = body.data;
        const primaryEmail = email_addresses.find((e: { primary: boolean }) => e.primary)?.email_address;

        if (primaryEmail) {
          await db.insert(users).values({
            id: crypto.randomUUID(),
            clerkId: id,
            email: primaryEmail,
            name: `${first_name || ''} ${last_name || ''}`.trim() || null,
          });
        }
        break;
      }

      case 'user.updated': {
        const { id, email_addresses, first_name, last_name } = body.data;
        const primaryEmail = email_addresses.find((e: { primary: boolean }) => e.primary)?.email_address;

        if (primaryEmail) {
          await db.update(users)
            .set({
              email: primaryEmail,
              name: `${first_name || ''} ${last_name || ''}`.trim() || null,
              updatedAt: new Date(),
            })
            .where(eq(users.clerkId, id));
        }
        break;
      }

      case 'user.deleted': {
        const { id } = body.data;
        await db.update(users)
          .set({
            updatedAt: new Date(),
          })
          .where(eq(users.clerkId, id));
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Clerk webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}