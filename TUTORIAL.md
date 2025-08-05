# Getting Started Tutorial

Welcome to the SaaS Starter Kit! This tutorial will walk you through setting up your SaaS application from zero to production-ready in under 30 minutes.

## 🎯 What You'll Build

By the end of this tutorial, you'll have:
- A fully functional SaaS application
- User authentication with social logins
- Subscription payments with Stripe
- A working database with sample data
- Email notifications
- File upload capabilities
- Analytics and monitoring

## 📋 Prerequisites

Before you start, make sure you have:
- Node.js 18+ installed
- A GitHub account
- Basic knowledge of React/Next.js
- 30 minutes of your time

## 🚀 Step 1: Get the Code

Choose your preferred method:

### Option A: One-Click Deploy (Fastest)
1. Click one of these deploy buttons:
   - [Deploy to Vercel](https://vercel.com/new/clone?repository=https://github.com/yourusername/saas-starter)
   - [Deploy to Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/saas-starter)
2. Connect your GitHub account when prompted
3. Skip to Step 3 to configure your services

### Option B: Local Development
```bash
git clone https://github.com/yourusername/saas-starter.git
cd saas-starter
npm install
```

## 🔧 Step 2: Quick Setup (Local Only)

Run our interactive setup wizard:

```bash
npm run setup:all
```

This single command will:
1. ✅ Configure all environment variables
2. ✅ Set up Stripe products and pricing
3. ✅ Initialize your database
4. ✅ Seed demo data
5. ✅ Start your development server

**That's it!** Your SaaS is now running at `http://localhost:3000`

## 🔐 Step 3: Configure Authentication (Clerk)

1. **Create a Clerk account**: Visit [clerk.com](https://clerk.com) and sign up
2. **Create an application**: 
   - Choose "Next.js" as your framework
   - Copy your API keys
3. **Add your keys** (if using local setup):
   - The setup wizard already prompted for these
   - Or manually add to `.env.local`:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

### Test Authentication
1. Visit your app at `http://localhost:3000`
2. Click "Sign Up" and create an account
3. Try signing in with different providers (Google, GitHub, etc.)

## 💳 Step 4: Configure Payments (Stripe)

1. **Create a Stripe account**: Visit [stripe.com](https://stripe.com) and sign up
2. **Get your API keys**: 
   - Go to Developers → API keys
   - Copy your publishable and secret keys
3. **Products are auto-created**: The setup wizard created these for you:
   - Starter Plan: $19/month
   - Professional Plan: $49/month  
   - Enterprise Plan: $199/month

### Test Payments
1. Go to your app's pricing page
2. Click "Subscribe" on any plan
3. Use Stripe test card: `4242 4242 4242 4242`
4. Use any future expiry date and CVC

## 🗄️ Step 5: Configure Database (Turso)

1. **Create a Turso account**: Visit [turso.tech](https://turso.tech) and sign up
2. **Create a database**:
   ```bash
   turso db create my-saas-db
   ```
3. **Get your credentials**:
   ```bash
   turso db show my-saas-db --url
   turso db tokens create my-saas-db
   ```
4. **Database is auto-configured**: The setup wizard handled this

### Explore Your Data
```bash
npm run db:studio
```
This opens Drizzle Studio where you can view and edit your data.

## 📧 Step 6: Configure Email (Optional)

1. **Create a Resend account**: Visit [resend.com](https://resend.com)
2. **Get your API key**: Go to API Keys and create a new key
3. **Add to your environment**:
   ```env
   RESEND_API_KEY=re_...
   ```

### Test Emails
- Welcome emails are sent automatically when users sign up
- Subscription emails are sent when users subscribe
- View email templates at `http://localhost:3000/email-preview`

## ☁️ Step 7: Configure File Uploads (Optional)

1. **Create a Cloudinary account**: Visit [cloudinary.com](https://cloudinary.com)
2. **Get your credentials**: From your dashboard
3. **Add to your environment**:
   ```env
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

### Test File Uploads
1. Sign in to your app
2. Go to Settings → Files
3. Try uploading an image

## 📊 Step 8: Add Analytics (Optional)

### PostHog (Feature Flags & Analytics)
1. **Create account**: Visit [posthog.com](https://posthog.com)
2. **Get your project key**: From Project Settings
3. **Add to environment**:
   ```env
   NEXT_PUBLIC_POSTHOG_KEY=phc_...
   NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
   ```

### Sentry (Error Tracking)
1. **Create account**: Visit [sentry.io](https://sentry.io)
2. **Create a Next.js project**
3. **Add your DSN**:
   ```env
   NEXT_PUBLIC_SENTRY_DSN=https://...
   ```

## 🚀 Step 9: Deploy to Production

### Option 1: Vercel (Recommended)
1. Connect your GitHub repo to Vercel
2. Add all your environment variables
3. Deploy!

### Option 2: Other Platforms
See our [deployment guide](./DEPLOY.md) for:
- Netlify
- Railway  
- Render
- Self-hosted options

## 🔧 Step 10: Configure Webhooks

### Stripe Webhooks
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook secret to your environment

### Clerk Webhooks
1. Go to Clerk Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/clerk`
3. Select these events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
4. Copy the signing secret to your environment

## ✅ Step 11: Test Everything

### Authentication Flow
- [ ] Sign up with email
- [ ] Sign in with social provider
- [ ] Update profile information
- [ ] Sign out and back in

### Payment Flow
- [ ] Subscribe to a plan
- [ ] Access customer portal
- [ ] Update subscription
- [ ] Cancel subscription

### API Features
- [ ] Generate API key
- [ ] Make API calls
- [ ] View usage analytics
- [ ] Test rate limiting

### File Uploads
- [ ] Upload a file
- [ ] View uploaded files
- [ ] Delete a file

### Email Notifications
- [ ] Receive welcome email
- [ ] Receive subscription emails
- [ ] Test email templates

## 🎉 Congratulations!

You now have a fully functional SaaS application! Here's what you've accomplished:

✅ **Authentication**: Secure user management with Clerk  
✅ **Payments**: Subscription billing with Stripe  
✅ **Database**: Edge database with Turso  
✅ **Emails**: Transactional emails with Resend  
✅ **Files**: Cloud storage with Cloudinary  
✅ **Analytics**: Usage tracking and error monitoring  
✅ **API**: Rate-limited API with key authentication  

## 🚀 Next Steps

Now that your SaaS is running, consider:

1. **Customize the branding**: Run `npm run setup:branding`
2. **Add your unique features**: Build on top of the solid foundation
3. **Set up monitoring**: Configure alerts and dashboards
4. **Optimize performance**: Use the built-in analytics
5. **Scale your infrastructure**: Upgrade services as you grow

## 🆘 Need Help?

- 📚 [Full Documentation](./docs)
- 🐛 [Report Issues](https://github.com/yourusername/saas-starter/issues)
- 💬 [Community Discord](https://discord.gg/your-discord)
- 📧 [Email Support](mailto:support@yourdomain.com)

## 📝 Troubleshooting

### Common Issues

**"Environment variables not found"**
- Ensure `.env.local` exists and has all required variables
- Restart your development server after changes

**"Database connection failed"**
- Check your Turso credentials
- Ensure your database is accessible
- Try running `npm run db:push`

**"Stripe webhook errors"**
- Verify webhook URL is correct
- Check webhook secret matches
- Ensure events are properly selected

**"Authentication not working"**
- Verify Clerk keys are correct
- Check domain settings in Clerk dashboard
- Ensure webhook is properly configured

### Getting More Help

1. Check our [troubleshooting guide](./docs/troubleshooting)
2. Search existing [GitHub issues](https://github.com/yourusername/saas-starter/issues)
3. Join our [community Discord](https://discord.gg/your-discord)
4. Contact support at [support@yourdomain.com](mailto:support@yourdomain.com)

---

**Happy building!** 🚀 You're now ready to focus on what makes your SaaS unique instead of rebuilding the same foundation over and over.