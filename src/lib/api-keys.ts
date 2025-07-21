import crypto from 'crypto';

export function generateApiKey(): string {
  // Generate a secure random API key
  const prefix = 'sk_live_';
  const randomBytes = crypto.randomBytes(32);
  const key = randomBytes.toString('base64url');
  return `${prefix}${key}`;
}

export function hashApiKey(key: string): string {
  // Hash the API key for storage
  return crypto.createHash('sha256').update(key).digest('hex');
}