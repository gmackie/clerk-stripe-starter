# Setup Guide

This guide will help you get your SaaS application up and running quickly.

## Quick Start (Recommended)

Run our interactive setup wizard that handles everything:

```bash
npm run setup:all
```

This will:
1. Configure your environment variables
2. Set up Stripe products and prices
3. Seed demo data
4. Initialize your database

## Manual Setup

If you prefer to set up each component individually:

### 1. Basic Configuration

```bash
npm run setup
```

This interactive wizard will:
- Create your `.env.local` file
- Configure Clerk authentication
- Set up Stripe API keys
- Configure your database connection
- Generate security secrets

### 2. Stripe Products Setup

```bash
npm run setup:stripe
```

This will:
- Install Stripe CLI (if needed)
- Create subscription products in Stripe
- Set up webhook endpoints
- Update your `.env.local` with price IDs

### 3. Demo Data (Optional)

```bash
npm run setup:demo
```

Creates demo data including:
- Sample users with different subscription tiers
- API keys and usage data
- File uploads (if Cloudinary is configured)

Demo accounts created:
- `alice@example.com` - Pro plan subscriber
- `bob@example.com` - Starter plan subscriber
- `charlie@example.com` - Free tier user

### 4. Branding Customization

```bash
npm run setup:branding
```

Customize your app's:
- Name and description
- Logo and primary color
- Theme configuration

## Environment Variables

### Required Services

1. **Clerk** - Authentication
   - Sign up at: https://clerk.com
   - Create an application
   - Copy your API keys

2. **Stripe** - Payments
   - Sign up at: https://stripe.com
   - Get your API keys from the Dashboard
   - Create products or use our setup script

3. **Turso** - Database
   - Sign up at: https://turso.tech
   - Create a database
   - Copy your connection URL and auth token

### Optional Services

- **Upstash Redis** - Rate limiting
- **Sentry** - Error tracking
- **Resend** - Email notifications
- **Cloudinary** - File uploads
- **PostHog** - Analytics and feature flags
- **Inngest** - Background jobs

## Webhook Configuration

### Stripe Webhooks

1. **Development** (using Stripe CLI):
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

2. **Production**:
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

### Clerk Webhooks

1. Go to Clerk Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/clerk`
3. Select events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
4. Copy the signing secret to `CLERK_WEBHOOK_SECRET`

## Database Setup

After configuring your environment:

```bash
# Push schema to database
npm run db:push

# Open database studio (optional)
npm run db:studio
```

## Development

Start the development server:

```bash
npm run dev
```

Your app will be available at: http://localhost:3000

## Testing Payments

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Requires auth: `4000 0025 0000 3155`
- Declined: `4000 0000 0000 9995`

Use any future expiry date and any 3-digit CVC.

## Troubleshooting

### Common Issues

1. **"Missing environment variables"**
   - Ensure `.env.local` exists
   - Check all required variables are set
   - Restart your dev server

2. **"Database connection failed"**
   - Verify Turso credentials
   - Check if database is accessible
   - Run `npm run db:push`

3. **"Stripe webhook error"**
   - Ensure webhook secret is correct
   - Check Stripe CLI is running (dev)
   - Verify endpoint URL (production)

### Getting Help

- Check our [documentation](./docs)
- Review [example code](./src/app/api)
- Open an issue on GitHub

## Next Steps

1. ✅ Complete setup wizard
2. ✅ Configure webhooks
3. ✅ Test payment flow
4. 🚀 Start building your features!

## Security Checklist

Before going to production:

- [ ] Change all test API keys to live keys
- [ ] Set up proper webhook endpoints
- [ ] Enable rate limiting (Upstash Redis)
- [ ] Configure error tracking (Sentry)
- [ ] Set secure CORS policies
- [ ] Review authentication rules
- [ ] Test subscription flows
- [ ] Set up monitoring

Happy building! 🚀