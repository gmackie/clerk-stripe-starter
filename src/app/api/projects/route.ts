import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { projects } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(projects.createdAt);

    return NextResponse.json({ projects: userProjects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, environment } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    // Generate a unique slug from the name
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    
    // Ensure slug is unique
    while (true) {
      const existing = await db
        .select()
        .from(projects)
        .where(eq(projects.slug, slug))
        .limit(1);
      
      if (existing.length === 0) break;
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newProject = await db
      .insert(projects)
      .values({
        id: crypto.randomUUID(),
        userId,
        name,
        slug,
        description,
        environment: environment || 'development',
      })
      .returning();

    return NextResponse.json({ project: newProject[0] });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}