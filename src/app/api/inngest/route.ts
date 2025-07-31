import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest';
import { functions } from '@/inngest/functions';

// Create the Inngest API route handler
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
  // Optional: Add signing key for production
  signingKey: process.env.INNGEST_SIGNING_KEY,
  // Optional: Configure for production
  landingPage: process.env.NODE_ENV !== 'production',
});