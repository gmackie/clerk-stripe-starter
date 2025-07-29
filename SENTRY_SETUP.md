# Sentry Integration Setup

This application includes Sentry integration for error tracking, performance monitoring, and debugging.

## Features

- **Automatic Error Tracking**: All unhandled errors are automatically captured
- **User Context**: Errors include user information from Clerk authentication
- **Performance Monitoring**: Track API response times and transactions
- **Session Replay**: Record user sessions when errors occur
- **Custom Error Pages**: User-friendly error pages with Sentry integration
- **API Middleware Integration**: Automatic error capture for API routes
- **Source Maps**: Uploaded in production for better error debugging

## Setup Instructions

### 1. Create a Sentry Account

1. Go to [Sentry.io](https://sentry.io) and create an account
2. Create a new project (select "Next.js" as the platform)
3. Note your DSN from the project settings

### 2. Configure Environment Variables

Add these to your `.env.local`:

```env
# Sentry DSN (from your project settings)
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxx.ingest.sentry.io/xxxxx

# For source map uploads (optional but recommended)
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=your-auth-token

# Set a release version (optional)
NEXT_PUBLIC_SENTRY_RELEASE=1.0.0
```

### 3. Generate Sentry Auth Token

1. Go to Settings → Auth Tokens in Sentry
2. Create a new auth token with these scopes:
   - `project:releases`
   - `project:write`
   - `org:read`

### 4. Configure Sentry in Production

For production deployments, add these environment variables to your hosting platform:

```env
NEXT_PUBLIC_SENTRY_DSN=your-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-token
NODE_ENV=production
```

## Testing Sentry Integration

### 1. Test Error Capture

Visit `/api/test-sentry?error=true` to trigger a test error:

```bash
curl http://localhost:3000/api/test-sentry?error=true
```

### 2. Test Client-Side Errors

Add this temporary button to test client-side error capture:

```tsx
<button onClick={() => { throw new Error('Test client error'); }}>
  Test Error
</button>
```

### 3. Check Sentry Dashboard

1. Go to your Sentry project dashboard
2. You should see:
   - The test error with full stack trace
   - User context (if logged in)
   - Breadcrumbs leading to the error
   - Performance data

## Configuration Options

### Adjust Sample Rates

In `sentry.client.config.ts` and `sentry.server.config.ts`:

```ts
// Performance monitoring (0.1 = 10% of transactions)
tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

// Session replay (0.1 = 10% of sessions)
replaysSessionSampleRate: 0.1,
replaysOnErrorSampleRate: 1.0, // Always record on error
```

### Filter Errors

Add errors to ignore in the config files:

```ts
ignoreErrors: [
  'ResizeObserver loop limit exceeded',
  'Non-Error promise rejection captured',
  /Failed to fetch/,
  // Add your custom filters
],
```

### Custom Tags and Context

Add custom context in your code:

```ts
import * as Sentry from '@sentry/nextjs';

// Set custom tags
Sentry.setTag('feature', 'payment');

// Set custom context
Sentry.setContext('subscription', {
  tier: 'professional',
  status: 'active',
});

// Add breadcrumb
Sentry.addBreadcrumb({
  message: 'User clicked upgrade',
  category: 'ui',
  level: 'info',
});
```

## Production Considerations

### 1. Source Maps

Source maps are automatically uploaded during build if auth token is provided. They're hidden from users for security.

### 2. PII and Data Scrubbing

Sentry automatically scrubs sensitive data, but review:
- User emails and names are included by default
- Add custom scrubbing rules if needed
- Consider GDPR compliance

### 3. Performance Impact

- Sentry adds minimal overhead (~5-10ms)
- Session replay can impact performance on low-end devices
- Adjust sample rates based on your traffic

### 4. Error Budgets

Set up alerts in Sentry for:
- Error rate spikes
- New error types
- Performance degradation
- Specific error thresholds

## Debugging Tips

### Check if Sentry is Working

```ts
// In browser console
window.Sentry
```

### Manual Error Capture

```ts
try {
  // Your code
} catch (error) {
  Sentry.captureException(error, {
    tags: { location: 'manual-capture' },
    extra: { customData: 'value' },
  });
}
```

### Test in Development

Sentry is disabled in development by default. To test:

1. Temporarily enable in `sentry.server.config.ts`:
   ```ts
   enabled: true, // Remove the production check
   ```

2. Or set `NODE_ENV=production` temporarily

## Troubleshooting

### Errors Not Appearing

1. Check DSN is correct
2. Verify errors aren't filtered
3. Check browser console for Sentry errors
4. Ensure `NODE_ENV=production` in production

### Source Maps Not Working

1. Verify auth token has correct permissions
2. Check org and project names match
3. Ensure build process completes without errors

### Performance Issues

1. Reduce `tracesSampleRate`
2. Disable session replay
3. Use `beforeSend` to filter events

## Additional Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Best Practices](https://docs.sentry.io/product/best-practices/)
- [Performance Monitoring Guide](https://docs.sentry.io/product/performance/)
- [Session Replay Documentation](https://docs.sentry.io/product/session-replay/)