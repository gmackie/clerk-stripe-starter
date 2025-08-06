import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getDb } from '@/db';
import { webhooks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { WebhookManager } from '@/components/webhooks/webhook-manager';

export default async function WebhooksPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const db = getDb();
  const userWebhooks = await db.select().from(webhooks).where(eq(webhooks.userId, userId));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Webhook Management</h1>
        <p className="text-gray-600">
          Configure and manage webhooks for your integrations
        </p>
      </div>

      <WebhookManager 
        userId={userId} 
        initialWebhooks={userWebhooks}
      />
    </div>
  );
}