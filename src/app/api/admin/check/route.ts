import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ isAdmin: false });
  }

  // Check if user is admin
  // In production, this would check user roles/permissions in database
  const adminIds = process.env.ADMIN_USER_IDS?.split(',') || [];
  const isAdmin = adminIds.includes(userId);

  return NextResponse.json({ isAdmin });
}