# Feature Flags with PostHog

This application uses PostHog for feature flag management and analytics. Feature flags allow you to control feature rollout, A/B test, and manage experimental features.

## Features

- **Type-safe feature flags**: All flags defined in central configuration
- **Client & server support**: Use flags in React components and API routes
- **User targeting**: Enable features for specific users or segments
- **Analytics integration**: Track feature usage automatically
- **A/B testing**: Run experiments with percentage rollouts
- **Development dashboard**: Monitor flags at `/feature-flags` in dev mode

## Setup

### 1. Create PostHog Account

1. Sign up at [posthog.com](https://posthog.com)
2. Create a new project
3. Navigate to Project Settings to get your API key

### 2. Configure Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_POSTHOG_KEY=phk_xxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### 3. Create Feature Flags in PostHog

1. Go to Feature Flags in your PostHog dashboard
2. Click "New Feature Flag"
3. Use the exact flag name from `src/lib/feature-flags.ts`
4. Configure rollout conditions

## Available Feature Flags

### UI Features
- `new-dashboard-design` - Modern dashboard UI
- `dark-mode` - Dark theme support
- `advanced-analytics` - Enhanced analytics features

### Billing Features
- `usage-based-billing` - Pay per use model (enabled by default)
- `annual-discount` - Annual subscription discounts
- `crypto-payments` - Cryptocurrency payment support

### API Features
- `api-v2` - New API version
- `rate-limit-increase` - Increased API rate limits
- `webhook-filtering` - Filter webhooks by type

### File Features
- `large-file-uploads` - Support files > 10MB
- `video-processing` - Video transcoding
- `ai-image-analysis` - AI-powered image tagging

### Experimental Features
- `beta-features` - Access to beta features
- `ai-assistant` - AI-powered assistant
- `realtime-collaboration` - Real-time features

### Performance Features
- `edge-caching` - Edge caching
- `lazy-loading` - Component lazy loading

### Security Features
- `two-factor-auth` - 2FA authentication
- `audit-logs` - Detailed audit logging

## Usage Examples

### Client-Side (React Components)

```typescript
import { useFeatureFlag } from '@/hooks/use-feature-flag';
import { FEATURE_FLAGS } from '@/lib/feature-flags';

function MyComponent() {
  const isDarkModeEnabled = useFeatureFlag(FEATURE_FLAGS.DARK_MODE);
  
  return (
    <div className={isDarkModeEnabled ? 'dark' : 'light'}>
      {/* Component content */}
    </div>
  );
}
```

### Multiple Flags

```typescript
function PricingPage() {
  const hasAnnualDiscount = useFeatureFlag(FEATURE_FLAGS.ANNUAL_DISCOUNT);
  const hasCryptoPayments = useFeatureFlag(FEATURE_FLAGS.CRYPTO_PAYMENTS);
  
  return (
    <div>
      {hasAnnualDiscount && <AnnualDiscountBanner />}
      {hasCryptoPayments && <CryptoPaymentOption />}
    </div>
  );
}
```

### Server-Side (API Routes)

```typescript
import { isFeatureEnabled } from '@/lib/posthog';
import { FEATURE_FLAGS } from '@/lib/feature-flags';

export async function GET(request: Request) {
  const userId = await getUserId();
  
  // Check single flag
  const hasNewApi = await isFeatureEnabled(
    userId,
    FEATURE_FLAGS.API_V2
  );
  
  if (hasNewApi) {
    return handleV2Request();
  }
  return handleV1Request();
}
```

### Middleware Integration

```typescript
// Already implemented in api-middleware.ts
const hasRateLimitIncrease = await isFeatureEnabled(
  userId,
  FEATURE_FLAGS.RATE_LIMIT_INCREASE
);

// Users with flag get higher rate limits
```

## Feature Flag Patterns

### Progressive Rollout

```typescript
// In PostHog dashboard:
// 1. Start with 10% rollout
// 2. Monitor metrics
// 3. Increase to 50%, then 100%
```

### User Targeting

```typescript
// Target specific users in PostHog:
// - By email domain
// - By subscription tier
// - By geographic location
// - By custom properties
```

### A/B Testing

```typescript
function HomePage() {
  const newDesign = useFeatureFlag(FEATURE_FLAGS.NEW_DASHBOARD_DESIGN);
  
  // Track conversion
  const { trackEvent } = usePostHogTracking();
  
  const handleAction = () => {
    trackEvent('conversion', {
      variant: newDesign ? 'new' : 'old'
    });
  };
}
```

## Best Practices

### 1. Naming Convention

Use kebab-case and descriptive names:
- ✅ `dark-mode`
- ✅ `api-v2`
- ❌ `feature1`
- ❌ `test_flag`

### 2. Default Values

Always provide sensible defaults in `FEATURE_FLAG_DEFAULTS`:

```typescript
export const FEATURE_FLAG_DEFAULTS: Record<FeatureFlag, boolean> = {
  [FEATURE_FLAGS.DARK_MODE]: false, // Safe default
  [FEATURE_FLAGS.LAZY_LOADING]: true, // Performance benefit
};
```

### 3. Cleanup Old Flags

Remove flags after full rollout:
1. Set flag to 100% in PostHog
2. Monitor for 2 weeks
3. Remove flag checks from code
4. Archive flag in PostHog

### 4. Feature Flag Lifecycle

1. **Development**: Test locally with flag
2. **Staging**: Enable for internal users
3. **Beta**: Roll out to beta users (10-20%)
4. **GA**: Gradual rollout (50% → 100%)
5. **Cleanup**: Remove flag code

## Monitoring

### PostHog Dashboard

Monitor feature flag performance:
- Usage statistics
- Error rates by variant
- Conversion metrics
- User feedback

### Custom Events

Track feature-specific events:

```typescript
const { trackEvent } = usePostHogTracking();

// Track feature usage
trackEvent('feature_used', {
  feature: 'ai-assistant',
  action: 'generate-text'
});

// Track errors
trackEvent('feature_error', {
  feature: 'video-processing',
  error: 'timeout'
});
```

## Development Tools

### Feature Flags Dashboard

Access at `/feature-flags` in development to:
- View all available flags
- See current flag states
- Get implementation examples

### Testing with Flags

```typescript
// In tests, mock feature flags
jest.mock('@/hooks/use-feature-flag', () => ({
  useFeatureFlag: (flag: string) => {
    const testFlags = {
      'dark-mode': true,
      'api-v2': false,
    };
    return testFlags[flag] ?? false;
  }
}));
```

## Troubleshooting

### Flags Not Working

1. Check PostHog API key is set
2. Verify flag name matches exactly
3. Ensure user is identified in PostHog
4. Check PostHog dashboard for flag status

### Performance Issues

- PostHog SDK is loaded asynchronously
- Flag values are cached locally
- Use `posthog.reloadFeatureFlags()` to force refresh

### User Identification

Ensure users are properly identified:

```typescript
// This is handled automatically in posthog-provider.tsx
posthog.identify(userId, {
  email: user.email,
  name: user.name,
});
```

## Security Considerations

1. **Don't expose sensitive features**: Use server-side checks for security features
2. **Validate on backend**: Always validate feature access on the server
3. **Rate limiting**: Feature flags shouldn't bypass security measures
4. **Audit logging**: Track who enables/disables features

## Cost Management

PostHog free tier includes:
- 1M events/month
- Unlimited feature flags
- 1 year data retention

Consider self-hosting for larger scale.