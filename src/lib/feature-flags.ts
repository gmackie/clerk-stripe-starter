// Define all feature flags in one place for type safety
export const FEATURE_FLAGS = {
  // UI Features
  NEW_DASHBOARD_DESIGN: 'new-dashboard-design',
  DARK_MODE: 'dark-mode',
  ADVANCED_ANALYTICS: 'advanced-analytics',
  
  // Billing Features
  USAGE_BASED_BILLING: 'usage-based-billing',
  ANNUAL_DISCOUNT: 'annual-discount',
  CRYPTO_PAYMENTS: 'crypto-payments',
  
  // API Features
  API_V2: 'api-v2',
  RATE_LIMIT_INCREASE: 'rate-limit-increase',
  WEBHOOK_FILTERING: 'webhook-filtering',
  
  // File Features
  LARGE_FILE_UPLOADS: 'large-file-uploads',
  VIDEO_PROCESSING: 'video-processing',
  AI_IMAGE_ANALYSIS: 'ai-image-analysis',
  
  // Experimental Features
  BETA_FEATURES: 'beta-features',
  AI_ASSISTANT: 'ai-assistant',
  REALTIME_COLLABORATION: 'realtime-collaboration',
  
  // Performance Features
  EDGE_CACHING: 'edge-caching',
  LAZY_LOADING: 'lazy-loading',
  
  // Security Features
  TWO_FACTOR_AUTH: 'two-factor-auth',
  AUDIT_LOGS: 'audit-logs',
} as const;

export type FeatureFlag = typeof FEATURE_FLAGS[keyof typeof FEATURE_FLAGS];

// Default values for feature flags (used when PostHog is not available)
export const FEATURE_FLAG_DEFAULTS: Record<FeatureFlag, boolean> = {
  [FEATURE_FLAGS.NEW_DASHBOARD_DESIGN]: false,
  [FEATURE_FLAGS.DARK_MODE]: false,
  [FEATURE_FLAGS.ADVANCED_ANALYTICS]: false,
  [FEATURE_FLAGS.USAGE_BASED_BILLING]: true, // Already implemented
  [FEATURE_FLAGS.ANNUAL_DISCOUNT]: true,
  [FEATURE_FLAGS.CRYPTO_PAYMENTS]: false,
  [FEATURE_FLAGS.API_V2]: false,
  [FEATURE_FLAGS.RATE_LIMIT_INCREASE]: false,
  [FEATURE_FLAGS.WEBHOOK_FILTERING]: false,
  [FEATURE_FLAGS.LARGE_FILE_UPLOADS]: false,
  [FEATURE_FLAGS.VIDEO_PROCESSING]: false,
  [FEATURE_FLAGS.AI_IMAGE_ANALYSIS]: false,
  [FEATURE_FLAGS.BETA_FEATURES]: false,
  [FEATURE_FLAGS.AI_ASSISTANT]: false,
  [FEATURE_FLAGS.REALTIME_COLLABORATION]: false,
  [FEATURE_FLAGS.EDGE_CACHING]: false,
  [FEATURE_FLAGS.LAZY_LOADING]: true,
  [FEATURE_FLAGS.TWO_FACTOR_AUTH]: false,
  [FEATURE_FLAGS.AUDIT_LOGS]: false,
};

// Feature flag groups for easier management
export const FEATURE_FLAG_GROUPS = {
  ui: [
    FEATURE_FLAGS.NEW_DASHBOARD_DESIGN,
    FEATURE_FLAGS.DARK_MODE,
    FEATURE_FLAGS.ADVANCED_ANALYTICS,
  ],
  billing: [
    FEATURE_FLAGS.USAGE_BASED_BILLING,
    FEATURE_FLAGS.ANNUAL_DISCOUNT,
    FEATURE_FLAGS.CRYPTO_PAYMENTS,
  ],
  api: [
    FEATURE_FLAGS.API_V2,
    FEATURE_FLAGS.RATE_LIMIT_INCREASE,
    FEATURE_FLAGS.WEBHOOK_FILTERING,
  ],
  files: [
    FEATURE_FLAGS.LARGE_FILE_UPLOADS,
    FEATURE_FLAGS.VIDEO_PROCESSING,
    FEATURE_FLAGS.AI_IMAGE_ANALYSIS,
  ],
  experimental: [
    FEATURE_FLAGS.BETA_FEATURES,
    FEATURE_FLAGS.AI_ASSISTANT,
    FEATURE_FLAGS.REALTIME_COLLABORATION,
  ],
  performance: [
    FEATURE_FLAGS.EDGE_CACHING,
    FEATURE_FLAGS.LAZY_LOADING,
  ],
  security: [
    FEATURE_FLAGS.TWO_FACTOR_AUTH,
    FEATURE_FLAGS.AUDIT_LOGS,
  ],
} as const;