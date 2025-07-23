# Webhook Setup Guide

## Setting up Clerk Webhooks for Localhost

### 1. Start ngrok tunnel
Open a new terminal and run:
```bash
ngrok http 3000
```

You'll see output like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

### 2. Configure Clerk Webhook

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **Webhooks** in the left sidebar
4. Click **Add Endpoint**
5. Configure the webhook:
   - **Endpoint URL**: `https://YOUR-NGROK-URL.ngrok.io/api/webhooks/clerk`
   - **Events to listen**: Select these events:
     - `user.created`
     - `user.updated`
     - `user.deleted`
6. Click **Create**
7. After creation, copy the **Signing Secret** (starts with `whsec_`)

### 3. Update .env.local
Add the webhook secret to your `.env.local`:
```
CLERK_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

### 4. Restart your Next.js server
```bash
# Stop the server (Ctrl+C) and restart
npm run dev
```

## Setting up Stripe Webhooks for Localhost

### 1. Use Stripe CLI (Recommended)
Install Stripe CLI:
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from https://stripe.com/docs/stripe-cli
```

### 2. Login to Stripe
```bash
stripe login
```

### 3. Forward webhooks to localhost
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will show a webhook signing secret like:
```
Ready! Your webhook signing secret is whsec_xxx
```

### 4. Update .env.local
Add the Stripe webhook secret:
```
STRIPE_WEBHOOK_SECRET=whsec_YOUR_STRIPE_SECRET_HERE
```

### Alternative: Manual Stripe Webhook Setup

If you prefer using ngrok:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **Webhooks**
3. Click **Add endpoint**
4. Configure:
   - **Endpoint URL**: `https://YOUR-NGROK-URL.ngrok.io/api/webhooks/stripe`
   - **Events**: Select:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
5. Click **Add endpoint**
6. Copy the **Signing secret**

## Testing Webhooks

### Test Clerk Webhook
1. Sign up with a test email: `yourname+clerk_test@example.com`
2. Use verification code: `424242`
3. Check your server logs for webhook activity

### Test Stripe Webhook
If using Stripe CLI:
```bash
stripe trigger checkout.session.completed
```

Or manually:
1. Complete a test checkout with card `4242 4242 4242 4242`
2. Check server logs for webhook processing

## Troubleshooting

### Common Issues
1. **404 errors**: Ensure ngrok URL is correct and server is running
2. **401/403 errors**: Check webhook secrets in `.env.local`
3. **500 errors**: Check server logs for detailed error messages

### Verify Webhook Configuration
- Clerk: Check webhook logs in Clerk Dashboard → Webhooks → Your endpoint → Logs
- Stripe: Check webhook attempts in Stripe Dashboard → Developers → Webhooks → Your endpoint

### Local Testing Without Webhooks
For quick testing without webhooks, you can manually create users in the database:
1. Sign up normally through the UI
2. The Clerk SDK will create the session
3. Manually insert user record in database if webhook fails