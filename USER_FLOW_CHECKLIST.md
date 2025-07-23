# User Flow Test Checklist ✅

Use this checklist to manually test the complete user flow. Check off each item as you complete it.

## Test Information
- **Date**: _______________
- **Tester**: _______________
- **Test Email**: `test+clerk_test@example.com`
- **Verification Code**: `424242`

## 1. Authentication Flow

### Sign Up
- [ ] Navigate to http://localhost:3000/sign-up
- [ ] Enter email: `test+clerk_test@example.com`
- [ ] Enter password
- [ ] Click "Continue"
- [ ] Enter verification code: `424242`
- [ ] Verify redirect to `/dashboard`

### Sign Out/In
- [ ] Click sign out
- [ ] Navigate to http://localhost:3000/sign-in
- [ ] Enter same credentials
- [ ] Verify successful login

## 2. Database Sync

### Sync User
- [ ] Open browser console (F12)
- [ ] Run sync command:
  ```javascript
  fetch('/api/dev/sync-user', { method: 'POST' })
    .then(r => r.json())
    .then(console.log)
  ```
- [ ] Verify response shows "User created" or "User updated"
- [ ] Note the user ID: _______________

## 3. Dashboard

### Initial State
- [ ] Refresh dashboard page
- [ ] Verify user email displayed
- [ ] Verify "No active subscription" shown
- [ ] Verify "Test API Call" button exists

### API Test (Should Fail)
- [ ] Click "Test API Call"
- [ ] Verify it works (user is authenticated)

## 4. Subscription

### Create Test Subscription
- [ ] In browser console, run:
  ```javascript
  fetch('/api/dev/create-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tier: 'starter', period: 'monthly' })
  }).then(r => r.json()).then(console.log)
  ```
- [ ] Verify response shows "Test subscription created"
- [ ] Note subscription ID: _______________

### Verify Subscription
- [ ] Refresh dashboard
- [ ] Verify subscription shows as "active"
- [ ] Verify plan shows as "Starter"
- [ ] Verify "Manage Subscription" button appears

## 5. Settings Page

### Navigate to Settings
- [ ] Go to http://localhost:3000/settings
- [ ] Verify page loads without errors

### Profile Section
- [ ] Verify email is displayed
- [ ] Verify name field exists
- [ ] Try updating name
- [ ] Verify update success message

### Billing Section
- [ ] Verify subscription status shown
- [ ] Verify current plan displayed
- [ ] Verify "Manage Subscription" button exists

## 6. API Keys

### Generate API Key
- [ ] In Settings, find API Keys section
- [ ] Click "Generate New Key"
- [ ] Enter name: "Test Key"
- [ ] Click generate
- [ ] Copy the key: _______________
- [ ] Verify key starts with `sk_`
- [ ] Verify success message

### Verify Key Listed
- [ ] Verify key appears in list
- [ ] Verify name is correct
- [ ] Verify "Last used" shows "Never"

## 7. API Testing

### Test with API Key
- [ ] Open terminal
- [ ] Run (replace YOUR_KEY):
  ```bash
  curl -H "Authorization: Bearer YOUR_KEY" \
       http://localhost:3000/api/example
  ```
- [ ] Verify successful response
- [ ] Verify userId in response
- [ ] Verify subscriptionTier is "starter"

### Test Rate Limiting
- [ ] Run multiple requests:
  ```bash
  for i in {1..5}; do
    curl -H "Authorization: Bearer YOUR_KEY" \
         http://localhost:3000/api/example
    echo ""
  done
  ```
- [ ] Verify all requests succeed (rate limiting may be disabled without Redis)

## 8. Database Verification

### Open Database Studio
- [ ] Run `npm run db:studio`
- [ ] Open https://local.drizzle.studio

### Verify Data
- [ ] **users** table:
  - [ ] User exists with correct email
  - [ ] stripeCustomerId is set
  - [ ] subscriptionStatus is "active"
  - [ ] priceId contains "starter"
- [ ] **subscriptions** table:
  - [ ] Subscription record exists
  - [ ] status is "active"
  - [ ] stripePriceId matches user
- [ ] **apiKeys** table:
  - [ ] API key exists (hashed)
  - [ ] name matches what you entered
- [ ] **usageTracking** table:
  - [ ] Records exist for your API calls
  - [ ] endpoint shows "/api/example"
  - [ ] statusCode is 200

## 9. Additional Tests

### Different Subscription Tiers
- [ ] Create new subscription with "professional" tier
- [ ] Verify dashboard updates
- [ ] Test API shows new tier

### Multiple API Keys
- [ ] Generate second API key
- [ ] Verify both keys work
- [ ] Delete first key
- [ ] Verify deleted key no longer works

### Error Cases
- [ ] Try API without auth (should get 401)
- [ ] Try invalid API key (should get 401)
- [ ] Try accessing /dashboard when signed out (should redirect)

## 10. Cleanup

### Sign Out
- [ ] Sign out of the application
- [ ] Verify redirect to home page

### Summary
- [ ] All authentication flows work
- [ ] Database sync works
- [ ] Subscription system works
- [ ] API keys work
- [ ] API authentication works
- [ ] All data properly stored in database

## Notes

_Use this space to note any issues or observations:_

_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________

## Test Result

- [ ] **PASSED** - All items checked
- [ ] **FAILED** - See notes above

**Signature**: _______________ **Date**: _______________