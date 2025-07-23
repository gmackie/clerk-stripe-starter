# Full User Flow Test Guide

This guide walks you through testing the complete user journey from signup to API usage.

## 🚀 Quick Test Flow

### Step 1: Sign Up
1. Open http://localhost:3000/sign-up
2. Enter email: `test+clerk_test@example.com`
3. Enter any password
4. Click "Continue"
5. Enter verification code: `424242`
6. You should be redirected to `/dashboard`

### Step 2: Sync User to Database
Since we're not using webhooks locally, manually sync the user:

1. Open browser console (F12)
2. Run this command:
```javascript
fetch('/api/dev/sync-user', { method: 'POST' })
  .then(r => r.json())
  .then(console.log)
```

Expected response:
```json
{
  "message": "User created",
  "user": {
    "id": "...",
    "clerkId": "user_...",
    "email": "test+clerk_test@example.com"
  }
}
```

### Step 3: Check Dashboard
- Refresh the dashboard page
- You should see your account info
- Subscription status should show "No active subscription"

### Step 4: Create Test Subscription
In the browser console, run:
```javascript
fetch('/api/dev/create-subscription', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tier: 'starter',
    period: 'monthly'
  })
}).then(r => r.json()).then(console.log)
```

Expected response:
```json
{
  "message": "Test subscription created",
  "subscription": { ... },
  "user": {
    "subscriptionStatus": "active",
    "tier": "starter"
  }
}
```

### Step 5: Verify Subscription
1. Refresh the dashboard
2. Subscription status should now show "active" with "Starter" plan
3. Click "Manage Subscription" (won't work without real Stripe data)

### Step 6: Test Settings Page
1. Navigate to http://localhost:3000/settings
2. You should see:
   - Profile section with your info
   - Billing section showing active subscription
   - API Keys section

### Step 7: Generate API Key
1. In Settings, go to API Keys section
2. Click "Generate New Key"
3. Enter a name like "Test Key"
4. Copy the generated key (starts with `sk_`)
5. **Important**: Save this key - you can't see it again!

### Step 8: Test API Access
In a terminal, test your API key:
```bash
# Replace YOUR_KEY with the key you copied
curl -H "Authorization: Bearer YOUR_KEY" \
     http://localhost:3000/api/example
```

Expected response:
```json
{
  "message": "Hello from the API!",
  "userId": "user_...",
  "subscriptionTier": "starter"
}
```

### Step 9: Test Rate Limiting (if Redis configured)
Run multiple requests quickly:
```bash
# Run this several times quickly
for i in {1..15}; do
  curl -H "Authorization: Bearer YOUR_KEY" \
       http://localhost:3000/api/example
  echo ""
done
```

With starter tier, you should hit the rate limit (100/min) after many requests.

### Step 10: View Database
1. Run `npm run db:studio`
2. Open https://local.drizzle.studio
3. Check tables:
   - **users**: Your user with subscription info
   - **subscriptions**: Active subscription record
   - **apiKeys**: Your generated API key (hashed)
   - **usageTracking**: API calls you made

## ✅ Test Checklist

- [ ] Sign up with test email
- [ ] Sync user to database
- [ ] View dashboard
- [ ] Create test subscription
- [ ] Verify subscription appears
- [ ] Access settings page
- [ ] Generate API key
- [ ] Test API with key
- [ ] Check rate limiting
- [ ] View data in database

## 🎯 Success Criteria

If all steps work:
1. ✅ Authentication flow works
2. ✅ User data syncs to database
3. ✅ Subscription system works
4. ✅ API key generation works
5. ✅ API authentication works
6. ✅ Rate limiting works (if Redis configured)
7. ✅ Database stores all data correctly

## 🐛 Troubleshooting

### "User not found in database"
- Make sure you ran the sync-user command
- Check browser console for errors

### "API returns 401"
- Make sure you're using the full key including `sk_` prefix
- Check that Bearer is capitalized in the header

### "No subscription showing"
- Run the create-subscription command
- Refresh the page

### "Rate limiting not working"
- This is normal without Redis
- Rate limiting returns success without Redis configured

## 🚀 Next Steps

After successful testing:
1. Try different subscription tiers
2. Test upgrading/downgrading (Task 4)
3. Explore the invoice history
4. Build more features!

## 🧹 Cleanup

To test with a fresh account:
1. Sign out
2. Sign up with a new test email (e.g., `test2+clerk_test@example.com`)
3. Repeat the flow