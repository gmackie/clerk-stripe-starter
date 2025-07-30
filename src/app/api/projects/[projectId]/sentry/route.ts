import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { projects, sentryIntegrations } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

// Simple encryption for auth tokens
const algorithm = 'aes-256-gcm';
const getKey = () => crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

function decrypt(encryptedData: string): string {
  const buffer = Buffer.from(encryptedData, 'base64');
  const iv = buffer.subarray(0, 16);
  const authTag = buffer.subarray(16, 32);
  const encrypted = buffer.subarray(32);
  const decipher = crypto.createDecipheriv(algorithm, getKey(), iv);
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted) + decipher.final('utf8');
}

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify project ownership
    const project = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, params.projectId),
          eq(projects.userId, userId)
        )
      )
      .limit(1);

    if (project.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get Sentry integrations for this project
    const integrations = await db
      .select()
      .from(sentryIntegrations)
      .where(eq(sentryIntegrations.projectId, params.projectId));

    // Don't send auth tokens to the client
    const sanitizedIntegrations = integrations.map(({ authToken, ...integration }) => ({
      ...integration,
      hasAuthToken: !!authToken,
    }));

    return NextResponse.json({ integrations: sanitizedIntegrations });
  } catch (error) {
    console.error('Error fetching Sentry integrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Sentry integrations' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify project ownership
    const project = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, params.projectId),
          eq(projects.userId, userId)
        )
      )
      .limit(1);

    if (project.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await request.json();
    const { dsn, org, project: sentryProject, authToken, environment } = body;

    if (!dsn || !org || !sentryProject || !environment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate DSN format
    try {
      new URL(dsn);
    } catch {
      return NextResponse.json(
        { error: 'Invalid DSN format' },
        { status: 400 }
      );
    }

    // Check if integration already exists for this environment
    const existing = await db
      .select()
      .from(sentryIntegrations)
      .where(
        and(
          eq(sentryIntegrations.projectId, params.projectId),
          eq(sentryIntegrations.environment, environment)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Sentry integration already exists for this environment' },
        { status: 409 }
      );
    }

    const newIntegration = await db
      .insert(sentryIntegrations)
      .values({
        id: crypto.randomUUID(),
        projectId: params.projectId,
        dsn,
        org,
        project: sentryProject,
        authToken: authToken ? encrypt(authToken) : null,
        environment,
      })
      .returning();

    // Don't send auth token back
    const { authToken: _, ...sanitizedIntegration } = newIntegration[0];

    return NextResponse.json({
      integration: {
        ...sanitizedIntegration,
        hasAuthToken: !!authToken,
      },
    });
  } catch (error) {
    console.error('Error creating Sentry integration:', error);
    return NextResponse.json(
      { error: 'Failed to create Sentry integration' },
      { status: 500 }
    );
  }
}