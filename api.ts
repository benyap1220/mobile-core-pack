/**
 * API Client for PromoParser Mobile
 * All endpoint functions with no React/Next dependencies
 */

import { makeHttp, HttpResponse } from './http';
import { TokenStore, supabaseHeaders } from './auth';
import type {
  Voucher,
  VoucherUpdate,
  UserSettings,
  Deal,
  DealDetail,
  DealsListResponse,
} from '../validation/types';

export interface ApiConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  tokenStore: TokenStore;
}

/**
 * Creates API client with all endpoint methods
 */
export function createApiClient(config: ApiConfig) {
  const { supabaseUrl, supabaseAnonKey, tokenStore } = config;

  // HTTP client for Supabase REST API
  const restClient = makeHttp({
    baseUrl: `${supabaseUrl}/rest/v1`,
    getHeaders: () => supabaseHeaders(supabaseAnonKey, tokenStore),
  });

  // HTTP client for Supabase Edge Functions
  const functionsClient = makeHttp({
    baseUrl: `${supabaseUrl}/functions/v1`,
    getHeaders: () => supabaseHeaders(supabaseAnonKey, tokenStore),
  });

  // HTTP client for Supabase Auth
  const authClient = makeHttp({
    baseUrl: `${supabaseUrl}/auth/v1`,
    getHeaders: async () => ({
      apikey: supabaseAnonKey,
      'x-supabase-api-version': '2024-01-01',
    }),
  });

  return {
    // ============================================
    // AUTH ENDPOINTS
    // ============================================

    auth: {
      /**
       * Sign up a new user
       */
      async signUp(email: string, password: string, emailRedirectTo?: string) {
        return authClient.post('/signup', {
          email,
          password,
          options: emailRedirectTo ? { emailRedirectTo } : undefined,
        });
      },

      /**
       * Sign in with email and password
       */
      async signIn(email: string, password: string) {
        return authClient.post('/token?grant_type=password', {
          email,
          password,
        });
      },

      /**
       * Sign out (requires valid token)
       */
      async signOut() {
        const token = await tokenStore.getAccessToken();
        if (!token) throw new Error('No active session');
        
        return authClient.post('/logout', null);
      },

      /**
       * Get current user
       */
      async getUser() {
        return authClient.get('/user');
      },

      /**
       * Refresh session with refresh token
       */
      async refreshSession(refreshToken: string) {
        return authClient.post('/token?grant_type=refresh_token', {
          refresh_token: refreshToken,
        });
      },
    },

    // ============================================
    // VOUCHER ENDPOINTS
    // ============================================

    vouchers: {
      /**
       * List active vouchers for current user
       */
      async list(params?: {
        status?: 'active' | 'used' | 'expired';
        category?: string;
        orderBy?: string;
      }): Promise<HttpResponse<Voucher[]>> {
        const queryParams: any = {
          select: 'voucher_id,merchant,merchant_logo_path,merchant_domain,location,deal_type,value,currency,expiry_date,conditions,personal_notes,tags,status,category,display_title,source_offer_id,affiliate_offers:source_offer_id(deep_link)',
        };
        
        if (params?.status) {
          queryParams['status'] = `eq.${params.status}`;
        }
        
        if (params?.orderBy) {
          queryParams['order'] = params.orderBy;
        } else {
          queryParams['order'] = 'expiry_date.asc';
        }

        return restClient.get('/vouchers', queryParams);
      },

      /**
       * Get single voucher by ID
       */
      async getById(voucherId: string): Promise<HttpResponse<Voucher>> {
        return restClient.get('/vouchers', {
          voucher_id: `eq.${voucherId}`,
          select: '*',
        });
      },

      /**
       * Create new voucher
       */
      async create(voucher: Omit<VoucherUpdate, 'voucher_id'>): Promise<HttpResponse<Voucher>> {
        return restClient.post('/vouchers', voucher);
      },

      /**
       * Update existing voucher
       */
      async update(voucherId: string, updates: Partial<VoucherUpdate>): Promise<HttpResponse<Voucher>> {
        return restClient.patch(`/vouchers?voucher_id=eq.${voucherId}`, updates);
      },

      /**
       * Delete voucher
       */
      async delete(voucherId: string): Promise<HttpResponse<void>> {
        return restClient.delete(`/vouchers?voucher_id=eq.${voucherId}`);
      },

      /**
       * Mark voucher as used
       */
      async markAsUsed(voucherId: string, usedAt?: string): Promise<HttpResponse<Voucher>> {
        return restClient.patch(`/vouchers?voucher_id=eq.${voucherId}`, {
          status: 'used',
          used_at: usedAt || new Date().toISOString(),
        });
      },
    },

    // ============================================
    // DEALS ENDPOINTS (Edge Functions)
    // ============================================

    deals: {
      /**
       * List deals with pagination
       */
      async list(params?: {
        limit?: number;
        cursor_score?: number;
        cursor_date?: string;
        cursor_id?: string;
      }): Promise<HttpResponse<DealsListResponse>> {
        return functionsClient.get('/deals-list', params);
      },

      /**
       * Get deal details by ID
       */
      async getDetails(dealId: string): Promise<HttpResponse<DealDetail>> {
        return functionsClient.get('/deal-detail', { deal_id: dealId });
      },

      /**
       * Get deeplink redirect URL for a deal
       */
      async getDeeplink(deeplinkId: string, position?: string): Promise<HttpResponse<{ url: string }>> {
        return functionsClient.get('/go-deeplink', {
          deeplink_id: deeplinkId,
          pos: position,
        });
      },
    },

    // ============================================
    // USER SETTINGS ENDPOINTS
    // ============================================

    settings: {
      /**
       * Get user settings
       */
      async get(userId: string): Promise<HttpResponse<UserSettings[]>> {
        return restClient.get('/user_settings', {
          user_id: `eq.${userId}`,
          select: '*',
        });
      },

      /**
       * Update user settings
       */
      async update(userId: string, settings: Partial<UserSettings>): Promise<HttpResponse<UserSettings>> {
        return restClient.patch(`/user_settings?user_id=eq.${userId}`, settings);
      },
    },

    // ============================================
    // TRACKING ENDPOINTS
    // ============================================

    tracking: {
      /**
       * Track deal impression
       */
      async trackImpression(dealId: string): Promise<HttpResponse<{ success: boolean }>> {
        return functionsClient.post('/aff-impression', { deal_id: dealId });
      },

      /**
       * Track deal click
       */
      async trackClick(dealId: string, userId?: string): Promise<HttpResponse<{ success: boolean }>> {
        return restClient.post('/affiliate_clicks', {
          deal_id: dealId,
          user_id: userId,
          clicked_at: new Date().toISOString(),
        });
      },
    },

    // ============================================
    // UTILITIES
    // ============================================

    utils: {
      /**
       * Compute total saved across all used vouchers
       */
      async computeTotalSaved(userId: string, preferredCurrency: string) {
        return restClient.post('/rpc/compute_total_saved', {
          p_user_id: userId,
          p_preferred_currency: preferredCurrency,
        });
      },

      /**
       * Get merchant logo from cache
       */
      async getMerchantLogo(merchantSlug: string): Promise<HttpResponse<{ public_url: string }[]>> {
        return restClient.get('/merchant_logo_cache', {
          merchant_slug: `eq.${merchantSlug}`,
          select: 'public_url',
        });
      },
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
