/**
 * Auth Module for Mobile
 * Token storage interface and auth header helpers
 */

export interface TokenStore {
  /** Get the access token */
  getAccessToken(): Promise<string | null>;
  
  /** Get the refresh token */
  getRefreshToken(): Promise<string | null>;
  
  /** Set tokens (from login/signup response) */
  setTokens(accessToken: string, refreshToken: string): Promise<void>;
  
  /** Clear all tokens (logout) */
  clearTokens(): Promise<void>;
  
  /** Get the full session object if available */
  getSession(): Promise<{ access_token: string; refresh_token: string } | null>;
}

/**
 * Creates auth headers for API requests
 * @param store - Token store instance
 * @returns Headers object with Authorization bearer token
 */
export async function authHeader(
  store: TokenStore
): Promise<Record<string, string>> {
  const token = await store.getAccessToken();
  
  if (!token) {
    return {};
  }
  
  return {
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Creates API key headers for Supabase REST API
 * @param apiKey - Supabase anon/public key
 * @param store - Optional token store for authenticated requests
 * @returns Headers object with apikey and optional Authorization
 */
export async function supabaseHeaders(
  apiKey: string,
  store?: TokenStore
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    apikey: apiKey,
    'x-client-info': 'mobile-app/1.0.0',
  };
  
  if (store) {
    const token = await store.getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return headers;
}

/**
 * Example implementation using AsyncStorage (React Native)
 * You'll need to adapt this based on your storage solution
 */
export class AsyncStorageTokenStore implements TokenStore {
  private readonly ACCESS_TOKEN_KEY = '@auth/access_token';
  private readonly REFRESH_TOKEN_KEY = '@auth/refresh_token';
  
  constructor(private storage: any) {} // Pass AsyncStorage or similar
  
  async getAccessToken(): Promise<string | null> {
    return await this.storage.getItem(this.ACCESS_TOKEN_KEY);
  }
  
  async getRefreshToken(): Promise<string | null> {
    return await this.storage.getItem(this.REFRESH_TOKEN_KEY);
  }
  
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      this.storage.setItem(this.ACCESS_TOKEN_KEY, accessToken),
      this.storage.setItem(this.REFRESH_TOKEN_KEY, refreshToken),
    ]);
  }
  
  async clearTokens(): Promise<void> {
    await Promise.all([
      this.storage.removeItem(this.ACCESS_TOKEN_KEY),
      this.storage.removeItem(this.REFRESH_TOKEN_KEY),
    ]);
  }
  
  async getSession(): Promise<{ access_token: string; refresh_token: string } | null> {
    const [accessToken, refreshToken] = await Promise.all([
      this.getAccessToken(),
      this.getRefreshToken(),
    ]);
    
    if (!accessToken || !refreshToken) {
      return null;
    }
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
