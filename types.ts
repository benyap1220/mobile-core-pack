/**
 * TypeScript Types for PromoParser Mobile
 * DTOs for all entities used in the app
 */

// ============================================
// VOUCHER TYPES
// ============================================

export interface Voucher {
  voucher_id: string;
  user_id: string;
  merchant: string;
  merchant_logo_path: string | null;
  merchant_domain: string | null;
  location: string | null;
  deal_type: 'percentage' | 'amount' | 'other' | null;
  value: number | null;
  currency: string;
  expiry_date: string | null;
  valid_from: string | null;
  conditions: string | null;
  personal_notes: string | null;
  tags: string[];
  status: 'active' | 'used' | 'expired';
  category: 'food' | 'fitness' | 'travel' | 'other' | null;
  display_title: string | null;
  source_offer_id: string | null;
  used_at: string | null;
  created_at: string;
  updated_at: string;
  affiliate_offers?: {
    deep_link: string;
  } | null;
}

export interface VoucherUpdate {
  merchant: string;
  merchant_domain?: string | null;
  merchant_logo_path?: string | null;
  deal_type?: 'percentage' | 'amount' | 'other' | null;
  value?: number | null;
  currency: string;
  category?: 'food' | 'fitness' | 'travel' | 'other' | null;
  expiry_date?: string | null;
  valid_from?: string | null;
  conditions?: string | null;
  personal_notes?: string | null;
  tags: string[];
}

// ============================================
// USER SETTINGS TYPES
// ============================================

export interface UserSettings {
  user_id: string;
  push_enabled: boolean;
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  locale: string;
  currency: string;
  gmail_connected: boolean;
  gmail_refresh_token: string | null;
  created_at: string;
  updated_at: string;
  logo_lookup_enabled: boolean;
}

// ============================================
// DEAL TYPES
// ============================================

export interface Deal {
  id: string;
  offer_id: number;
  deeplink_id: string;
  deeplink_type: string;
  title: string;
  summary?: string | null;
  code?: string | null;
  tags: string[];
  image_url?: string | null;
  expires_at?: string | null;
  platform: string;
  platform_logo?: string | null;
  country?: string | null;
  source: string;
  has_coupon: boolean;
  border?: BorderStyle | null;
}

export interface DealDetail extends Deal {
  promo?: Promo | null;
  advertiser?: Advertiser | null;
  deeplink_url?: string | null;
}

export interface Promo {
  promo_id: string;
  offer_id: number;
  title: string;
  notes: string | null;
  coupon_code: string | null;
  landing_url: string | null;
  image_url: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface Advertiser {
  advertiser_id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
}

export interface BorderStyle {
  id: string;
  title: string;
  style_tag: string;
  preview_path: string;
  image_path: string;
  layout_mode: string;
  safe_area: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
}

export interface DealsListResponse {
  items: Deal[];
  next_cursor: {
    score: number;
    created_at: string;
    id: string;
  } | null;
}

// ============================================
// AUTH TYPES
// ============================================

export interface AuthUser {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
  user: AuthUser;
}

export interface SignUpResponse {
  user: AuthUser | null;
  session: AuthSession | null;
}

export interface SignInResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: AuthUser;
}

// ============================================
// TRACKING TYPES
// ============================================

export interface AffiliateClick {
  id: string;
  deal_id: string;
  user_id: string | null;
  clicked_at: string;
  user_agent: string | null;
}

export interface AffiliateImpression {
  id: string;
  deal_id: string;
  user_id: string | null;
  viewed_at: string;
}

// ============================================
// UTILITY TYPES
// ============================================

export interface TotalSavedResponse {
  total: number;
  has_mixed_currencies: boolean;
}

export interface MerchantLogoCache {
  merchant_slug: string;
  public_url: string;
  cached_at: string;
}

// ============================================
// CURRENCY TYPES
// ============================================

export type Currency =
  | 'MYR'
  | 'SGD'
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'PHP'
  | 'THB'
  | 'IDR'
  | 'VND'
  | 'CNY'
  | 'JPY'
  | 'KRW'
  | 'AUD'
  | 'NZD';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  locale: string;
}
