# Clerk & Stripe SaaS Starter Kit

A production-ready SaaS starter template with authentication, payments, and subscription management.

🚀 **Live Demo**: [https://starter.gmac.io](https://starter.gmac.io)

## Features

✅ **Authentication & User Management**
- Clerk authentication with email/social logins
- User profile management
- API key generation for external access

✅ **Payments & Subscriptions**
- Stripe integration for payments
- Multiple pricing tiers (Free, Starter, Pro, Enterprise)
- Subscription upgrades/downgrades
- Invoice history and billing management

✅ **Developer Experience**
- Next.js 15 with App Router
- TypeScript for type safety
- Tailwind CSS v4 for styling
- Turso database with Drizzle ORM
- Rate limiting with Upstash Redis (optional)

✅ **Production Ready**
- Webhook handling for Clerk & Stripe
- Development endpoints for local testing
- Comprehensive error handling
- Secure API middleware

## Quick Start

1. **Clone and install dependencies**
   ```bash
   git clone https://ci.gmac.io/mackieg/clerk-stripe-starter.git
   cd clerk-stripe-starter
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your keys
   ```

3. **Set up the database**
   ```bash
   npm run db:push
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## Environment Variables

Required environment variables:
- **Clerk**: Authentication keys and webhook secret
- **Stripe**: API keys, webhook secret, and price IDs
- **Turso**: Database URL and auth token
- **Redis** (optional): Upstash credentials for rate limiting

See `.env.local.example` for a complete list.

## Deployment

This project is set up for automated deployment to Kubernetes:

```bash
./quick-deploy.sh
```

This will:
1. Create a Gitea repository
2. Add all required secrets
3. Deploy to your K3s cluster
4. Configure SSL automatically

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
├── db/              # Database schema and config
├── lib/             # Utility functions and configs
└── middleware.ts    # Auth middleware
```

## Key Features

### Authentication
- Email and social login via Clerk
- Protected routes with middleware
- User profile management

### Payments
- Stripe Checkout for subscriptions
- Customer portal for billing management
- Webhook handling for payment events

### API
- Rate-limited API endpoints
- API key authentication
- Usage tracking per user

### Developer Tools
- Development endpoints for testing
- Comprehensive logging
- TypeScript throughout

## Documentation

For detailed documentation, see:
- [Deployment Guide](./DEPLOYMENT.md)
- [API Documentation](./src/app/api/README.md)
- [Database Schema](./src/db/schema.ts)

## License

MIT