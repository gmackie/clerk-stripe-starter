# File Upload Integration with Cloudinary

This application includes file upload functionality powered by Cloudinary.

## Features

- **Drag & Drop Upload**: Intuitive file upload interface with drag-and-drop support
- **Multiple File Types**: Support for images, documents, videos, and audio files
- **File Management**: View, download, and delete uploaded files
- **Secure Storage**: Files stored securely in Cloudinary with user isolation
- **Size Limits**: 10MB file size limit with configurable restrictions
- **Image Optimization**: Automatic image optimization and transformation

## Setup

### 1. Create a Cloudinary Account

1. Go to [Cloudinary.com](https://cloudinary.com) and sign up
2. Navigate to your Dashboard to find your credentials
3. Note your Cloud Name, API Key, and API Secret

### 2. Configure Environment Variables

Add to your `.env.local`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Database Migration

Run the database push to create the file uploads table:

```bash
npm run db:push
```

## Usage

### Upload Files

Users can upload files from the Settings page under the "Files" tab:

1. Navigate to Settings → Files
2. Drag and drop files or click "Choose File"
3. Files are automatically uploaded to Cloudinary
4. File metadata is stored in the database

### API Endpoints

#### Upload File
```bash
POST /api/uploads
Content-Type: multipart/form-data

# Form data:
file: [binary file data]
```

#### List Files
```bash
GET /api/uploads
Authorization: Bearer [clerk-token]
```

#### Delete File
```bash
DELETE /api/uploads/[file-id]
Authorization: Bearer [clerk-token]
```

## File Types

Allowed MIME types:
- **Images**: jpeg, png, gif, webp, svg+xml
- **Documents**: pdf, doc, docx, xls, xlsx
- **Text**: plain text, csv
- **Video**: mp4, mpeg, quicktime
- **Audio**: mpeg, wav, ogg

## Storage Structure

Files are organized in Cloudinary with the following structure:
```
saas-starter/
  └── [user-id]/
      └── [file-id].[extension]
```

## Security

- Files are isolated by user ID
- API endpoints require authentication
- File access URLs are secure (HTTPS)
- Users can only access their own files

## Limits

Default limits (configurable):
- Maximum file size: 10MB
- Storage per user: Unlimited (consider adding limits)
- Concurrent uploads: 1 per request

## Image Transformations

Cloudinary automatically applies optimizations:
- Quality: Auto (balances quality and file size)
- Format: Auto (serves modern formats like WebP when supported)

To get transformed versions:
```javascript
import { getCloudinaryUrl } from '@/lib/cloudinary';

// Get thumbnail
const thumbnailUrl = getCloudinaryUrl(publicId, {
  width: 200,
  height: 200,
  crop: 'fill',
});

// Get optimized version
const optimizedUrl = getCloudinaryUrl(publicId, {
  quality: 80,
  format: 'webp',
});
```

## Cost Considerations

Cloudinary free tier includes:
- 25 GB storage
- 25 GB bandwidth/month
- 25,000 transformations/month

Monitor usage in your Cloudinary dashboard.

## Extending the Feature

### Add File Categories

Update the schema to include categories:
```typescript
category: text('category'), // 'document', 'image', 'video', etc.
```

### Add File Sharing

Implement sharing functionality:
```typescript
export const fileShares = sqliteTable('file_shares', {
  id: text('id').primaryKey(),
  fileId: text('file_id').references(() => fileUploads.id),
  sharedWithEmail: text('shared_with_email'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
});
```

### Add Storage Limits

Implement per-user storage limits based on subscription tier:
```typescript
const storageLimit = {
  free: 100 * 1024 * 1024,      // 100MB
  starter: 1 * 1024 * 1024 * 1024,  // 1GB
  professional: 10 * 1024 * 1024 * 1024, // 10GB
  enterprise: 100 * 1024 * 1024 * 1024,  // 100GB
};
```

### Add Virus Scanning

Integrate with a virus scanning service before accepting uploads.

## Troubleshooting

### Upload Fails

1. Check Cloudinary credentials are set correctly
2. Verify file size is under 10MB
3. Ensure file type is allowed
4. Check browser console for errors

### Files Not Displaying

1. Verify Cloudinary URLs are accessible
2. Check CORS settings if embedding in other domains
3. Ensure user is authenticated

### Performance Issues

1. Implement pagination for file lists
2. Use Cloudinary transformations for thumbnails
3. Consider CDN for frequently accessed files

## Best Practices

1. **Validate Files**: Always validate file types and sizes on the server
2. **Use Transformations**: Serve optimized versions for web display
3. **Clean Up**: Implement file retention policies
4. **Monitor Usage**: Track storage and bandwidth usage
5. **Backup Important Files**: Cloudinary is not a backup service