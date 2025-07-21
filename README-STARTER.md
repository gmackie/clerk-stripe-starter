# Clerk + Stripe + Turso Starter Kit

A production-ready Next.js starter kit with Clerk authentication, Stripe payments, and Turso database.

## Features

- **Authentication**: Clerk for secure user authentication with social logins
- **Payments**: Stripe integration for subscription management
- **Database**: Turso (SQLite at the edge) with Drizzle ORM
- **UI**: Tailwind CSS for styling with reusable components
- **Type Safety**: Full TypeScript support
- **Ready Pages**: Landing, Pricing, Sign Up/In, Dashboard, Settings, Success, 404
- **Developer Experience**: 
  - Loading states and error handling
  - Toast notifications
  - SEO optimization with sitemap
  - API example endpoint with rate limiting
  - Responsive design
- **Advanced Features**:
  - API key generation and management
  - Rate limiting by subscription tier
  - Usage tracking and analytics
  - Billing history and invoice downloads
  - User profile management
  - Email notification preferences

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Clerk account
- Stripe account
- Turso account

### Setup

1. Clone this repository:
```bash
git clone <your-repo-url>
cd clerk-stripe-starter
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment variables:
```bash
cp .env.local.example .env.local
```

4. Configure your environment variables in `.env.local`:

**Clerk Configuration:**
- Go to [Clerk Dashboard](https://dashboard.clerk.com)
- Create a new application
- Copy your publishable and secret keys

**Stripe Configuration:**
- Go to [Stripe Dashboard](https://dashboard.stripe.com)
- Copy your publishable and secret keys
- Create products and price IDs for your subscription tiers
- Set up a webhook endpoint pointing to `/api/webhooks/stripe`
- Copy the webhook signing secret

**Turso Configuration:**
- Install Turso CLI: `curl -sSfL https://get.tur.so/install.sh | bash`
- Create a database: `turso db create my-saas-db`
- Get the database URL: `turso db show my-saas-db --url`
- Create an auth token: `turso db tokens create my-saas-db`

5. Push the database schema:
```bash
npm run db:push
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Protected dashboard
│   ├── pricing/           # Pricing page
│   ├── sign-in/           # Clerk sign in
│   └── sign-up/           # Clerk sign up
├── components/            # React components
│   ├── layout/           # Layout components (navbar, footer, wrapper)
│   ├── providers/        # Context providers
│   └── ui/               # UI components (button, spinner)
├── db/                    # Database schema and config
└── lib/                   # Utility functions
```

## Database Schema

The starter includes these tables:

- **users**: Stores user information synced from Clerk
- **subscriptions**: Tracks Stripe subscription details
- **apiKeys**: Manages API keys for external access
- **usageTracking**: Tracks API usage for analytics

## Webhooks

### Stripe Webhook
Configure in Stripe Dashboard:
- Endpoint: `https://yourdomain.com/api/webhooks/stripe`
- Events to listen:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

### Clerk Webhook (Optional)
Configure in Clerk Dashboard:
- Endpoint: `https://yourdomain.com/api/webhooks/clerk`
- Events to listen:
  - `user.created`
  - `user.updated`
  - `user.deleted`

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production
Make sure to update:
- `NEXT_PUBLIC_APP_URL` to your production URL
- All webhook endpoints to use your production domain

## Customization

### Adding New Subscription Tiers
1. Update `src/lib/pricing.ts` with new tier information
2. Create corresponding products and prices in Stripe
3. Add the price IDs to your environment variables

### Styling
- Modify `src/app/globals.css` for global styles
- Update Tailwind config in `tailwind.config.js`
- Component styles use Tailwind classes

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push database schema
- `npm run db:studio` - Open Drizzle Studio
- `npm run db:generate` - Generate database migrations

## Support

For issues and questions:
- Clerk: [docs.clerk.com](https://docs.clerk.com)
- Stripe: [stripe.com/docs](https://stripe.com/docs)
- Turso: [docs.turso.tech](https://docs.turso.tech)
- Next.js: [nextjs.org/docs](https://nextjs.org/docs)

## API Usage

The starter includes a fully functional API with authentication and rate limiting:

### Authentication Methods
1. **Session-based** (automatic when logged in)
2. **API Keys** (for external access)

### Example API Call
```bash
# With API key
curl -H "Authorization: Bearer sk_live_..." \
  https://yourdomain.com/api/example

# Response includes rate limit headers
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1234567890
```

### Rate Limits by Tier
- **Free**: 10 requests/minute
- **Starter**: 100 requests/minute
- **Professional**: 1,000 requests/minute
- **Enterprise**: 10,000 requests/minute

## User Settings

The `/settings` page provides:
- Profile management
- API key generation (up to 5 keys)
- Billing history and invoice downloads
- Email notification preferences
- Subscription management through Stripe portal

## Testing

For testing payments, use Stripe test card: 4242 4242 4242 4242 with any future expiry date and CVC.