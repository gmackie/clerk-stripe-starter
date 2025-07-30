# Sentry Integration Management

This application includes a built-in Sentry integration management system that allows users to manage Sentry DSNs for their projects.

## Features

- **Multi-Project Support**: Create and manage multiple projects
- **Environment-Specific Configurations**: Different Sentry DSNs for development, staging, and production
- **Secure Storage**: Auth tokens are encrypted before storage
- **API Access**: Retrieve Sentry configurations via API for your applications
- **Visual DSN Management**: Show/hide DSNs with copy functionality

## How It Works

### 1. Create a Project

Navigate to `/projects` and create a new project:
- Provide a name and optional description
- Select the default environment
- A unique slug is generated automatically

### 2. Add Sentry Integration

In the project detail page:
1. Click "Add Integration"
2. Enter your Sentry DSN from your Sentry project
3. Provide the organization and project slugs
4. Optionally add an auth token for source map uploads
5. Select the environment (development/staging/production)

### 3. Use in Your Application

Your applications can retrieve the Sentry configuration via API:

```bash
# Using an API key
curl -H "Authorization: Bearer your-api-key" \
  https://your-domain.com/api/integrations/sentry/your-project-slug?environment=production
```

Response:
```json
{
  "dsn": "https://xxxxx@xxx.ingest.sentry.io/xxxxx",
  "environment": "production",
  "org": "your-org",
  "project": "your-project",
  "config": {
    "tracesSampleRate": 0.1,
    "replaysSessionSampleRate": 0.1,
    "replaysOnErrorSampleRate": 1.0
  }
}
```

### 4. Client Implementation Example

In your Next.js application:

```typescript
// utils/sentry-config.ts
export async function fetchSentryConfig() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/integrations/sentry/${process.env.PROJECT_SLUG}?environment=${process.env.NODE_ENV}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.API_KEY}`
      }
    }
  );
  
  if (!response.ok) {
    console.warn('Failed to fetch Sentry configuration');
    return null;
  }
  
  return response.json();
}

// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';
import { fetchSentryConfig } from './utils/sentry-config';

(async () => {
  const config = await fetchSentryConfig();
  
  if (config) {
    Sentry.init({
      dsn: config.dsn,
      environment: config.environment,
      tracesSampleRate: config.config.tracesSampleRate,
      replaysSessionSampleRate: config.config.replaysSessionSampleRate,
      replaysOnErrorSampleRate: config.config.replaysOnErrorSampleRate,
    });
  }
})();
```

## Database Schema

### Projects Table
- `id`: Unique identifier
- `userId`: Owner's user ID
- `name`: Project name
- `slug`: URL-friendly unique identifier
- `description`: Optional description
- `environment`: Default environment
- `isActive`: Active status

### Sentry Integrations Table
- `id`: Unique identifier
- `projectId`: Associated project
- `dsn`: Sentry DSN
- `org`: Sentry organization slug
- `project`: Sentry project slug
- `authToken`: Encrypted auth token (optional)
- `environment`: Target environment
- `isActive`: Active status

## Security Considerations

1. **API Key Authentication**: All API requests require a valid API key
2. **Encryption**: Auth tokens are encrypted using AES-256-GCM
3. **Access Control**: Users can only access their own projects
4. **DSN Visibility**: DSNs are hidden by default in the UI

## Environment Variables

Add to your `.env.local`:

```env
# For encrypting sensitive data
ENCRYPTION_KEY=your-32-byte-key-here
```

Generate a secure key:
```bash
openssl rand -base64 32
```

## API Endpoints

### Projects Management
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/[projectId]` - Get project details
- `PATCH /api/projects/[projectId]` - Update project
- `DELETE /api/projects/[projectId]` - Delete project

### Sentry Integration
- `GET /api/projects/[projectId]/sentry` - List integrations
- `POST /api/projects/[projectId]/sentry` - Add integration
- `GET /api/integrations/sentry/[slug]` - Get config (for apps)

## Best Practices

1. **Environment Separation**: Use different DSNs for each environment
2. **Auth Tokens**: Only add auth tokens if you need source map uploads
3. **API Keys**: Create separate API keys for each application
4. **Regular Rotation**: Rotate auth tokens and API keys periodically
5. **Monitoring**: Monitor API usage to detect anomalies

## Troubleshooting

### DSN Not Found
- Verify the project slug is correct
- Check that the integration is active
- Ensure the environment parameter matches

### Invalid API Key
- Check that the API key is active
- Verify the Authorization header format
- Ensure the key belongs to the project owner

### Encryption Errors
- Verify ENCRYPTION_KEY is set correctly
- Check that the key hasn't changed
- Ensure the key is 32 bytes (base64 encoded)