import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET current user profile
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get additional info from Clerk
    const clerkUser = await currentUser();

    return NextResponse.json({
      id: user[0].id,
      email: user[0].email,
      name: user[0].name,
      firstName: clerkUser?.firstName,
      lastName: clerkUser?.lastName,
      imageUrl: clerkUser?.imageUrl,
      createdAt: user[0].createdAt,
      subscription: {
        status: user[0].subscriptionStatus,
        priceId: user[0].priceId,
        tier: user[0].priceId?.includes('enterprise') ? 'enterprise' :
              user[0].priceId?.includes('pro') ? 'professional' :
              user[0].priceId?.includes('starter') ? 'starter' : 'free'
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PATCH update user profile
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { preferences, metadata } = body;

    // Update user in database
    const updateData: any = {
      updatedAt: new Date(),
    };
    
    if (preferences) {
      updateData.preferences = JSON.stringify(preferences);
    }
    
    if (metadata) {
      updateData.metadata = JSON.stringify(metadata);
    }
    
    const updatedUser = await db
      .update(users)
      .set(updateData)
      .where(eq(users.clerkId, userId))
      .returning();

    if (updatedUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser[0]
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}