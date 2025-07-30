import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { projects, sentryIntegrations } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    return NextResponse.json({ project: project[0] });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, environment, isActive } = body;

    const updatedProject = await db
      .update(projects)
      .set({
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(environment !== undefined && { environment }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(projects.id, params.projectId),
          eq(projects.userId, userId)
        )
      )
      .returning();

    if (updatedProject.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ project: updatedProject[0] });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First delete all related Sentry integrations
    await db
      .delete(sentryIntegrations)
      .where(eq(sentryIntegrations.projectId, params.projectId));

    // Then delete the project
    const deletedProject = await db
      .delete(projects)
      .where(
        and(
          eq(projects.id, params.projectId),
          eq(projects.userId, userId)
        )
      )
      .returning();

    if (deletedProject.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}