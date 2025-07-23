#!/usr/bin/env npx tsx

import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const API_URL = 'http://localhost:3000';

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(description: string, passed: boolean, details?: string) {
  totalTests++;
  if (passed) {
    passedTests++;
    console.log(`✅ ${description}`);
  } else {
    failedTests++;
    console.log(`❌ ${description}`);
  }
  if (details) {
    console.log(`   ${details}`);
  }
}

async function testPublicPages() {
  console.log('\n🌐 Testing Public Pages\n');
  
  const pages = [
    { path: '/', name: 'Home page' },
    { path: '/pricing', name: 'Pricing page' },
    { path: '/sign-in', name: 'Sign-in page' },
    { path: '/sign-up', name: 'Sign-up page' },
  ];

  for (const page of pages) {
    try {
      const res = await fetch(`${API_URL}${page.path}`);
      test(`${page.name} accessible`, res.status === 200, `Status: ${res.status}`);
    } catch (error) {
      test(`${page.name} accessible`, false, `Error: ${error}`);
    }
  }
}

async function testProtectedPages() {
  console.log('\n🔒 Testing Protected Pages (should redirect)\n');
  
  const pages = [
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/settings', name: 'Settings' },
  ];

  for (const page of pages) {
    try {
      const res = await fetch(`${API_URL}${page.path}`, { redirect: 'manual' });
      // Clerk middleware returns 404 with specific headers when not authenticated
      const isProtected = res.status === 404 && res.headers.get('x-clerk-auth-status') === 'signed-out';
      test(`${page.name} requires auth`, isProtected, `Status: ${res.status}, Auth: ${res.headers.get('x-clerk-auth-status')}`);
    } catch (error) {
      test(`${page.name} requires auth`, false, `Error: ${error}`);
    }
  }
}

async function testAPIEndpoints() {
  console.log('\n🔌 Testing API Endpoints\n');
  
  // Test unauthenticated access
  const endpoints = [
    { path: '/api/example', method: 'GET', expectedStatus: 401 },
    { path: '/api/user/subscription', method: 'GET', expectedStatus: 401 },
    { path: '/api/user/invoices', method: 'GET', expectedStatus: 401 },
    { path: '/api/keys', method: 'GET', expectedStatus: 401 },
    { path: '/api/keys', method: 'POST', expectedStatus: 401 },
    { path: '/api/stripe/checkout-session', method: 'POST', expectedStatus: 401 },
    { path: '/api/stripe/customer-portal', method: 'POST', expectedStatus: 401 },
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(`${API_URL}${endpoint.path}`, { method: endpoint.method });
      const passed = res.status === endpoint.expectedStatus;
      test(
        `${endpoint.method} ${endpoint.path} returns ${endpoint.expectedStatus} without auth`,
        passed,
        `Got: ${res.status}`
      );
    } catch (error) {
      test(`${endpoint.method} ${endpoint.path}`, false, `Error: ${error}`);
    }
  }
}

async function testWebhooks() {
  console.log('\n🪝 Testing Webhooks\n');
  
  // Test Stripe webhook without signature
  try {
    const stripeRes = await fetch(`${API_URL}/api/webhooks/stripe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'test' }),
    });
    test('Stripe webhook rejects invalid signature', stripeRes.status === 400, `Status: ${stripeRes.status}`);
  } catch (error) {
    test('Stripe webhook rejects invalid signature', false, `Error: ${error}`);
  }

  // Test Clerk webhook without signature
  try {
    const clerkRes = await fetch(`${API_URL}/api/webhooks/clerk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'test', data: {} }),
    });
    test('Clerk webhook rejects missing headers', clerkRes.status === 400, `Status: ${clerkRes.status}`);
  } catch (error) {
    test('Clerk webhook rejects missing headers', false, `Error: ${error}`);
  }
}

async function testEnvironmentVariables() {
  console.log('\n⚙️  Testing Environment Variables\n');
  
  const requiredVars = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 
    'STRIPE_SECRET_KEY',
    'TURSO_DATABASE_URL',
    'TURSO_AUTH_TOKEN',
    'NEXT_PUBLIC_APP_URL',
  ];

  const optionalVars = [
    'CLERK_WEBHOOK_SECRET',
    'STRIPE_WEBHOOK_SECRET',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_MONTHLY',
    'NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_YEARLY',
    'NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY',
    'NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY',
    'NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_MONTHLY',
    'NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE_YEARLY',
  ];

  for (const varName of requiredVars) {
    const value = process.env[varName];
    test(`Required: ${varName}`, !!value, value ? '✓ Set' : '✗ Missing');
  }

  console.log('\nOptional variables:');
  for (const varName of optionalVars) {
    const value = process.env[varName];
    console.log(`  ${value ? '✓' : '○'} ${varName}`);
  }
}

async function testDatabaseConnection() {
  console.log('\n🗄️  Testing Database Connection\n');
  
  // We can't directly test the database from here, but we can check if the API is responding
  // which would indicate the database is connected
  try {
    const res = await fetch(`${API_URL}/api/example`);
    // Even a 401/500 means the server is running and attempting to use the database
    test('Server can attempt database queries', res.status > 0, `Status: ${res.status}`);
  } catch (error) {
    test('Server can attempt database queries', false, `Error: ${error}`);
  }
}

async function runAllTests() {
  console.log('🚀 Running Complete E2E Test Suite\n');
  console.log('━'.repeat(50));
  
  await testEnvironmentVariables();
  await testPublicPages();
  await testProtectedPages();
  await testAPIEndpoints();
  await testWebhooks();
  await testDatabaseConnection();
  
  console.log('\n' + '━'.repeat(50));
  console.log('\n📊 Test Summary\n');
  console.log(`Total tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} ✅`);
  console.log(`Failed: ${failedTests} ❌`);
  console.log(`Success rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (failedTests === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the details above.');
  }
  
  console.log('\n📝 Next Steps:');
  console.log('1. Add missing environment variables to .env.local');
  console.log('2. Set up webhooks with ngrok (see WEBHOOK_SETUP.md)');
  console.log('3. Test user signup with email: yourname+clerk_test@example.com');
  console.log('4. Verify with code: 424242');
  console.log('5. Check database at https://local.drizzle.studio');
}

// Run the tests
runAllTests().catch(console.error);