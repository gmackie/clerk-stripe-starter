import multer from 'multer';
import { NextRequest } from 'next/server';

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// Configure multer with file size and type restrictions
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedMimeTypes = [
      // Images
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      // Text
      'text/plain',
      'text/csv',
      // Video
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      // Audio
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
  },
});

// Helper to convert Next.js request to format multer can handle
export async function parseFormData(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    throw new Error('No file provided');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  
  return {
    buffer,
    originalname: file.name,
    mimetype: file.type,
    size: file.size,
  };
}