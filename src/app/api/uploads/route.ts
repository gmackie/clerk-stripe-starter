import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDb } from '@/db';
import { fileUploads } from '@/db/schema';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { parseFormData } from '@/lib/upload-middleware';
import { nanoid } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the form data
    const fileData = await parseFormData(request);
    
    // Generate unique filename
    const fileExtension = fileData.originalname.split('.').pop();
    const filename = `${nanoid()}.${fileExtension}`;

    // Upload to Cloudinary
    const uploadResult: any = await uploadToCloudinary(fileData.buffer, {
      folder: `saas-starter/${userId}`,
      publicId: filename.split('.')[0],
    });

    // Save to database
    const db = getDb();
    const [newFile] = await db
      .insert(fileUploads)
      .values({
        id: nanoid(),
        userId,
        filename,
        originalName: fileData.originalname,
        mimeType: fileData.mimetype,
        size: fileData.size,
        cloudinaryPublicId: uploadResult.public_id,
        cloudinaryUrl: uploadResult.url,
        cloudinarySecureUrl: uploadResult.secure_url,
        resourceType: uploadResult.resource_type,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
        folder: `saas-starter/${userId}`,
      })
      .returning();

    return NextResponse.json({
      success: true,
      file: {
        id: newFile.id,
        filename: newFile.filename,
        originalName: newFile.originalName,
        url: newFile.cloudinarySecureUrl,
        size: newFile.size,
        mimeType: newFile.mimeType,
        createdAt: newFile.createdAt,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const files = await db
      .select()
      .from(fileUploads)
      .where((t) => t.userId === userId)
      .orderBy((t) => t.createdAt)
      .limit(100);

    return NextResponse.json({
      files: files.map((file) => ({
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        url: file.cloudinarySecureUrl,
        size: file.size,
        mimeType: file.mimeType,
        resourceType: file.resourceType,
        width: file.width,
        height: file.height,
        createdAt: file.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get files error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve files' },
      { status: 500 }
    );
  }
}