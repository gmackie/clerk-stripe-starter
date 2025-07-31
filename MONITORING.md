# Monitoring with Vercel Analytics

This application uses Vercel Analytics and Speed Insights for comprehensive monitoring of performance and user behavior.

## Features

- **Web Analytics**: Track page views, user behavior, and conversions
- **Speed Insights**: Monitor Core Web Vitals and performance metrics
- **Custom Events**: Track business-specific events and user actions
- **User Identification**: Associate analytics with authenticated users
- **API Monitoring**: Track API usage, response times, and errors
- **Real-time Dashboard**: View metrics in Vercel's dashboard

## Setup

### 1. Enable in Vercel Dashboard

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to the Analytics tab
3. Click "Enable Analytics"
4. Choose your plan (free tier includes 2,500 events/month)

### 2. Install Dependencies

The packages are already installed:
```bash
npm install @vercel/analytics @vercel/speed-insights
```

### 3. Configuration

Analytics is automatically configured in `src/providers/analytics-provider.tsx` and included in the root layout.

## What's Tracked

### Automatic Tracking

Vercel Analytics automatically tracks:
- Page views with paths
- Referrers and traffic sources
- Browser and device information
- Geographic location (country/region)
- Web Vitals (LCP, FID, CLS, TTFB)

### Custom Events

The application tracks these custom events:

#### User Events
- `sign_up` - New user registration
- `sign_in` - User login
- `page_viewed` - Manual page view tracking

#### Subscription Events
- `subscription_created` - New subscription
- `subscription_cancelled` - Cancellation
- `subscription_upgraded` - Plan upgrade
- `subscription_downgraded` - Plan downgrade

#### Interaction Events
- `button_clicked` - Button interactions
- `form_submitted` - Form completions
- `feature_used` - Feature usage

#### API Events
- `api_usage` - API endpoint calls
- `api_key_created` - New API key
- `api_key_deleted` - Key deletion

#### File Events
- `file_uploaded` - File uploads
- `file_deleted` - File deletions

#### Error Events
- `error_occurred` - Application errors
- `payment_failed` - Failed payments

## Usage Examples

### Client-Side Tracking

Use the `useAnalytics` hook in React components:

```typescript
import { useAnalytics } from '@/hooks/use-analytics';

function MyComponent() {
  const { trackEvent, trackButtonClick } = useAnalytics();
  
  const handleAction = () => {
    // Track custom event
    trackEvent('feature_used', {
      feature: 'dark-mode',
      enabled: true,
    });
    
    // Track button click
    trackButtonClick('toggle-dark-mode', 'Toggle Dark Mode');
  };
}
```

### Page View Tracking

```typescript
useEffect(() => {
  trackPageView('/dashboard', 'Dashboard');
}, []);
```

### Form Tracking

```typescript
const handleSubmit = async (data) => {
  try {
    await submitForm(data);
    trackFormSubmit('contact-form', true);
  } catch (error) {
    trackFormSubmit('contact-form', false);
    trackError('form-error', error.message);
  }
};
```

### Subscription Tracking

```typescript
// Track subscription changes
trackSubscriptionEvent(
  'upgraded',
  'professional',
  'starter',
  29.00,
  'monthly'
);
```

### Server-Side Tracking

Use server-side helpers in API routes:

```typescript
import { trackServerEvent, trackApiUsage } from '@/lib/analytics-server';

// Track API usage
await trackApiUsage(
  userId,
  '/api/data',
  'GET',
  200,
  responseTime
);

// Track custom server event
await trackServerEvent('webhook_processed', {
  source: 'stripe',
  event: 'payment_intent.succeeded',
});
```

## Viewing Analytics

### Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click on "Analytics" tab

Available views:
- **Overview**: Traffic, page views, visitors
- **Insights**: Top pages, referrers, devices
- **Web Vitals**: Performance metrics
- **Events**: Custom event tracking

### Development Dashboard

Access local analytics dashboard at `/analytics` in development:
- Test event tracking
- View implementation examples
- Monitor what's being tracked

## Custom Event Properties

When tracking events, include relevant properties:

```typescript
trackEvent('subscription_created', {
  // Required
  userId: 'user_123',
  plan: 'professional',
  
  // Recommended
  amount: 29.00,
  interval: 'monthly',
  source: 'pricing-page',
  
  // Optional
  coupon: 'SAVE20',
  trial: true,
});
```

## Performance Monitoring

### Speed Insights

Automatically tracks:
- **LCP** (Largest Contentful Paint)
- **FID** (First Input Delay)
- **CLS** (Cumulative Layout Shift)
- **TTFB** (Time to First Byte)
- **FCP** (First Contentful Paint)

### Optimization Tips

1. **Reduce Bundle Size**: Use dynamic imports
2. **Optimize Images**: Use Next.js Image component
3. **Cache API Responses**: Implement proper caching
4. **Lazy Load Components**: Load on demand

## Privacy & Compliance

### Data Collection

- No personally identifiable information (PII) in event names
- User IDs are hashed
- IP addresses are not stored
- Respects Do Not Track headers

### GDPR Compliance

- Analytics is cookie-free
- No cross-site tracking
- Data retained for 90 days
- Users can opt-out

### Implementation

```typescript
// Check for user consent
const hasConsent = getUserConsent();

if (hasConsent) {
  trackEvent('action', { ... });
}
```

## Best Practices

### 1. Event Naming

Use consistent, descriptive names:
- ✅ `subscription_upgraded`
- ✅ `file_upload_completed`
- ❌ `event1`
- ❌ `user_did_thing`

### 2. Property Values

Keep properties consistent:
```typescript
// Good
{ plan: 'professional', amount: 29.00 }

// Bad
{ plan: 'pro', price: '$29' }
```

### 3. Avoid Over-Tracking

- Track meaningful actions only
- Batch similar events
- Use sampling for high-volume events

### 4. Error Tracking

Always include error context:
```typescript
trackError('api_error', error.message, {
  endpoint: '/api/data',
  statusCode: 500,
  userId,
});
```

## Debugging

### Development Mode

Events are logged to console in development:
```
📊 Analytics Event: subscription_created {
  userId: 'user_123',
  plan: 'professional',
  amount: 29
}
```

### Vercel Analytics Debugger

1. Add `?_vercel_debug=1` to any URL
2. Open browser console
3. See all tracked events

### Common Issues

**Events Not Showing**
- Check if Analytics is enabled in Vercel
- Verify you're on a deployed URL (not localhost)
- Events may take a few minutes to appear

**Missing User Context**
- Ensure user is authenticated
- Check if `userId` is being passed

**Performance Impact**
- Analytics loads asynchronously
- Minimal impact on page performance
- Events are batched and sent efficiently

## Cost Management

### Free Tier
- 2,500 events/month
- 1 website
- 30-day data retention

### Pro Tier
- 100,000 events/month
- Unlimited websites
- 90-day data retention
- Custom events

### Enterprise
- Unlimited events
- Advanced filtering
- Data export
- Priority support

## Integration with Other Services

### Sentry
Error tracking complements analytics:
```typescript
Sentry.captureException(error);
trackError('critical_error', error.message);
```

### PostHog
Combine with feature flags:
```typescript
if (isFeatureEnabled('new-feature')) {
  trackFeatureUse('new-feature', 'enabled');
}
```

### Custom Dashboards

Export data via API for custom visualizations.