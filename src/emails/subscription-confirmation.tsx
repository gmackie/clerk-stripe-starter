import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface SubscriptionConfirmationEmailProps {
  userFirstname: string;
  planName: string;
  amount: string;
  interval: string;
  nextBillingDate: string;
  dashboardUrl: string;
  manageUrl: string;
}

export default function SubscriptionConfirmationEmail({
  userFirstname = 'there',
  planName = 'Professional',
  amount = '$29.00',
  interval = 'month',
  nextBillingDate = 'January 1, 2024',
  dashboardUrl = 'https://example.com/dashboard',
  manageUrl = 'https://example.com/settings/billing',
}: SubscriptionConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your subscription to {planName} is now active</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Subscription Confirmed! 🎉</Heading>
          
          <Text style={text}>Hi {userFirstname},</Text>
          
          <Text style={text}>
            Great news! Your subscription to the <strong>{planName}</strong> plan is now active.
            You now have access to all the premium features.
          </Text>

          <Section style={box}>
            <Text style={boxText}>
              <strong>Plan:</strong> {planName}
            </Text>
            <Text style={boxText}>
              <strong>Amount:</strong> {amount}/{interval}
            </Text>
            <Text style={boxText}>
              <strong>Next billing date:</strong> {nextBillingDate}
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <table cellSpacing={16} style={{ margin: '0 auto' }}>
              <tr>
                <td>
                  <Button style={button} href={dashboardUrl}>
                    Go to Dashboard
                  </Button>
                </td>
                <td>
                  <Button style={buttonSecondary} href={manageUrl}>
                    Manage Subscription
                  </Button>
                </td>
              </tr>
            </table>
          </Section>

          <Text style={text}>
            <strong>What's included in your {planName} plan:</strong>
          </Text>
          
          <ul style={list}>
            <li>Unlimited projects</li>
            <li>Priority support</li>
            <li>Advanced analytics</li>
            <li>Team collaboration features</li>
            <li>All API features</li>
          </ul>

          <Hr style={hr} />

          <Text style={footer}>
            You can manage your subscription, update payment methods, or download invoices from your{' '}
            <Link href={manageUrl} style={link}>
              billing settings
            </Link>
            .
          </Text>

          <Text style={footer}>
            Thank you for choosing SaaS Starter!
            <br />
            The SaaS Starter Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
  padding: '0 48px',
};

const box = {
  backgroundColor: '#f4f4f5',
  borderRadius: '8px',
  margin: '24px 48px',
  padding: '24px',
};

const boxText = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '8px 0',
};

const buttonContainer = {
  padding: '27px 0 27px',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '14px 24px',
};

const buttonSecondary = {
  backgroundColor: '#fff',
  border: '1px solid #d1d5db',
  borderRadius: '5px',
  color: '#374151',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '14px 24px',
};

const list = {
  padding: '0 48px',
  margin: '16px 0',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#697386',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
  padding: '0 48px',
};

const link = {
  color: '#2563eb',
  textDecoration: 'underline',
};