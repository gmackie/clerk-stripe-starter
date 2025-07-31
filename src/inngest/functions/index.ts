// Export all Inngest functions
export * from './subscription-notifications';
export * from './file-processing';
export * from './billing-reminders';
export * from './user-onboarding';

// You can also create a single array of all functions for easier registration
import { 
  handleSubscriptionCreated,
  handleUsageLimitWarning,
  handleUsageLimitExceeded,
} from './subscription-notifications';

import {
  processUploadedFile,
  batchProcessFiles,
} from './file-processing';

import {
  sendTrialEndingReminder,
  handleFailedPayment,
} from './billing-reminders';

import {
  handleOnboardingStep,
  checkOnboardingProgress,
} from './user-onboarding';

export const functions = [
  // Subscription notifications
  handleSubscriptionCreated,
  handleUsageLimitWarning,
  handleUsageLimitExceeded,
  
  // File processing
  processUploadedFile,
  batchProcessFiles,
  
  // Billing reminders
  sendTrialEndingReminder,
  handleFailedPayment,
  
  // User onboarding
  handleOnboardingStep,
  checkOnboardingProgress,
];