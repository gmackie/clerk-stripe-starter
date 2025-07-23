#!/usr/bin/env npx tsx

import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const API_URL = 'http://localhost:3000';
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY!;

// Test user data
const testEmail = `test${Date.now()}+clerk_test@example.com`;
const testPassword = 'SuperSecure2025!@#$%^';

console.log('🧪 Automated User Flow Test\n');
console.log('━'.repeat(50));

async function createUserViaClerk() {
  console.log('\n1️⃣ Creating user via Clerk API...');
  
  try {
    const response = await fetch('https://api.clerk.com/v1/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_addresses: [testEmail],
        password: testPassword,
        skip_password_requirement: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create user: ${error}`);
    }

    const user = await response.json();
    console.log(`✅ User created: ${user.id}`);
    console.log(`   Email: ${testEmail}`);
    return user;
  } catch (error) {
    console.error('❌ Failed to create user:', error);
    throw error;
  }
}

async function testPublicAccess() {
  console.log('\n2️⃣ Testing public page access...');
  
  const publicPages = ['/', '/pricing', '/sign-in', '/sign-up'];
  let allPassed = true;
  
  for (const page of publicPages) {
    const res = await fetch(`${API_URL}${page}`);
    const passed = res.status === 200;
    console.log(`   ${page}: ${passed ? '✅' : '❌'} (${res.status})`);
    if (!passed) allPassed = false;
  }
  
  return allPassed;
}

async function testProtectedAccess() {
  console.log('\n3️⃣ Testing protected endpoints (should fail)...');
  
  const protectedEndpoints = [
    '/api/example',
    '/api/user/subscription',
    '/api/keys'
  ];
  
  let allProtected = true;
  
  for (const endpoint of protectedEndpoints) {
    const res = await fetch(`${API_URL}${endpoint}`);
    const isProtected = res.status === 401;
    console.log(`   ${endpoint}: ${isProtected ? '✅ Protected' : '❌ Not protected'} (${res.status})`);
    if (!isProtected) allProtected = false;
  }
  
  return allProtected;
}

async function getClerkToken(userId: string) {
  console.log('\n4️⃣ Getting Clerk session token...');
  
  // Note: In a real test, you'd use Clerk's testing tokens or SDK
  // For this demo, we'll show what would be needed
  console.log('   ℹ️  Manual step required: Sign in via browser');
  console.log(`   Email: ${testEmail}`);
  console.log('   Verification code: 424242');
  
  return null; // Would return actual token in full implementation
}

async function cleanupUser(userId: string) {
  console.log('\n🧹 Cleaning up test user...');
  
  try {
    const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
      },
    });

    if (response.ok) {
      console.log('✅ Test user deleted');
    } else {
      console.log('⚠️  Could not delete test user');
    }
  } catch (error) {
    console.error('❌ Error deleting user:', error);
  }
}

// Main test flow
async function runAutomatedTest() {
  try {
    // Test public access
    const publicOk = await testPublicAccess();
    
    // Test protected access
    const protectedOk = await testProtectedAccess();
    
    // Create test user
    const clerkUser = await createUserViaClerk();
    
    console.log('\n━'.repeat(50));
    console.log('\n📊 Test Summary\n');
    console.log(`Public pages accessible: ${publicOk ? '✅' : '❌'}`);
    console.log(`Protected endpoints secured: ${protectedOk ? '✅' : '❌'}`);
    console.log(`Test user created: ✅`);
    
    console.log('\n📝 Manual Testing Required:');
    console.log(`1. Sign in at ${API_URL}/sign-in`);
    console.log(`   - Email: ${testEmail}`);
    console.log(`   - Password: ${testPassword}`);
    console.log(`   - Verification: 424242`);
    console.log('2. In browser console, run:');
    console.log(`   fetch('/api/dev/sync-user', { method: 'POST' }).then(r => r.json()).then(console.log)`);
    console.log('3. Create subscription:');
    console.log(`   fetch('/api/dev/create-subscription', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ tier: 'starter', period: 'monthly' })
   }).then(r => r.json()).then(console.log)`);
    console.log('4. Generate API key in /settings');
    console.log('5. Test API with generated key');
    
    console.log('\n🔗 Quick Links:');
    console.log(`Sign in: ${API_URL}/sign-in`);
    console.log(`Dashboard: ${API_URL}/dashboard`);
    console.log(`Settings: ${API_URL}/settings`);
    console.log(`Database: https://local.drizzle.studio`);
    
    // Cleanup
    setTimeout(() => cleanupUser(clerkUser.id), 60000); // Delete after 1 minute
    console.log('\n⏰ Test user will be deleted in 60 seconds');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
runAutomatedTest();