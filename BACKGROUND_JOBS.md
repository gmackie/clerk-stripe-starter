# Background Jobs with Inngest

This application uses Inngest for reliable background job processing. Inngest provides durable execution, automatic retries, and observability for serverless functions.

## Features

- **Event-driven architecture**: Jobs triggered by events from webhooks and API calls
- **Durable execution**: Jobs survive server restarts and deployments
- **Automatic retries**: Failed jobs retry with exponential backoff
- **Step functions**: Break complex jobs into smaller, resumable steps
- **Observability**: Built-in dashboard for monitoring job execution
- **Type safety**: Full TypeScript support with event type definitions

## Setup

### 1. Install Inngest CLI (Development)

```bash
npm install -g inngest-cli
# or
brew install inngest/tap/inngest
```

### 2. Start Inngest Dev Server

```bash
inngest dev
```

This starts the Inngest dev server at http://localhost:8288

### 3. Environment Variables

Add to your `.env.local`:

```env
# Optional: Add signing key for production
INNGEST_SIGNING_KEY=your_signing_key
```

## Event Types

### Subscription Events

- `user.subscription.created` - New subscription created
- `user.subscription.updated` - Subscription plan changed
- `user.subscription.cancelled` - Subscription cancelled
- `subscription.trial.ending` - Trial period ending soon

### Usage Events

- `user.usage.limit.warning` - User approaching usage limit (80%)
- `user.usage.limit.exceeded` - User exceeded usage limit

### File Events

- `user.file.uploaded` - File uploaded successfully
- `user.file.process` - Process file (thumbnail, compress, analyze)

### Billing Events

- `billing.invoice.payment_failed` - Payment attempt failed

### Onboarding Events

- `user.onboarding.step` - Track onboarding progress

## Background Jobs

### Email Notifications

Sends automated emails based on user actions:

```typescript
// Triggered when subscription is created
handleSubscriptionCreated
// Sends subscription confirmation email

// Triggered when usage hits 80% or 100%
handleUsageLimitWarning
handleUsageLimitExceeded
// Sends usage alert emails
```

### File Processing

Processes uploaded files asynchronously:

```typescript
processUploadedFile
// - Generates thumbnails for images
// - Extracts metadata
// - Performs content analysis

batchProcessFiles
// - Compress files
// - Create thumbnails
// - Analyze content
```

### Billing Reminders

Handles trial reminders and failed payments:

```typescript
sendTrialEndingReminder
// - Sends reminder emails at 3, 1, and 0 days before trial ends
// - Schedules follow-up reminders

handleFailedPayment
// - Notifies user of payment failure
// - Suspends subscription after 3 attempts
```

### User Onboarding

Manages onboarding flow:

```typescript
handleOnboardingStep
// - Sends welcome emails
// - Schedules profile completion reminders
// - Tracks onboarding progress

checkOnboardingProgress
// - Daily cron job
// - Sends reminders to incomplete users
```

## Triggering Events

### From API Routes

```typescript
import { inngest } from '@/lib/inngest';

// Trigger an event
await inngest.send({
  name: 'user.file.uploaded',
  data: {
    userId: 'user_123',
    fileId: 'file_456',
    filename: 'document.pdf',
    size: 1024000,
    mimeType: 'application/pdf',
  },
});
```

### From Webhooks

Events are automatically triggered from:
- Stripe webhooks (subscription events)
- File upload API (file processing)
- Cron jobs (usage alerts)

## Development Tools

### Jobs Dashboard

Access at `/jobs` in development to:
- View Inngest dashboard link
- Trigger test events
- See job types and descriptions

### Test Events

Use the test API endpoint to trigger events:

```bash
curl -X POST http://localhost:3000/api/test-job \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <clerk-token>" \
  -d '{"eventName": "subscription.created"}'
```

## Step Functions

Break complex jobs into steps for better reliability:

```typescript
export const complexJob = inngest.createFunction(
  { id: 'complex-job', name: 'Complex Job' },
  { event: 'complex.event' },
  async ({ event, step }) => {
    // Step 1: Fetch data
    const data = await step.run('fetch-data', async () => {
      return await fetchExternalData();
    });

    // Step 2: Process data
    const result = await step.run('process-data', async () => {
      return await processData(data);
    });

    // Step 3: Send notification
    await step.run('send-notification', async () => {
      await sendNotification(result);
    });

    return { success: true };
  }
);
```

## Error Handling

### Automatic Retries

Functions automatically retry with exponential backoff:
- 1st retry: 30 seconds
- 2nd retry: 2 minutes
- 3rd retry: 10 minutes

Configure custom retry behavior:

```typescript
export const myFunction = inngest.createFunction(
  {
    id: 'my-function',
    name: 'My Function',
    retries: 5, // Custom retry count
  },
  { event: 'my.event' },
  async ({ event }) => {
    // Function logic
  }
);
```

### Error Recovery

Failed jobs appear in the Inngest dashboard with:
- Error details and stack traces
- Event payload
- Execution timeline
- Manual retry options

## Production Deployment

### 1. Set Signing Key

Generate and set a signing key for webhook security:

```env
INNGEST_SIGNING_KEY=signkey_prod_xxxxx
```

### 2. Configure Inngest Cloud

1. Sign up at [inngest.com](https://inngest.com)
2. Create an app and get your signing key
3. Deploy your application
4. Inngest automatically discovers your functions

### 3. Monitor Jobs

Access the Inngest dashboard to:
- View function runs
- Debug failures
- Monitor performance
- Set up alerts

## Best Practices

1. **Idempotency**: Design functions to be safely retryable
2. **Event Schema**: Define clear event types with TypeScript
3. **Step Functions**: Break complex jobs into resumable steps
4. **Error Handling**: Let functions fail fast for automatic retries
5. **Monitoring**: Use Inngest dashboard for debugging

## Troubleshooting

### Jobs Not Running

1. Ensure Inngest dev server is running: `inngest dev`
2. Check the Inngest dashboard at http://localhost:8288
3. Verify events are being sent correctly
4. Check function registration in `/api/inngest`

### Type Errors

Ensure event types match between send and receive:

```typescript
// Define event type
type MyEvent = {
  data: {
    userId: string;
    action: string;
  };
};

// Send event
await inngest.send({
  name: 'my.event',
  data: { userId: '123', action: 'test' },
});

// Receive event
async ({ event }: { event: MyEvent }) => {
  console.log(event.data.userId);
};
```

### Performance Issues

- Use step functions to break up long-running tasks
- Implement concurrency limits for batch processing
- Monitor function duration in Inngest dashboard

## Extending the System

### Add New Event Types

1. Define the event in `src/lib/inngest.ts`:

```typescript
export type InngestEvents = {
  // ... existing events
  'my.new.event': {
    data: {
      customField: string;
      timestamp: number;
    };
  };
};
```

2. Create a handler in `src/inngest/functions/`:

```typescript
export const handleMyEvent = inngest.createFunction(
  { id: 'my-event-handler', name: 'Handle My Event' },
  { event: 'my.new.event' },
  async ({ event }) => {
    // Handle the event
  }
);
```

3. Export from `src/inngest/functions/index.ts`

### Add Scheduled Jobs

Create cron-based functions:

```typescript
export const dailyReport = inngest.createFunction(
  { id: 'daily-report', name: 'Daily Report' },
  { cron: '0 9 * * *' }, // 9 AM daily
  async () => {
    // Generate and send daily report
  }
);
```