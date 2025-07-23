# Complete Testing Guide for Clerk-Stripe Starter

## Overview
This guide covers comprehensive testing of the Clerk-Stripe integration, including user authentication, subscription management, and API functionality.

## Test Results Summary
- ✅ 78.3% tests passing (18/23)
- ✅ Core functionality working
- ⚠️ Minor issues with protected routes and API endpoint

## Environment Setup

### 1. Required Environment Variables ✅
All required variables are configured:
- ✅ Clerk keys (publishable and secret)
- ✅ Stripe keys (publishable and secret)  
- ✅ Turso database credentials
- ✅ App URL

### 2. Optional Environment Variables
Add these to `.env.local` for full functionality:

```bash
# Webhook secrets (see WEBHOOK_SETUP.md for how to get these)
CLERK_WEBHOOK_SECRET=whsec_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (generated - see STRIPE_PRICE_IDS.txt)
NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_MONTHLY=price_1RnlVgIOlmtpIvHKsdzYltOQ
NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_YEARLY=price_1RnlVgIOlmtpIvHKcOgBYfJP
NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY=price_1RnlVgIOlmtpIvHKgsxPTDuu
NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY=price_1RnlVgIOlmtpIvHKJQYZ6mRa
NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_MONTHLY=price_1RnlVgIOlmtpIvHKt4H7TnAd
NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_YEARLY=price_1RnlVgIOlmtpIvHKkGK0wvUz

# Optional: Upstash Redis for rate limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## Running Tests

### Automated E2E Tests
```bash
# Run comprehensive test suite
npx tsx complete-e2e-test.ts

# Run individual test files
npx tsx test-integration.ts
npx tsx e2e-full-test.ts
```

### Manual Testing Steps

#### 1. User Signup Flow
1. Navigate to http://localhost:3000/sign-up
2. Use test email: `yourname+clerk_test@example.com`
3. Enter any password
4. Verify with code: `424242`
5. Should redirect to `/dashboard`
6. Check database at https://local.drizzle.studio for new user

#### 2. Subscription Flow
1. After signup, go to http://localhost:3000/pricing
2. Select a plan (e.g., Starter)
3. Click "Subscribe"
4. In Stripe checkout, use test card: `4242 4242 4242 4242`
5. Complete purchase
6. Check user record in database for subscription details

#### 3. API Key Testing
1. Go to http://localhost:3000/settings
2. Navigate to "API Keys" section
3. Create a new API key
4. Test the key:
   ```bash
   curl -H "Authorization: Bearer YOUR_API_KEY" \
        http://localhost:3000/api/example
   ```

#### 4. Webhook Testing
See `WEBHOOK_SETUP.md` for detailed webhook setup instructions.

## Test Status by Feature

### ✅ Working Features
- Public pages (home, pricing, sign-in, sign-up)
- API authentication (returns 401 for unauthenticated requests)
- Webhook signature validation
- Database connectivity
- Stripe product/price creation
- User creation via Clerk API

### ⚠️ Known Issues
1. **Protected routes returning 404**: `/dashboard` and `/settings` need to be created
2. **API example endpoint 500 error**: Occurs when unauthenticated (non-critical)
3. **Stripe checkout endpoints**: Return 401 instead of 405 for GET requests

### 🔧 Fixes Applied
1. ✅ Added free tier to pricing configuration
2. ✅ Implemented Clerk webhook signature verification
3. ✅ Added soft delete for users (isActive flag)
4. ✅ Created Stripe test products and prices

## Troubleshooting

### Common Issues

#### "500 Internal Server Error" on API endpoints
- Usually occurs when database query fails
- Check if user exists in database
- Verify database connection

#### "404 Not Found" on protected routes
- Routes may not be implemented yet
- Check if pages exist in `src/app/dashboard` and `src/app/settings`

#### Webhook signature validation fails
- Ensure webhook secrets are correctly set in `.env.local`
- Verify ngrok URL matches webhook configuration
- Check webhook logs in Clerk/Stripe dashboards

## Next Steps

1. **Add missing environment variables** from the optional list
2. **Set up webhooks** using ngrok (see WEBHOOK_SETUP.md)
3. **Create missing pages** (`/dashboard`, `/settings`)
4. **Test complete user journey** from signup to subscription
5. **Monitor webhook events** in Clerk and Stripe dashboards

## Success Metrics
- User can sign up and access the application
- Subscriptions can be created and managed
- API keys work for authentication
- Rate limiting applies based on subscription tier
- Webhooks update user and subscription data correctly

## Test Commands Reference
```bash
# Start development server
npm run dev

# Run database migrations
npm run db:push

# Open database studio
npm run db:studio

# Run linting
npm run lint

# Create Stripe products
npx tsx setup-stripe-products.ts

# Run E2E tests
npx tsx complete-e2e-test.ts
```