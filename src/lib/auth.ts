import { db } from '@/db';
import { apiKeys, users, usageTracking } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashApiKey } from './api-keys';

export async function validateApiKey(authHeader: string | null): Promise<{
  isValid: boolean;
  userId?: string;
  error?: string;
}> {
  if (!authHeader) {
    return { isValid: false, error: 'No authorization header' };
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return { isValid: false, error: 'Invalid authorization format' };
  }

  const providedKey = parts[1];
  const hashedProvidedKey = hashApiKey(providedKey);

  try {
    const apiKey = await db
      .select({
        id: apiKeys.id,
        userId: apiKeys.userId,
      })
      .from(apiKeys)
      .where(eq(apiKeys.key, hashedProvidedKey))
      .limit(1);

    if (apiKey.length === 0) {
      return { isValid: false, error: 'Invalid API key' };
    }

    // Update last used timestamp
    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, apiKey[0].id));

    // Get the user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, apiKey[0].userId))
      .limit(1);

    if (user.length === 0) {
      return { isValid: false, error: 'User not found' };
    }

    return { isValid: true, userId: user[0].clerkId };
  } catch (error) {
    console.error('Error validating API key:', error);
    return { isValid: false, error: 'Internal error' };
  }
}

export async function trackApiUsage(
  userId: string,
  endpoint: string,
  responseTime: number,
  statusCode: number
) {
  try {
    await db.insert(usageTracking).values({
      id: crypto.randomUUID(),
      userId,
      endpoint,
      responseTime,
      statusCode,
    });
  } catch (error) {
    console.error('Error tracking API usage:', error);
  }
}