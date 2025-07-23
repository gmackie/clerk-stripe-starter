# Local Testing Without Webhooks

You can absolutely test the full integration on localhost without setting up webhooks! Here's how:

## Quick Start Testing Flow

### 1. Sign Up
```bash
# Visit in browser
http://localhost:3000/sign-up

# Use test email
yourname+clerk_test@example.com

# Verify with code
424242
```

### 2. Sync User to Database (Manual Webhook)
After signing up, you need to sync your Clerk user to the database:

```bash
# In the browser console or using curl with cookies:
fetch('/api/dev/sync-user', { method: 'POST' })
  .then(r => r.json())
  .then(console.log)

# Or visit http://localhost:3000/api/test to confirm auth is working
```

### 3. Create Test Subscription (Manual Webhook)
To test subscription features without going through Stripe:

```bash
# In browser console:
fetch('/api/dev/create-subscription', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tier: 'starter',  // or 'professional', 'enterprise'
    period: 'monthly' // or 'yearly'
  })
}).then(r => r.json()).then(console.log)
```

### 4. Generate API Key
Now you can visit `/settings` and generate an API key for testing.

### 5. Test API with Key
```bash
# Replace with your generated key
curl -H "Authorization: Bearer sk_test_..." \
     http://localhost:3000/api/example
```

## Development Endpoints

We've created special development-only endpoints that simulate webhook behavior:

### `/api/dev/sync-user`
- **Purpose**: Manually sync Clerk user to database
- **When to use**: After signing up or updating user info
- **What it does**: Creates/updates user record in database

### `/api/dev/create-subscription`
- **Purpose**: Create a test subscription
- **When to use**: To test subscription features without Stripe
- **Options**:
  ```json
  {
    "tier": "free|starter|professional|enterprise",
    "period": "monthly|yearly"
  }
  ```

## Testing Different Scenarios

### Test Free User
1. Sign up
2. Sync user: `POST /api/dev/sync-user`
3. User will have free tier limits

### Test Paid User
1. Sign up
2. Sync user: `POST /api/dev/sync-user`
3. Create subscription: `POST /api/dev/create-subscription`
4. User will have paid tier features

### Test Subscription Cancellation
```javascript
// In browser console
fetch('/api/dev/cancel-subscription', { method: 'POST' })
```

### Test API Rate Limits
```javascript
// Make multiple requests quickly
for(let i = 0; i < 15; i++) {
  fetch('/api/example').then(r => console.log(i, r.status))
}
```

## Using Real Stripe (Optional)

If you want to test the actual Stripe flow:

1. **Use Stripe Test Mode**: Your current keys are already test keys
2. **Test Card**: 4242 4242 4242 4242
3. **Manual Sync**: After checkout, manually sync the subscription:
   ```javascript
   // Get session_id from URL after redirect
   fetch('/api/stripe/verify-session?session_id=cs_test_...', {
     method: 'POST'
   })
   ```

## Database Verification

Check your data at any time:
```bash
npm run db:studio
```

Visit https://local.drizzle.studio to see:
- Users table with your test user
- Subscriptions table with test subscriptions
- API keys you've generated

## Common Issues

### "User not found in database"
Run the sync-user endpoint after signing up:
```javascript
fetch('/api/dev/sync-user', { method: 'POST' })
```

### "Rate limit exceeded" 
- Free tier: 10 requests/minute
- Make sure Redis is configured or rate limiting is disabled

### API returns 401
- Make sure you're logged in or using a valid API key
- Check that user is synced to database

## Production Considerations

These `/api/dev/*` endpoints are **development only** and will return 403 in production. In production, you must use proper webhooks.

## Benefits of This Approach

1. **No external dependencies**: No ngrok, no webhook configuration
2. **Fast iteration**: Test immediately without waiting for webhooks
3. **Deterministic**: You control exactly when data syncs
4. **Debug friendly**: See exactly what's happening step by step

## Full Test Script

Here's a complete test flow you can run:

```javascript
// 1. After signing up, run this in browser console:
async function runFullTest() {
  console.log('1. Syncing user...');
  const syncRes = await fetch('/api/dev/sync-user', { method: 'POST' });
  console.log(await syncRes.json());

  console.log('2. Creating subscription...');
  const subRes = await fetch('/api/dev/create-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tier: 'starter', period: 'monthly' })
  });
  console.log(await subRes.json());

  console.log('3. Testing API...');
  const apiRes = await fetch('/api/example');
  console.log(await apiRes.json());

  console.log('✅ Test complete! Check /settings for more options.');
}

runFullTest();
```