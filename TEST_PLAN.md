# User Signup and Subscription Flow Test Plan

## Prerequisites
1. Set up environment variables in `.env.local`:
   - Clerk keys (publishable and secret)
   - Clerk webhook secret (from Clerk dashboard > Webhooks)
   - Stripe keys (publishable and secret)
   - Stripe webhook secret (from Stripe dashboard > Webhooks)
   - Stripe price IDs for each tier
   - Turso database credentials
   - App URL

2. Set up webhooks:
   - Clerk webhook endpoint: `https://your-domain.com/api/webhooks/clerk`
   - Stripe webhook endpoint: `https://your-domain.com/api/webhooks/stripe`

3. For local testing, use ngrok or similar:
   ```bash
   ngrok http 3000
   ```
   Update webhook URLs in both Clerk and Stripe dashboards.

## Test Flow

### 1. User Signup (Free Tier)
- [ ] Navigate to `/sign-up`
- [ ] Create a new account with email
- [ ] Verify redirect to `/dashboard`
- [ ] Check database: User should be created with:
  - `clerkId` populated
  - `email` populated
  - `isActive: true`
  - No subscription data

### 2. Upgrade to Paid Subscription
- [ ] From dashboard, click on pricing/upgrade
- [ ] Select a paid tier (Starter, Professional, or Enterprise)
- [ ] Click subscribe button
- [ ] Should redirect to Stripe checkout
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Complete checkout
- [ ] Verify redirect back to app
- [ ] Check database: User should have:
  - `stripeCustomerId` populated
  - `subscriptionId` populated
  - `subscriptionStatus: 'active'`
  - `priceId` matching selected tier

### 3. Access Subscription Features
- [ ] Navigate to `/settings`
- [ ] Verify billing section shows active subscription
- [ ] Test API key generation (should work for paid tiers)
- [ ] Test API rate limits match tier

### 4. Manage Subscription
- [ ] Click "Manage Subscription" in settings
- [ ] Should open Stripe customer portal
- [ ] Test canceling subscription
- [ ] Verify webhook updates database:
  - `subscriptionStatus: 'canceled'`
  - API access should revert to free tier limits

### 5. User Deletion
- [ ] Delete account from Clerk dashboard
- [ ] Verify database user record:
  - `isActive: false`
  - `deletedAt` populated
  - User data preserved for audit

## Webhook Testing

### Clerk Webhooks
Test these events manually from Clerk dashboard:
- [ ] `user.created` - Creates user in database
- [ ] `user.updated` - Updates user email/name
- [ ] `user.deleted` - Soft deletes user

### Stripe Webhooks
Test these events from Stripe dashboard or CLI:
- [ ] `checkout.session.completed` - Creates subscription
- [ ] `customer.subscription.updated` - Updates subscription
- [ ] `customer.subscription.deleted` - Cancels subscription

## API Testing

### With Clerk Session (logged in):
```bash
curl http://localhost:3000/api/example \
  -H "Cookie: [session-cookie]"
```

### With API Key:
```bash
curl http://localhost:3000/api/example \
  -H "Authorization: Bearer sk_live_..."
```

## Common Issues to Check

1. **Webhook Signature Errors**
   - Ensure webhook secrets match in `.env.local`
   - Check webhook URL is accessible (use ngrok for local)

2. **Database Not Updating**
   - Run `npm run db:push` after schema changes
   - Check Turso credentials are correct

3. **Subscription Not Activating**
   - Verify Stripe price IDs in `.env.local`
   - Check Stripe webhook is receiving events

4. **Rate Limiting Not Working**
   - Upstash Redis credentials needed
   - Check Redis connection

## Success Criteria
- [ ] User can sign up and access free tier
- [ ] User can upgrade to paid subscription
- [ ] Subscription features are accessible
- [ ] User can manage/cancel subscription
- [ ] Webhooks update database correctly
- [ ] API authentication works with both methods
- [ ] Rate limits apply based on subscription tier