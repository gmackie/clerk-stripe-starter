#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

async function setup() {
  log('\n🚀 Welcome to the SaaS Starter Kit Setup!\n', 'bright');
  log('This wizard will help you configure your project.\n', 'cyan');

  // Check if .env.local already exists
  if (fs.existsSync('.env.local')) {
    const overwrite = await question('⚠️  .env.local already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      log('Setup cancelled.', 'yellow');
      process.exit(0);
    }
  }

  log('\n📋 Project Configuration\n', 'bright');

  // Project details
  const projectName = await question('Project name (My SaaS App): ') || 'My SaaS App';
  const projectUrl = await question('Production URL (https://myapp.com): ') || 'https://myapp.com';

  log('\n🔐 Authentication (Clerk)\n', 'bright');
  log('Get your keys from: https://dashboard.clerk.com', 'cyan');
  
  const clerkPublishableKey = await question('Clerk Publishable Key (pk_test_...): ');
  const clerkSecretKey = await question('Clerk Secret Key (sk_test_...): ');
  const clerkWebhookSecret = await question('Clerk Webhook Secret (whsec_...) [optional]: ') || '';

  log('\n💳 Payments (Stripe)\n', 'bright');
  log('Get your keys from: https://dashboard.stripe.com', 'cyan');
  
  const stripePublishableKey = await question('Stripe Publishable Key (pk_test_...): ');
  const stripeSecretKey = await question('Stripe Secret Key (sk_test_...): ');
  const stripeWebhookSecret = await question('Stripe Webhook Secret (whsec_...) [optional]: ') || '';

  log('\n🗄️  Database (Turso)\n', 'bright');
  log('Get your credentials from: https://turso.tech', 'cyan');
  
  const tursoUrl = await question('Turso Database URL (libsql://...): ');
  const tursoToken = await question('Turso Auth Token: ');

  log('\n🔧 Optional Services\n', 'bright');
  log('Press Enter to skip any of these:\n', 'cyan');

  // Optional services
  const sentryDsn = await question('Sentry DSN [optional]: ') || '';
  const resendApiKey = await question('Resend API Key [optional]: ') || '';
  const upstashRedisUrl = await question('Upstash Redis URL [optional]: ') || '';
  const upstashRedisToken = await question('Upstash Redis Token [optional]: ') || '';

  // Generate secrets
  const cronSecret = generateSecret();
  const inngestSigningKey = generateSecret();

  // Create .env.local file
  const envContent = `# Project
PROJECT_NAME="${projectName}"
NEXT_PUBLIC_APP_URL=${projectUrl}

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${clerkPublishableKey}
CLERK_SECRET_KEY=${clerkSecretKey}
CLERK_WEBHOOK_SECRET=${clerkWebhookSecret}

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Stripe Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${stripePublishableKey}
STRIPE_SECRET_KEY=${stripeSecretKey}
STRIPE_WEBHOOK_SECRET=${stripeWebhookSecret}

# Stripe Price IDs (Update these with your actual price IDs)
NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_MONTHLY=price_starter_monthly
NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_YEARLY=price_starter_yearly
NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY=price_pro_monthly
NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY=price_pro_yearly
NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_MONTHLY=price_enterprise_monthly
NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_YEARLY=price_enterprise_yearly

# Turso Database
TURSO_DATABASE_URL=${tursoUrl}
TURSO_AUTH_TOKEN=${tursoToken}

# Cron Jobs
CRON_SECRET=${cronSecret}

# Optional Services
${sentryDsn ? `NEXT_PUBLIC_SENTRY_DSN=${sentryDsn}` : '# NEXT_PUBLIC_SENTRY_DSN='}
${resendApiKey ? `RESEND_API_KEY=${resendApiKey}` : '# RESEND_API_KEY='}
${upstashRedisUrl ? `UPSTASH_REDIS_REST_URL=${upstashRedisUrl}` : '# UPSTASH_REDIS_REST_URL='}
${upstashRedisToken ? `UPSTASH_REDIS_REST_TOKEN=${upstashRedisToken}` : '# UPSTASH_REDIS_REST_TOKEN='}

# Inngest Background Jobs
INNGEST_SIGNING_KEY=${inngestSigningKey}

# PostHog Analytics (Optional)
# NEXT_PUBLIC_POSTHOG_KEY=
# NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Cloudinary File Uploads (Optional)
# CLOUDINARY_CLOUD_NAME=
# CLOUDINARY_API_KEY=
# CLOUDINARY_API_SECRET=
`;

  fs.writeFileSync('.env.local', envContent);
  log('\n✅ Created .env.local file', 'green');

  // Update package.json with project name
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  packageJson.name = projectName.toLowerCase().replace(/\s+/g, '-');
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  log('✅ Updated package.json', 'green');

  // Install dependencies
  log('\n📦 Installing dependencies...', 'yellow');
  try {
    execSync('npm install', { stdio: 'inherit' });
    log('✅ Dependencies installed', 'green');
  } catch (error) {
    log('❌ Failed to install dependencies', 'red');
    log('Please run "npm install" manually', 'yellow');
  }

  // Set up database
  log('\n🗄️  Setting up database...', 'yellow');
  try {
    execSync('npm run db:push', { stdio: 'inherit' });
    log('✅ Database configured', 'green');
  } catch (error) {
    log('❌ Failed to set up database', 'red');
    log('Please run "npm run db:push" manually', 'yellow');
  }

  // Final instructions
  log('\n🎉 Setup complete!\n', 'bright');
  log('Next steps:', 'cyan');
  log('1. Update Stripe price IDs in .env.local', 'yellow');
  log('2. Configure webhooks in Clerk and Stripe dashboards', 'yellow');
  log('3. Run "npm run dev" to start the development server', 'yellow');
  log('4. Visit http://localhost:3000 to see your app', 'yellow');
  
  if (!clerkWebhookSecret || !stripeWebhookSecret) {
    log('\n⚠️  Remember to add webhook secrets after configuring webhooks:', 'yellow');
    if (!clerkWebhookSecret) log('   - CLERK_WEBHOOK_SECRET', 'yellow');
    if (!stripeWebhookSecret) log('   - STRIPE_WEBHOOK_SECRET', 'yellow');
  }

  log('\n📚 Documentation: Run "npm run docs:dev" to view the docs', 'cyan');
  log('💬 Need help? Check out the documentation or open an issue on GitHub\n', 'cyan');

  rl.close();
}

// Run setup
setup().catch((error) => {
  log(`\n❌ Setup failed: ${error.message}`, 'red');
  process.exit(1);
});