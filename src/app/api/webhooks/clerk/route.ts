import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Webhook } from 'svix';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await req.text();
  const body = JSON.parse(payload);

  // Verify the webhook
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');
  
  let evt: any;
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 }
    );
  }

  if (!evt || !evt.type) {
    return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
  }

  try {
    switch (evt.type) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name } = evt.data;
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
        const { id, email_addresses, first_name, last_name } = evt.data;
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
        const { id } = evt.data;
        await db.update(users)
          .set({
            isActive: false,
            deletedAt: new Date(),
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