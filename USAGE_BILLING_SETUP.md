# Usage-Based Billing Setup

This application includes usage-based billing functionality that tracks API usage and charges for overages.

## Features

- **API Usage Tracking**: Every API call is automatically tracked in the database
- **Monthly Usage Limits**: Each subscription tier has defined API call limits
- **Overage Pricing**: Automatic calculation of charges for usage beyond limits
- **Usage Dashboard**: Real-time monitoring of API usage and costs
- **Billing Integration**: Overage charges are automatically added to Stripe invoices

## Pricing Structure

| Tier | Monthly Limit | Overage Rate |
|------|--------------|--------------|
| Free | 100 calls | $0.02/call |
| Starter | 1,000 calls | $0.01/call |
| Professional | 50,000 calls | $0.005/call |
| Enterprise | Unlimited | No overages |

## Required Cron Jobs

To enable usage-based billing, you need to set up two cron jobs:

### 1. Monthly Usage Calculation (1st of each month)

```bash
# Run at 00:05 on the 1st of every month
5 0 1 * * curl -X POST https://your-domain.com/api/cron/calculate-usage \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

This job:
- Calculates the previous month's usage for all users
- Creates Stripe invoice items for any overages
- Automatically generates and sends invoices

### 2. Daily Usage Alerts (Daily at 9 AM)

```bash
# Run daily at 09:00
0 9 * * * curl -X POST https://your-domain.com/api/cron/usage-alerts \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

This job:
- Checks current month usage for all users
- Sends warning emails when users reach 80% of their limit
- Sends alerts when limits are exceeded

## Environment Variables

Add this to your `.env.local`:

```env
# Secret for authenticating cron job requests
CRON_SECRET=your-secure-random-string-here
```

## Setting Up Cron Jobs

### Option 1: Using GitHub Actions

Create `.github/workflows/cron-jobs.yml`:

```yaml
name: Usage Billing Cron Jobs

on:
  schedule:
    # Monthly billing calculation
    - cron: '5 0 1 * *'
    # Daily usage alerts
    - cron: '0 9 * * *'

jobs:
  calculate-usage:
    if: github.event.schedule == '5 0 1 * *'
    runs-on: ubuntu-latest
    steps:
      - name: Calculate Monthly Usage
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/cron/calculate-usage \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"

  usage-alerts:
    if: github.event.schedule == '0 9 * * *'
    runs-on: ubuntu-latest
    steps:
      - name: Send Usage Alerts
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/cron/usage-alerts \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### Option 2: Using Vercel Cron

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/calculate-usage",
      "schedule": "5 0 1 * *"
    },
    {
      "path": "/api/cron/usage-alerts",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### Option 3: External Cron Service

Use a service like:
- [Cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- [Uptime Robot](https://uptimerobot.com)

## Testing Usage Billing

1. Make API calls to accumulate usage
2. Check the usage dashboard at `/settings?tab=usage`
3. View billing information at `/settings/billing`
4. Manually trigger the cron endpoints to test:

```bash
# Test usage calculation
curl -X POST http://localhost:3000/api/cron/calculate-usage \
  -H "Authorization: Bearer your-cron-secret"

# Test usage alerts
curl -X POST http://localhost:3000/api/cron/usage-alerts \
  -H "Authorization: Bearer your-cron-secret"
```

## Email Notifications

To enable email notifications for usage alerts, integrate an email service like:
- SendGrid
- Resend
- AWS SES
- Postmark

Update the `/api/cron/usage-alerts` endpoint to send actual emails instead of just logging.