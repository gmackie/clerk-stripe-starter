# Claude Code Knowledge

This file contains important information about the codebase that Claude Code should know when working on this project.

## Project Overview
This is a SaaS starter kit with:
- Next.js 15 with App Router
- Clerk for authentication
- Stripe for payments and subscriptions
- Turso database with Drizzle ORM
- Tailwind CSS v4 for styling
- TypeScript for type safety

## Key Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run db:push` - Push database schema to Turso
- `npm run db:studio` - Open Drizzle Studio
- `npm run db:generate` - Generate database migrations
- `inngest dev` - Start Inngest dev server for background jobs (separate terminal)

## Important Files
- `.env.local` - Environment variables (copy from .env.local.example)
- `src/db/schema.ts` - Database schema definitions
- `src/lib/pricing.ts` - Pricing tier configuration
- `src/middleware.ts` - Clerk authentication middleware

## API Routes
- `/api/stripe/checkout-session` - Create Stripe checkout
- `/api/stripe/customer-portal` - Access Stripe customer portal
- `/api/stripe/verify-session` - Verify successful payment
- `/api/webhooks/stripe` - Stripe webhook handler
- `/api/webhooks/clerk` - Clerk webhook handler
- `/api/user/subscription` - Get user subscription status
- `/api/user/invoices` - Get billing history
- `/api/keys` - Manage API keys (GET, POST, DELETE)
- `/api/example` - Example API endpoint with rate limiting
- `/api/test-email` - Send test emails (dev only)
- `/api/uploads` - Upload and list files (GET, POST)
- `/api/uploads/[id]` - Delete specific file (DELETE)
- `/api/inngest` - Inngest webhook handler for background jobs
- `/api/test-job` - Trigger test background jobs (dev only)

## Environment Variables Required
- Clerk: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY
- Stripe: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
- Turso: TURSO_DATABASE_URL, TURSO_AUTH_TOKEN
- App: NEXT_PUBLIC_APP_URL
- Stripe Price IDs for each tier (see .env.local.example)
- Upstash Redis (optional): UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
- Sentry (optional): NEXT_PUBLIC_SENTRY_DSN, SENTRY_ORG, SENTRY_PROJECT, SENTRY_AUTH_TOKEN
- Resend (optional): RESEND_API_KEY
- Cloudinary (optional): CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

## Common Tasks
1. Adding new subscription tiers: Update `src/lib/pricing.ts`
2. Modifying database schema: Edit `src/db/schema.ts` then run `npm run db:push`
3. Adding protected routes: Update the route matcher in `src/middleware.ts`
4. Customizing UI: Components are in `src/components/`

## Testing Payments
Use Stripe test card: 4242 4242 4242 4242 with any future expiry date and CVC.

## New Features
- **Settings Page** (`/settings`) - User profile, billing, notifications, API keys, file uploads
- **API Key Management** - Generate and manage API keys for external access
- **Rate Limiting** - Different limits based on subscription tier (requires Upstash Redis)
- **Usage Tracking** - Track API usage in the database
- **Billing History** - View invoices and manage subscription
- **Email Integration** - Automated emails with Resend (welcome, subscription, usage alerts)
- **File Uploads** - Drag-and-drop file uploads with Cloudinary storage
- **Background Jobs** - Reliable job processing with Inngest (email notifications, file processing, scheduled tasks)

## API Authentication
API routes support two authentication methods:
1. Clerk session (when accessing from the app)
2. API keys (when accessing externally)

Example API call with key:
```bash
curl -H "Authorization: Bearer sk_live_..." https://yourdomain.com/api/example
```

## Rate Limits by Tier
- Free: 10 requests/minute
- Starter: 100 requests/minute  
- Professional: 1,000 requests/minute
- Enterprise: 10,000 requests/minute