/**
 * HTTP Client for Mobile
 * Pure TypeScript HTTP wrapper with no React/Next dependencies
 */

export interface HttpConfig {
  baseUrl: string;
  getHeaders?: () => Promise<Record<string, string>> | Record<string, string>;
  timeout?: number;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  headers: Headers;
}

export class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/**
 * Creates an HTTP client instance
 * @param config - Configuration including baseUrl and optional headers function
 * @returns HTTP client with get, post, patch, delete methods
 */
export function makeHttp(config: HttpConfig) {
  const { baseUrl, getHeaders, timeout = 30000 } = config;

  async function request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<HttpResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
    
    // Get headers from function if provided
    const customHeaders = getHeaders ? await getHeaders() : {};
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...customHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response body
      let data: any;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Throw on non-2xx status
      if (!response.ok) {
        throw new HttpError(
          data?.message || data?.error || `HTTP ${response.status}`,
          response.status,
          data
        );
      }

      return {
        data,
        status: response.status,
        headers: response.headers,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof HttpError) {
        throw error;
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new HttpError('Request timeout', 408);
      }
      
      throw new HttpError(
        error instanceof Error ? error.message : 'Network error',
        0
      );
    }
  }

  return {
    async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<HttpResponse<T>> {
      const queryString = params
        ? '?' + new URLSearchParams(params).toString()
        : '';
      return request<T>(endpoint + queryString, { method: 'GET' });
    },

    async post<T = any>(endpoint: string, body?: any): Promise<HttpResponse<T>> {
      return request<T>(endpoint, {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      });
    },

    async patch<T = any>(endpoint: string, body?: any): Promise<HttpResponse<T>> {
      return request<T>(endpoint, {
        method: 'PATCH',
        body: body ? JSON.stringify(body) : undefined,
      });
    },

    async delete<T = any>(endpoint: string): Promise<HttpResponse<T>> {
      return request<T>(endpoint, { method: 'DELETE' });
    },

    async put<T = any>(endpoint: string, body?: any): Promise<HttpResponse<T>> {
      return request<T>(endpoint, {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      });
    },
  };
}
