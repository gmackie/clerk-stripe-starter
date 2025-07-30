import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDb } from '@/db';
import { fileUploads } from '@/db/schema';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { eq, and } from 'drizzle-orm';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    
    // Get the file to ensure it belongs to the user
    const [file] = await db
      .select()
      .from(fileUploads)
      .where(and(eq(fileUploads.id, params.id), eq(fileUploads.userId, userId)));

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(file.cloudinaryPublicId, file.resourceType);

    // Delete from database
    await db
      .delete(fileUploads)
      .where(and(eq(fileUploads.id, params.id), eq(fileUploads.userId, userId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}