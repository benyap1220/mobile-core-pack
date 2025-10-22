/**
 * Validation Schemas using Zod
 * Reusable across web and mobile
 */

import { z } from 'zod';

// ============================================
// VOUCHER SCHEMAS
// ============================================

export const voucherUpdateSchema = z.object({
  merchant: z.string().min(1, 'Merchant name required').max(100, 'Merchant name too long'),
  merchant_domain: z.string().max(100).optional().nullable(),
  merchant_logo_path: z.string().max(500).optional().nullable(),
  deal_type: z.enum(['percentage', 'amount', 'other']).optional().nullable(),
  value: z.number().min(0).max(1000000).optional().nullable(),
  currency: z.string().min(2).max(10),
  category: z.enum(['food', 'fitness', 'travel', 'other']).optional().nullable(),
  expiry_date: z.string().optional().nullable(),
  valid_from: z.string().optional().nullable(),
  conditions: z.string().max(1000).optional().nullable(),
  personal_notes: z.string().max(1000).optional().nullable(),
  tags: z.array(z.string().max(30)).max(10),
});

export const customTagSchema = z
  .string()
  .min(1, 'Tag cannot be empty')
  .max(30, 'Tag too long')
  .regex(/^[a-zA-Z0-9\s&-]+$/, 'Tag contains invalid characters');

export const merchantNameSchema = z
  .string()
  .min(1, 'Merchant name required')
  .max(100, 'Merchant name too long');

// ============================================
// USER SETTINGS SCHEMAS
// ============================================

export const userSettingsSchema = z.object({
  user_id: z.string().uuid(),
  push_enabled: z.boolean().default(true),
  email_enabled: z.boolean().default(true),
  whatsapp_enabled: z.boolean().default(false),
  locale: z.string().default('en-US'),
  currency: z.string().min(2).max(10).default('MYR'),
  gmail_connected: z.boolean().default(false),
  gmail_refresh_token: z.string().nullable().optional(),
  logo_lookup_enabled: z.boolean().default(true),
});

// ============================================
// DEAL SCHEMAS
// ============================================

export const dealSchema = z.object({
  id: z.string().uuid(),
  offer_id: z.number(),
  deeplink_id: z.string().uuid(),
  deeplink_type: z.string(),
  title: z.string(),
  summary: z.string().optional().nullable(),
  code: z.string().optional().nullable(),
  tags: z.array(z.string()),
  image_url: z.string().url().optional().nullable(),
  expires_at: z.string().optional().nullable(),
  platform: z.string(),
  platform_logo: z.string().url().optional().nullable(),
  country: z.string().optional().nullable(),
  source: z.string(),
  has_coupon: z.boolean(),
  border: z.any().optional().nullable(),
});

// ============================================
// AUTH SCHEMAS
// ============================================

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ============================================
// CURRENCY SCHEMAS
// ============================================

export const currencySchema = z.enum([
  'MYR',
  'SGD',
  'USD',
  'EUR',
  'GBP',
  'PHP',
  'THB',
  'IDR',
  'VND',
  'CNY',
  'JPY',
  'KRW',
  'AUD',
  'NZD',
]);

// ============================================
// TYPE EXPORTS
// ============================================

export type VoucherUpdate = z.infer<typeof voucherUpdateSchema>;
export type UserSettings = z.infer<typeof userSettingsSchema>;
export type Deal = z.infer<typeof dealSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type Currency = z.infer<typeof currencySchema>;
