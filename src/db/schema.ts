import { sql } from 'drizzle-orm';
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull(),
  name: text('name'),
  stripeCustomerId: text('stripe_customer_id'),
  subscriptionId: text('subscription_id'),
  subscriptionStatus: text('subscription_status'),
  priceId: text('price_id'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  preferences: text('preferences'), // JSON string for user preferences
  metadata: text('metadata'), // JSON string for additional metadata
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  stripeSubscriptionId: text('stripe_subscription_id').notNull().unique(),
  stripeCustomerId: text('stripe_customer_id').notNull(),
  stripePriceId: text('stripe_price_id').notNull(),
  stripeCurrentPeriodEnd: integer('stripe_current_period_end', { mode: 'timestamp' }).notNull(),
  status: text('status').notNull(),
  trialEnd: integer('trial_end', { mode: 'timestamp' }),
  cancelAtPeriodEnd: integer('cancel_at_period_end', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const apiKeys = sqliteTable('api_keys', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  name: text('name').notNull(),
  key: text('key').notNull().unique(),
  lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const usageTracking = sqliteTable('usage_tracking', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  endpoint: text('endpoint').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  responseTime: integer('response_time'),
  statusCode: integer('status_code'),
});

export const fileUploads = sqliteTable('file_uploads', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  cloudinaryPublicId: text('cloudinary_public_id').notNull(),
  cloudinaryUrl: text('cloudinary_url').notNull(),
  cloudinarySecureUrl: text('cloudinary_secure_url').notNull(),
  resourceType: text('resource_type').notNull(),
  format: text('format'),
  width: integer('width'),
  height: integer('height'),
  folder: text('folder'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
export type UsageTracking = typeof usageTracking.$inferSelect;
export type NewUsageTracking = typeof usageTracking.$inferInsert;
export type FileUpload = typeof fileUploads.$inferSelect;
export type NewFileUpload = typeof fileUploads.$inferInsert;