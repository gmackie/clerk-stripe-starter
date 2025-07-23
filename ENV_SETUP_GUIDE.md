# Environment Variables Setup Guide

This guide helps you add all the missing environment variables to your `.env.local` file.

## 📋 Quick Setup

Add these lines to your `.env.local` file:

```bash
# Stripe Price IDs (Already generated for you!)
NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_MONTHLY=price_1RnlVgIOlmtpIvHKsdzYltOQ
NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_YEARLY=price_1RnlVgIOlmtpIvHKcOgBYfJP
NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY=price_1RnlVgIOlmtpIvHKgsxPTDuu
NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY=price_1RnlVgIOlmtpIvHKJQYZ6mRa
NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_MONTHLY=price_1RnlVgIOlmtpIvHKt4H7TnAd
NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_YEARLY=price_1RnlVgIOlmtpIvHKkGK0wvUz

# Webhook Secrets (Get these from dashboards - see instructions below)
CLERK_WEBHOOK_SECRET=
STRIPE_WEBHOOK_SECRET=

# Optional: Upstash Redis (for rate limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## 🔑 Getting Webhook Secrets

### For Local Development (Without ngrok)

You can skip webhook secrets for local development! Use the development endpoints instead:
- `/api/dev/sync-user` - Manually sync Clerk user
- `/api/dev/create-subscription` - Create test subscriptions

### For Production or Full Local Testing

#### 1. Clerk Webhook Secret

**Option A: Using ngrok (Recommended for testing)**
```bash
# Start ngrok
ngrok http 3000

# In Clerk Dashboard:
1. Go to Webhooks
2. Add Endpoint
3. URL: https://YOUR-NGROK-URL.ngrok.io/api/webhooks/clerk
4. Select events: user.created, user.updated, user.deleted
5. Create and copy the signing secret
```

**Option B: Production deployment**
- Use your production URL instead of ngrok URL
- Same steps as above

#### 2. Stripe Webhook Secret

**Option A: Using Stripe CLI (Easiest)**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook signing secret shown
```

**Option B: Using ngrok**
```bash
# In Stripe Dashboard:
1. Go to Developers → Webhooks
2. Add endpoint
3. URL: https://YOUR-NGROK-URL.ngrok.io/api/webhooks/stripe
4. Select events:
   - checkout.session.completed
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
5. Add endpoint and copy the signing secret
```

## 🚀 Optional: Upstash Redis (For Rate Limiting)

Rate limiting works without Redis (returns success for all requests). To enable actual rate limiting:

1. Go to [Upstash Console](https://console.upstash.com)
2. Create a new Redis database (free tier available)
3. Copy the REST URL and token
4. Add to `.env.local`:
   ```bash
   UPSTASH_REDIS_REST_URL=https://YOUR-INSTANCE.upstash.io
   UPSTASH_REDIS_REST_TOKEN=YOUR-TOKEN
   ```

## ✅ Verification

After adding the variables, verify with:

```bash
# Run the test suite
npx tsx complete-e2e-test.ts
```

All optional variables should now show as configured!

## 🎯 What Each Variable Does

| Variable | Purpose | Required? |
|----------|---------|-----------|
| `STRIPE_PRICE_ID_*` | Maps subscription tiers to Stripe prices | Yes for payments |
| `CLERK_WEBHOOK_SECRET` | Validates Clerk webhook requests | No (use dev endpoints) |
| `STRIPE_WEBHOOK_SECRET` | Validates Stripe webhook requests | No (use dev endpoints) |
| `UPSTASH_REDIS_*` | Enables rate limiting | No (disabled if missing) |

## 💡 Development Tips

1. **Start without webhooks**: Use development endpoints for faster iteration
2. **Add webhooks later**: When you need real-time updates
3. **Redis is optional**: Rate limiting is disabled without it
4. **Price IDs are test mode**: Safe to use for development

## 🔄 Next Steps

After adding environment variables:
1. Restart your development server
2. Run `npx tsx complete-e2e-test.ts` to verify
3. Test the full user flow
4. Deploy to production when ready