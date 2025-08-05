#!/usr/bin/env node

const { createClient } = require('@libsql/client');
const { drizzle } = require('drizzle-orm/libsql');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Import schema
const schema = require('../src/db/schema');

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

// Generate random data
function generateApiKey() {
  return `sk_${process.env.NODE_ENV === 'production' ? 'live' : 'test'}_${crypto.randomBytes(24).toString('hex')}`;
}

function generateUsageData(days = 30) {
  const usage = [];
  const now = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate random usage between 0-1000 calls
    const calls = Math.floor(Math.random() * 1000);
    
    usage.push({
      date: date.toISOString().split('T')[0],
      calls
    });
  }
  
  return usage;
}

async function seedDatabase() {
  log('\n🌱 Seeding Demo Data...', 'bright');
  
  // Check environment variables
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    log('❌ Missing database credentials. Please run setup first.', 'red');
    process.exit(1);
  }
  
  // Connect to database
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
  });
  
  const db = drizzle(client, { schema });
  
  try {
    // Demo user data
    const demoUsers = [
      {
        id: 'user_demo_1',
        email: 'alice@example.com',
        firstName: 'Alice',
        lastName: 'Johnson',
        imageUrl: 'https://ui-avatars.com/api/?name=Alice+Johnson',
        stripeCustomerId: 'cus_demo_1',
        subscriptionId: 'sub_demo_1',
        subscriptionStatus: 'active',
        subscriptionPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY || 'price_pro_monthly',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        trialEndsAt: null
      },
      {
        id: 'user_demo_2',
        email: 'bob@example.com',
        firstName: 'Bob',
        lastName: 'Smith',
        imageUrl: 'https://ui-avatars.com/api/?name=Bob+Smith',
        stripeCustomerId: 'cus_demo_2',
        subscriptionId: 'sub_demo_2',
        subscriptionStatus: 'active',
        subscriptionPriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_MONTHLY || 'price_starter_monthly',
        currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        trialEndsAt: null
      },
      {
        id: 'user_demo_3',
        email: 'charlie@example.com',
        firstName: 'Charlie',
        lastName: 'Davis',
        imageUrl: 'https://ui-avatars.com/api/?name=Charlie+Davis',
        stripeCustomerId: null,
        subscriptionId: null,
        subscriptionStatus: null,
        subscriptionPriceId: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        trialEndsAt: null
      }
    ];
    
    // Insert demo users
    log('\nCreating demo users...', 'cyan');
    for (const user of demoUsers) {
      await db.insert(schema.users).values(user).onConflictDoNothing();
      log(`✅ Created user: ${user.email}`, 'green');
    }
    
    // Create API keys for users
    log('\nCreating API keys...', 'cyan');
    const apiKeys = [
      {
        id: crypto.randomUUID(),
        userId: 'user_demo_1',
        name: 'Production API Key',
        key: generateApiKey(),
        lastUsed: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        userId: 'user_demo_1',
        name: 'Development API Key',
        key: generateApiKey(),
        lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: crypto.randomUUID(),
        userId: 'user_demo_2',
        name: 'Mobile App Key',
        key: generateApiKey(),
        lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    for (const apiKey of apiKeys) {
      await db.insert(schema.apiKeys).values(apiKey).onConflictDoNothing();
      log(`✅ Created API key: ${apiKey.name}`, 'green');
    }
    
    // Create usage data
    log('\nCreating usage data...', 'cyan');
    const usageData = generateUsageData(30);
    
    for (const user of demoUsers.slice(0, 2)) { // Only for subscribed users
      for (const usage of usageData) {
        await db.insert(schema.apiUsage).values({
          id: crypto.randomUUID(),
          userId: user.id,
          endpoint: '/api/example',
          timestamp: new Date(`${usage.date}T12:00:00Z`).toISOString(),
          responseTime: Math.floor(Math.random() * 500) + 100,
          statusCode: Math.random() > 0.95 ? 500 : 200
        }).onConflictDoNothing();
      }
    }
    log(`✅ Created ${usageData.length} days of usage data`, 'green');
    
    // Create file uploads (if using Cloudinary)
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      log('\nCreating file upload records...', 'cyan');
      const files = [
        {
          id: crypto.randomUUID(),
          userId: 'user_demo_1',
          publicId: 'demo/document1',
          url: 'https://via.placeholder.com/300x200?text=Document+1',
          fileName: 'project-proposal.pdf',
          fileType: 'application/pdf',
          fileSize: 1024 * 512 // 512KB
        },
        {
          id: crypto.randomUUID(),
          userId: 'user_demo_1',
          publicId: 'demo/image1',
          url: 'https://via.placeholder.com/300x200?text=Image+1',
          fileName: 'product-screenshot.png',
          fileType: 'image/png',
          fileSize: 1024 * 256 // 256KB
        }
      ];
      
      for (const file of files) {
        await db.insert(schema.files).values(file).onConflictDoNothing();
        log(`✅ Created file: ${file.fileName}`, 'green');
      }
    }
    
    // Create feature flags data
    log('\nCreating feature flag data...', 'cyan');
    const featureFlags = [
      {
        feature: 'new-dashboard',
        enabledFor: ['user_demo_1'],
        rolloutPercentage: 50
      },
      {
        feature: 'advanced-analytics',
        enabledFor: ['user_demo_1', 'user_demo_2'],
        rolloutPercentage: 100
      }
    ];
    
    log(`✅ Created ${featureFlags.length} feature flags (in-memory)`, 'green');
    
    log('\n✨ Demo data seeded successfully!', 'bright');
    log('\nDemo Users:', 'cyan');
    log('- alice@example.com (Pro plan)', 'yellow');
    log('- bob@example.com (Starter plan)', 'yellow');
    log('- charlie@example.com (Free plan)', 'yellow');
    
  } catch (error) {
    log(`\n❌ Error seeding data: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run seeding
seedDatabase().then(() => {
  process.exit(0);
}).catch((error) => {
  log(`\n❌ Seeding failed: ${error.message}`, 'red');
  process.exit(1);
});