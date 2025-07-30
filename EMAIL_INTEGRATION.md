# Email Integration with Resend

This application includes email notification functionality powered by Resend and React Email.

## Features

- **React Email Templates**: Beautiful, responsive email templates built with React
- **Automated Notifications**: 
  - Welcome emails for new users
  - Subscription confirmations
  - Usage alerts (warnings and limit exceeded)
- **Email Preview**: Development tool to preview and test email templates
- **Test Endpoint**: API endpoint to send test emails

## Setup

### 1. Create a Resend Account

1. Go to [Resend.com](https://resend.com) and sign up
2. Create an API key in your dashboard
3. Add your domain for production use (optional)

### 2. Configure Environment Variable

Add to your `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### 3. Update From Addresses (Production)

By default, emails are sent from `@resend.dev` domain. For production:

1. Add and verify your domain in Resend
2. Update the `from` addresses in `src/lib/email.ts`:

```typescript
from: 'Your App <noreply@yourdomain.com>',
```

## Email Templates

### Welcome Email
- **Trigger**: User signs up (via Clerk webhook)
- **Template**: `src/emails/welcome.tsx`
- **Content**: Welcome message, getting started guide

### Subscription Confirmation
- **Trigger**: User subscribes to a paid plan (via Stripe webhook)
- **Template**: `src/emails/subscription-confirmation.tsx`
- **Content**: Plan details, billing info, next steps

### Usage Alert
- **Trigger**: Cron job when usage reaches 80% or exceeds limit
- **Template**: `src/emails/usage-alert.tsx`
- **Content**: Usage statistics, upgrade prompts

## Development Tools

### Email Preview Page

Access at `/email-preview` (development only) to:
- Preview all email templates
- Send test emails to any address
- See live template rendering

### Test Email API

Send test emails programmatically:

```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-clerk-token>" \
  -d '{
    "type": "welcome",
    "email": "test@example.com"
  }'
```

Available types:
- `welcome`
- `subscription`
- `usage-warning`
- `usage-exceeded`

## Creating New Email Templates

1. Create a new template in `src/emails/`:

```tsx
import { Button, Html, Text } from '@react-email/components';

export default function MyEmail({ name }: { name: string }) {
  return (
    <Html>
      <Text>Hello {name}!</Text>
      <Button href="https://example.com">Click me</Button>
    </Html>
  );
}
```

2. Add to email service in `src/lib/email.ts`:

```typescript
async sendMyEmail({ to, name }: { to: string; name: string }) {
  const { data, error } = await resend.emails.send({
    from: 'My App <hello@resend.dev>',
    to,
    subject: 'My Subject',
    react: MyEmail({ name }),
  });
  // ...
}
```

3. Add preview route if needed

## Email Styling

React Email components include:
- Pre-built components with good email client support
- Inline styles automatically applied
- Responsive design support
- Dark mode considerations

## Best Practices

1. **Test Across Clients**: Use Resend's preview feature to test in different email clients
2. **Keep It Simple**: Email HTML/CSS support is limited compared to web
3. **Provide Text Alternatives**: Some users prefer plain text emails
4. **Include Unsubscribe Links**: Required by law in many jurisdictions
5. **Monitor Deliverability**: Check Resend dashboard for bounce rates

## Troubleshooting

### Emails Not Sending

1. Check API key is correctly set
2. Verify Resend service status
3. Check logs for error messages
4. Ensure you're not hitting rate limits

### Emails Going to Spam

1. Verify domain authentication (SPF, DKIM, DMARC)
2. Use a proper from address (not @resend.dev in production)
3. Avoid spam trigger words
4. Include proper unsubscribe links

### Development Issues

- Email preview requires authentication
- Test emails only work with valid Resend API key
- Check browser console for rendering errors

## Rate Limits

Resend free tier includes:
- 3,000 emails/month
- 100 emails/day
- No custom domain

Consider upgrading for production use.

## Security Considerations

1. Never expose email addresses in client-side code
2. Validate email addresses before sending
3. Rate limit email sending endpoints
4. Use environment variables for API keys
5. Implement proper unsubscribe functionality

## Future Enhancements

Consider adding:
- Email preferences management
- Batch email sending
- Email analytics tracking
- A/B testing for email templates
- Digest emails for activity summaries