import { Inngest } from 'inngest';

// Create an Inngest client
export const inngest = new Inngest({ 
  id: 'saas-starter',
  name: 'SaaS Starter',
});

// Event types for type safety
export type InngestEvents = {
  'user.subscription.created': {
    data: {
      userId: string;
      subscriptionId: string;
      priceId: string;
      planName: string;
    };
  };
  'user.subscription.updated': {
    data: {
      userId: string;
      subscriptionId: string;
      oldPriceId: string;
      newPriceId: string;
    };
  };
  'user.subscription.cancelled': {
    data: {
      userId: string;
      subscriptionId: string;
    };
  };
  'user.usage.limit.warning': {
    data: {
      userId: string;
      usage: number;
      limit: number;
      percentage: number;
    };
  };
  'user.usage.limit.exceeded': {
    data: {
      userId: string;
      usage: number;
      limit: number;
    };
  };
  'user.file.uploaded': {
    data: {
      userId: string;
      fileId: string;
      filename: string;
      size: number;
      mimeType: string;
    };
  };
  'user.file.process': {
    data: {
      userId: string;
      fileId: string;
      fileUrl: string;
      mimeType: string;
      processingType: 'thumbnail' | 'compress' | 'analyze';
    };
  };
  'subscription.trial.ending': {
    data: {
      userId: string;
      subscriptionId: string;
      trialEndDate: string;
      daysRemaining: number;
    };
  };
  'billing.invoice.payment_failed': {
    data: {
      userId: string;
      invoiceId: string;
      amount: number;
      attemptCount: number;
    };
  };
  'user.onboarding.step': {
    data: {
      userId: string;
      step: 'welcome' | 'profile' | 'team' | 'complete';
      metadata?: Record<string, any>;
    };
  };
};