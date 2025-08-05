# One-Click Deploy

Deploy your SaaS starter to your favorite platform with one click:

[![Deploy to Deploy to Vercel](https://img.shields.io/badge/Deploy%20to-Deploy%20to%20Vercel-000000?style=for-the-badge&logo=deploy%20to%20vercel&logoColor=white)](https://vercel.com/new/clone?repository=https%3A%2F%2Fgithub.com%2Fyourusername%2Fsaas-starter&env=NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY%2CCLERK_SECRET_KEY%2CNEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY%2CSTRIPE_SECRET_KEY%2CTURSO_DATABASE_URL%2CTURSO_AUTH_TOKEN%2CCRON_SECRET)

[![Deploy to Deploy to Netlify](https://img.shields.io/badge/Deploy%20to-Deploy%20to%20Netlify-00C7B7?style=for-the-badge&logo=deploy%20to%20netlify&logoColor=white)](https://app.netlify.com/start/deploy?repository=https%3A%2F%2Fgithub.com%2Fyourusername%2Fsaas-starter)

[![Deploy to Deploy on Railway](https://img.shields.io/badge/Deploy%20to-Deploy%20on%20Railway-0B0D0E?style=for-the-badge&logo=deploy%20on%20railway&logoColor=white)](https://railway.app/new/template?template=https%3A%2F%2Fgithub.com%2Fyourusername%2Fsaas-starter)

[![Deploy to Deploy to Render](https://img.shields.io/badge/Deploy%20to-Deploy%20to%20Render-46E3B7?style=for-the-badge&logo=deploy%20to%20render&logoColor=white)](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2Fyourusername%2Fsaas-starter)

## Platform-Specific Instructions

### Vercel
1. Click the deploy button above
2. Connect your GitHub account
3. Add the required environment variables
4. Deploy!

### Netlify
1. Click the deploy button above
2. Connect your GitHub account
3. Configure environment variables in site settings
4. Deploy!

### Railway
1. Click the deploy button above
2. Connect your GitHub account
3. Add environment variables in the Railway dashboard
4. Deploy!

### Render
1. Click the deploy button above
2. Connect your GitHub account
3. Configure environment variables
4. Deploy!

## Required Environment Variables

All platforms require these environment variables:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key
- `CLERK_SECRET_KEY` - Your Clerk secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `TURSO_DATABASE_URL` - Your Turso database URL
- `TURSO_AUTH_TOKEN` - Your Turso auth token
- `CRON_SECRET` - A random secret for cron jobs

## Post-Deployment Setup

After deploying:

1. Update your Clerk and Stripe webhook URLs to point to your new domain
2. Update your `.env.local` with production values
3. Run database migrations if needed
4. Test the payment flow with Stripe test mode

## Custom Domain

Most platforms support custom domains. Check their documentation for setup instructions:

- [Vercel Custom Domains](https://vercel.com/docs/concepts/projects/custom-domains)
- [Netlify Custom Domains](https://docs.netlify.com/domains-https/custom-domains/)
- [Railway Custom Domains](https://docs.railway.app/deploy/custom-domains)
- [Render Custom Domains](https://render.com/docs/custom-domains)
