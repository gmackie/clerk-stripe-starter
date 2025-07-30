import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Upload file to Cloudinary
export async function uploadToCloudinary(
  file: Buffer,
  options: {
    folder?: string;
    publicId?: string;
    resourceType?: 'image' | 'video' | 'raw' | 'auto';
    allowedFormats?: string[];
    maxFileSize?: number;
  } = {}
) {
  const {
    folder = 'uploads',
    publicId,
    resourceType = 'auto',
    allowedFormats,
    maxFileSize = 10 * 1024 * 1024, // 10MB default
  } = options;

  // Check file size
  if (file.length > maxFileSize) {
    throw new Error(`File size exceeds limit of ${maxFileSize / 1024 / 1024}MB`);
  }

  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder,
      resource_type: resourceType,
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    if (allowedFormats) {
      uploadOptions.allowed_formats = allowedFormats;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(file);
  });
}

// Delete file from Cloudinary
export async function deleteFromCloudinary(publicId: string, resourceType: string = 'image') {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType as any,
    });
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
}

// Get file URL with transformations
export function getCloudinaryUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  } = {}
) {
  return cloudinary.url(publicId, {
    transformation: [options],
    secure: true,
  });
}