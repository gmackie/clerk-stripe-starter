#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');
const { execSync } = require('child_process');

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

// Check if Stripe CLI is installed
function checkStripeCLI() {
  try {
    execSync('stripe --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Install Stripe CLI
async function installStripeCLI() {
  log('\n📦 Installing Stripe CLI...', 'yellow');
  
  const platform = process.platform;
  
  try {
    if (platform === 'darwin') {
      log('Installing via Homebrew...', 'cyan');
      execSync('brew install stripe/stripe-cli/stripe', { stdio: 'inherit' });
    } else if (platform === 'linux') {
      log('Installing for Linux...', 'cyan');
      execSync('curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg', { stdio: 'inherit' });
      execSync('echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list', { stdio: 'inherit' });
      execSync('sudo apt update && sudo apt install stripe', { stdio: 'inherit' });
    } else {
      log('Please install Stripe CLI manually from: https://stripe.com/docs/stripe-cli', 'yellow');
      return false;
    }
    
    log('✅ Stripe CLI installed successfully', 'green');
    return true;
  } catch (error) {
    log('❌ Failed to install Stripe CLI automatically', 'red');
    log('Please install manually from: https://stripe.com/docs/stripe-cli', 'yellow');
    return false;
  }
}

// Create Stripe products and prices
async function createStripeProducts() {
  log('\n💳 Creating Stripe Products and Prices...', 'bright');
  
  const products = [
    {
      name: 'Starter',
      description: 'Perfect for small teams and projects',
      features: ['100 API calls/month', '1 team member', 'Email support', '14-day free trial'],
      prices: {
        monthly: { amount: 1900, interval: 'month' },
        yearly: { amount: 19000, interval: 'year' }
      }
    },
    {
      name: 'Professional',
      description: 'For growing businesses',
      features: ['10,000 API calls/month', '10 team members', 'Priority support', '14-day free trial', 'Advanced analytics'],
      prices: {
        monthly: { amount: 4900, interval: 'month' },
        yearly: { amount: 49000, interval: 'year' }
      }
    },
    {
      name: 'Enterprise',
      description: 'For large organizations',
      features: ['Unlimited API calls', 'Unlimited team members', 'Dedicated support', '30-day free trial', 'Custom integrations', 'SLA'],
      prices: {
        monthly: { amount: 19900, interval: 'month' },
        yearly: { amount: 199000, interval: 'year' }
      }
    }
  ];
  
  const priceIds = {};
  
  for (const product of products) {
    try {
      log(`\nCreating ${product.name} product...`, 'cyan');
      
      // Create product
      const productResult = execSync(
        `stripe products create --name="${product.name}" --description="${product.description}" --metadata[features]="${product.features.join(', ')}"`,
        { encoding: 'utf8' }
      );
      
      const productId = productResult.match(/"id": "(.+?)"/)?.[1];
      
      if (productId) {
        // Create monthly price
        const monthlyResult = execSync(
          `stripe prices create --product="${productId}" --unit-amount=${product.prices.monthly.amount} --currency=usd --recurring[interval]=${product.prices.monthly.interval}`,
          { encoding: 'utf8' }
        );
        const monthlyPriceId = monthlyResult.match(/"id": "(.+?)"/)?.[1];
        
        // Create yearly price
        const yearlyResult = execSync(
          `stripe prices create --product="${productId}" --unit-amount=${product.prices.yearly.amount} --currency=usd --recurring[interval]=${product.prices.yearly.interval}`,
          { encoding: 'utf8' }
        );
        const yearlyPriceId = yearlyResult.match(/"id": "(.+?)"/)?.[1];
        
        priceIds[`${product.name.toUpperCase()}_MONTHLY`] = monthlyPriceId;
        priceIds[`${product.name.toUpperCase()}_YEARLY`] = yearlyPriceId;
        
        log(`✅ Created ${product.name} product with prices`, 'green');
      }
    } catch (error) {
      log(`❌ Failed to create ${product.name} product`, 'red');
      console.error(error.message);
    }
  }
  
  return priceIds;
}

// Update .env.local with Stripe price IDs
function updateEnvWithPriceIds(priceIds) {
  if (!fs.existsSync('.env.local')) {
    log('❌ .env.local not found. Please run setup script first.', 'red');
    return false;
  }
  
  let envContent = fs.readFileSync('.env.local', 'utf8');
  
  // Update price IDs
  envContent = envContent.replace(
    /NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_MONTHLY=.*/,
    `NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_MONTHLY=${priceIds.STARTER_MONTHLY || 'price_starter_monthly'}`
  );
  envContent = envContent.replace(
    /NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_YEARLY=.*/,
    `NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_YEARLY=${priceIds.STARTER_YEARLY || 'price_starter_yearly'}`
  );
  envContent = envContent.replace(
    /NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY=.*/,
    `NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY=${priceIds.PROFESSIONAL_MONTHLY || 'price_pro_monthly'}`
  );
  envContent = envContent.replace(
    /NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY=.*/,
    `NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY=${priceIds.PROFESSIONAL_YEARLY || 'price_pro_yearly'}`
  );
  envContent = envContent.replace(
    /NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_MONTHLY=.*/,
    `NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_MONTHLY=${priceIds.ENTERPRISE_MONTHLY || 'price_enterprise_monthly'}`
  );
  envContent = envContent.replace(
    /NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_YEARLY=.*/,
    `NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_YEARLY=${priceIds.ENTERPRISE_YEARLY || 'price_enterprise_yearly'}`
  );
  
  fs.writeFileSync('.env.local', envContent);
  log('✅ Updated .env.local with Stripe price IDs', 'green');
  return true;
}

// Set up webhooks
async function setupWebhooks() {
  log('\n🔗 Setting up Webhooks...', 'bright');
  
  const appUrl = await question('Enter your app URL (http://localhost:3000): ') || 'http://localhost:3000';
  
  // Stripe webhook
  log('\nSetting up Stripe webhook...', 'cyan');
  try {
    const stripeWebhookResult = execSync(
      `stripe webhooks create --url "${appUrl}/api/webhooks/stripe" --events checkout.session.completed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,invoice.payment_succeeded,invoice.payment_failed`,
      { encoding: 'utf8' }
    );
    
    const stripeWebhookSecret = stripeWebhookResult.match(/"secret": "(.+?)"/)?.[1];
    
    if (stripeWebhookSecret) {
      // Update .env.local
      let envContent = fs.readFileSync('.env.local', 'utf8');
      envContent = envContent.replace(
        /STRIPE_WEBHOOK_SECRET=.*/,
        `STRIPE_WEBHOOK_SECRET=${stripeWebhookSecret}`
      );
      fs.writeFileSync('.env.local', envContent);
      
      log('✅ Stripe webhook configured', 'green');
      log(`Webhook endpoint: ${appUrl}/api/webhooks/stripe`, 'cyan');
    }
  } catch (error) {
    log('❌ Failed to create Stripe webhook', 'red');
    log('Please create manually in Stripe Dashboard', 'yellow');
  }
  
  // Clerk webhook instructions
  log('\n📋 Clerk Webhook Setup:', 'bright');
  log('1. Go to https://dashboard.clerk.com', 'yellow');
  log('2. Select your application', 'yellow');
  log('3. Go to Webhooks in the left sidebar', 'yellow');
  log('4. Click "Add Endpoint"', 'yellow');
  log(`5. Enter URL: ${appUrl}/api/webhooks/clerk`, 'yellow');
  log('6. Select events: user.created, user.updated, user.deleted', 'yellow');
  log('7. Copy the signing secret and add to .env.local as CLERK_WEBHOOK_SECRET', 'yellow');
}

// Main initialization function
async function init() {
  log('\n🚀 Stripe Initialization Wizard', 'bright');
  log('This will help you set up Stripe products and webhooks\n', 'cyan');
  
  // Check if Stripe CLI is installed
  if (!checkStripeCLI()) {
    const install = await question('Stripe CLI not found. Install it now? (Y/n): ');
    if (install.toLowerCase() !== 'n') {
      const installed = await installStripeCLI();
      if (!installed) {
        log('\nPlease install Stripe CLI and run this script again.', 'yellow');
        process.exit(1);
      }
    } else {
      log('\nStripe CLI is required for this setup.', 'yellow');
      process.exit(1);
    }
  }
  
  // Login to Stripe
  log('\n🔐 Logging into Stripe...', 'cyan');
  try {
    execSync('stripe login', { stdio: 'inherit' });
  } catch (error) {
    log('❌ Failed to login to Stripe', 'red');
    process.exit(1);
  }
  
  // Create products and prices
  const createProducts = await question('\nCreate Stripe products and prices? (Y/n): ');
  if (createProducts.toLowerCase() !== 'n') {
    const priceIds = await createStripeProducts();
    if (Object.keys(priceIds).length > 0) {
      updateEnvWithPriceIds(priceIds);
    }
  }
  
  // Set up webhooks
  const setupWebhook = await question('\nSet up webhooks? (Y/n): ');
  if (setupWebhook.toLowerCase() !== 'n') {
    await setupWebhooks();
  }
  
  // Final instructions
  log('\n🎉 Stripe initialization complete!', 'bright');
  log('\nNext steps:', 'cyan');
  log('1. Verify products in your Stripe Dashboard', 'yellow');
  log('2. Set up Clerk webhook (see instructions above)', 'yellow');
  log('3. Test the payment flow in development', 'yellow');
  log('4. Run "stripe listen --forward-to localhost:3000/api/webhooks/stripe" for local testing', 'yellow');
  
  rl.close();
}

// Run initialization
init().catch((error) => {
  log(`\n❌ Initialization failed: ${error.message}`, 'red');
  process.exit(1);
});