import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projects, sentryIntegrations, apiKeys } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { hashApiKey } from '@/lib/api-keys';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Check for API key authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const providedKey = authHeader.substring(7);
    const hashedKey = hashApiKey(providedKey);

    // Validate API key
    const apiKey = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.key, hashedKey))
      .limit(1);

    if (apiKey.length === 0) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Update last used timestamp
    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, apiKey[0].id));

    // Get project by slug
    const project = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.slug, params.slug),
          eq(projects.userId, apiKey[0].userId)
        )
      )
      .limit(1);

    if (project.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get environment from query params
    const searchParams = request.nextUrl.searchParams;
    const environment = searchParams.get('environment') || project[0].environment;

    // Get Sentry integration for this project and environment
    const integration = await db
      .select()
      .from(sentryIntegrations)
      .where(
        and(
          eq(sentryIntegrations.projectId, project[0].id),
          eq(sentryIntegrations.environment, environment),
          eq(sentryIntegrations.isActive, true)
        )
      )
      .limit(1);

    if (integration.length === 0) {
      return NextResponse.json(
        { 
          error: 'No active Sentry integration found',
          project: params.slug,
          environment,
        },
        { status: 404 }
      );
    }

    // Return Sentry configuration
    return NextResponse.json({
      dsn: integration[0].dsn,
      environment: integration[0].environment,
      org: integration[0].org,
      project: integration[0].project,
      // Additional config that might be useful
      config: {
        tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
        replaysSessionSampleRate: environment === 'production' ? 0.1 : 1.0,
        replaysOnErrorSampleRate: 1.0,
      },
    });
  } catch (error) {
    console.error('Error fetching Sentry configuration:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Sentry configuration' },
      { status: 500 }
    );
  }
}