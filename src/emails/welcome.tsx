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

interface WelcomeEmailProps {
  userFirstname: string;
  loginUrl: string;
}

export default function WelcomeEmail({
  userFirstname = 'there',
  loginUrl = 'https://example.com/sign-in',
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to SaaS Starter - Get started with your account</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to SaaS Starter!</Heading>
          
          <Text style={text}>Hi {userFirstname},</Text>
          
          <Text style={text}>
            Thanks for signing up! We're excited to have you on board. Your account has been created
            successfully and you're ready to explore all the features our platform has to offer.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={loginUrl}>
              Get Started
            </Button>
          </Section>

          <Text style={text}>Here's what you can do next:</Text>
          
          <ul style={list}>
            <li>Complete your profile in Settings</li>
            <li>Generate your first API key</li>
            <li>Explore our pricing plans</li>
            <li>Check out the documentation</li>
          </ul>

          <Hr style={hr} />

          <Text style={footer}>
            If you have any questions, feel free to reply to this email or visit our{' '}
            <Link href="https://example.com/support" style={link}>
              support center
            </Link>
            .
          </Text>

          <Text style={footer}>
            Happy building!
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

const buttonContainer = {
  padding: '27px 0 27px',
  textAlign: 'center' as const,
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
  width: '200px',
  padding: '14px',
  margin: '0 auto',
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