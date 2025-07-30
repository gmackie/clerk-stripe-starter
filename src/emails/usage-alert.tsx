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

interface UsageAlertEmailProps {
  userFirstname: string;
  usagePercentage: number;
  currentUsage: number;
  limit: number;
  planName: string;
  upgradeUrl: string;
  usageUrl: string;
}

export default function UsageAlertEmail({
  userFirstname = 'there',
  usagePercentage = 80,
  currentUsage = 800,
  limit = 1000,
  planName = 'Starter',
  upgradeUrl = 'https://example.com/pricing',
  usageUrl = 'https://example.com/settings?tab=usage',
}: UsageAlertEmailProps) {
  const isExceeded = usagePercentage >= 100;
  const alertColor = isExceeded ? '#dc2626' : '#f59e0b';
  const alertTitle = isExceeded ? 'API Usage Limit Exceeded' : 'Approaching API Usage Limit';
  
  return (
    <Html>
      <Head />
      <Preview>{alertTitle} - {usagePercentage}% of monthly limit used</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ ...alertBox, borderColor: alertColor }}>
            <Heading style={{ ...h1, color: alertColor }}>
              ⚠️ {alertTitle}
            </Heading>
          </Section>
          
          <Text style={text}>Hi {userFirstname},</Text>
          
          <Text style={text}>
            {isExceeded ? (
              <>
                Your API usage has exceeded your monthly limit on the <strong>{planName}</strong> plan.
                Additional API calls will incur overage charges.
              </>
            ) : (
              <>
                You've used <strong>{usagePercentage}%</strong> of your monthly API limit on the{' '}
                <strong>{planName}</strong> plan. We wanted to give you a heads up before you reach your limit.
              </>
            )}
          </Text>

          <Section style={box}>
            <Text style={centerText}>
              <span style={bigNumber}>{currentUsage.toLocaleString()}</span>
              <span style={separator}> / </span>
              <span style={limitNumber}>{limit.toLocaleString()}</span>
            </Text>
            <Text style={{ ...centerText, marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>
              API calls used this month
            </Text>
            
            {/* Progress bar */}
            <div style={progressBarContainer}>
              <div 
                style={{
                  ...progressBar,
                  width: `${Math.min(usagePercentage, 100)}%`,
                  backgroundColor: alertColor,
                }}
              />
            </div>
          </Section>

          {isExceeded ? (
            <Text style={text}>
              <strong>What happens now?</strong>
              <br />
              • Each additional API call will be charged at your plan's overage rate
              <br />
              • Charges will be added to your next invoice
              <br />
              • Consider upgrading to avoid overage charges
            </Text>
          ) : (
            <Text style={text}>
              To avoid overage charges when you exceed your limit, consider upgrading your plan
              for higher limits and better rates.
            </Text>
          )}

          <Section style={buttonContainer}>
            <table cellSpacing={16} style={{ margin: '0 auto' }}>
              <tr>
                <td>
                  <Button style={button} href={upgradeUrl}>
                    Upgrade Plan
                  </Button>
                </td>
                <td>
                  <Button style={buttonSecondary} href={usageUrl}>
                    View Detailed Usage
                  </Button>
                </td>
              </tr>
            </table>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            You're receiving this email because you have usage alerts enabled. You can manage your
            notification preferences in your{' '}
            <Link href="https://example.com/settings?tab=notifications" style={link}>
              settings
            </Link>
            .
          </Text>

          <Text style={footer}>
            Need help managing your usage? Check out our{' '}
            <Link href="https://example.com/docs/api-usage" style={link}>
              usage optimization guide
            </Link>
            .
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

const alertBox = {
  borderTop: '4px solid',
  paddingTop: '20px',
  marginBottom: '20px',
};

const h1 = {
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0 48px',
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

const centerText = {
  textAlign: 'center' as const,
  margin: '0',
};

const bigNumber = {
  fontSize: '36px',
  fontWeight: 'bold',
  color: '#111827',
};

const separator = {
  fontSize: '24px',
  color: '#9ca3af',
  margin: '0 8px',
};

const limitNumber = {
  fontSize: '24px',
  color: '#6b7280',
};

const progressBarContainer = {
  backgroundColor: '#e5e7eb',
  borderRadius: '4px',
  height: '8px',
  marginTop: '16px',
  overflow: 'hidden',
};

const progressBar = {
  height: '100%',
  transition: 'width 0.3s ease',
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