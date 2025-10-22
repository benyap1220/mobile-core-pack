# PromoParser Mobile - Core Pack

This Core Pack contains UI-free TypeScript code that can be pasted directly into your React Native/Expo app.

## 📁 Structure

```
mobile-core-pack/
├── core/
│   ├── http.ts          # HTTP client wrapper around fetch
│   ├── api.ts           # All API endpoint functions
│   └── auth.ts          # Token storage interface & auth helpers
├── validation/
│   ├── schemas.ts       # Zod validation schemas
│   └── types.ts         # TypeScript types/interfaces
├── design/
│   └── design-tokens.json  # Design system tokens
└── README_MOBILE.md     # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install zod @supabase/supabase-js
# or
yarn add zod @supabase/supabase-js
```

### 2. Set Up Environment Variables

Create a `.env` file in your React Native project:

```env
API_BASE_URL=https://cnayuxiwjgpjrzkphhwz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuYXl1eGl3amdwanJ6a3BoaHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NzM4MDYsImV4cCI6MjA3NTI0OTgwNn0.ZA_6hIEYMQCDRGvyvmc3x-xTFg_MOhgKiZvmZ9TBWJI
```

### 3. Initialize API Client

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createApiClient } from './mobile-core-pack/core/api';
import { AsyncStorageTokenStore } from './mobile-core-pack/core/auth';

// Create token store
const tokenStore = new AsyncStorageTokenStore(AsyncStorage);

// Create API client
export const api = createApiClient({
  supabaseUrl: process.env.API_BASE_URL!,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY!,
  tokenStore,
});
```

### 4. Use in Your App

```typescript
// Sign in
const { data } = await api.auth.signIn('user@example.com', 'password');
await tokenStore.setTokens(data.access_token, data.refresh_token);

// List vouchers
const { data: vouchers } = await api.vouchers.list({ status: 'active' });

// Get deals
const { data: deals } = await api.deals.list({ limit: 20 });
```

## 📡 API Endpoints

### Authentication

| Endpoint | Method | Description | Required Headers |
|----------|--------|-------------|------------------|
| `/auth/v1/signup` | POST | Sign up new user | `apikey` |
| `/auth/v1/token?grant_type=password` | POST | Sign in | `apikey` |
| `/auth/v1/logout` | POST | Sign out | `apikey`, `Authorization` |
| `/auth/v1/user` | GET | Get current user | `apikey`, `Authorization` |
| `/auth/v1/token?grant_type=refresh_token` | POST | Refresh session | `apikey` |

**Sign Up Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "options": {
    "emailRedirectTo": "https://yourapp.com"
  }
}
```

**Sign In Response:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "ak442ezj...",
  "expires_in": 3600,
  "token_type": "bearer",
  "user": {
    "id": "46ffd133-3634-4a8c-972a-a9c58e4a1110",
    "email": "user@example.com",
    "email_confirmed_at": "2025-10-06T15:28:07.708212Z",
    "created_at": "2025-10-06T15:28:07.675902Z"
  }
}
```

### Vouchers

| Endpoint | Method | Description | Required Headers |
|----------|--------|-------------|------------------|
| `/rest/v1/vouchers` | GET | List vouchers | `apikey`, `Authorization` |
| `/rest/v1/vouchers` | POST | Create voucher | `apikey`, `Authorization` |
| `/rest/v1/vouchers?voucher_id=eq.{id}` | PATCH | Update voucher | `apikey`, `Authorization` |
| `/rest/v1/vouchers?voucher_id=eq.{id}` | DELETE | Delete voucher | `apikey`, `Authorization` |

**List Vouchers Query Params:**
- `status`: `eq.active`, `eq.used`, `eq.expired`
- `order`: `expiry_date.asc`, `created_at.desc`
- `select`: Fields to return (see sample response)

**Sample Voucher Response:**
```json
{
  "voucher_id": "2fcfebf7-f5cc-40f2-b25a-1c1885f2a42a",
  "merchant": "Lazada",
  "merchant_logo_path": null,
  "deal_type": "other",
  "value": null,
  "currency": "MYR",
  "expiry_date": "2025-10-20",
  "conditions": "Max cashback RM50. Valid on selected electronics.",
  "tags": [],
  "status": "active",
  "category": "other",
  "display_title": "Up to 20% Cashback",
  "affiliate_offers": {
    "deep_link": "https://lazada.com.my"
  }
}
```

**Create Voucher Request:**
```json
{
  "merchant": "Starbucks",
  "currency": "MYR",
  "deal_type": "amount",
  "value": 50,
  "expiry_date": "2025-12-31",
  "category": "food",
  "tags": ["coffee", "gift-card"]
}
```

### Deals (Edge Functions)

| Endpoint | Method | Description | Required Headers |
|----------|--------|-------------|------------------|
| `/functions/v1/deals-list` | GET | List deals (paginated) | `apikey`, `Authorization` |
| `/functions/v1/deal-detail` | GET | Get deal details | `apikey`, `Authorization` |
| `/functions/v1/go-deeplink` | GET | Get deeplink redirect | `apikey`, `Authorization` |

**List Deals Query Params:**
- `limit`: Number of items (default: 24)
- `cursor_score`: Pagination cursor score
- `cursor_date`: Pagination cursor date
- `cursor_id`: Pagination cursor ID

**Sample Deals Response:**
```json
{
  "items": [
    {
      "id": "61d4590b-9373-4390-8157-a60f49ef6b76",
      "offer_id": 4711,
      "deeplink_id": "d0ecf7ed-8950-4748-83d9-0d2b9484cd38",
      "title": "15% OFF at Rip Curl (MY)",
      "summary": "15% off site wide No minimum spend",
      "code": "RCIAAFF15",
      "tags": ["Sitewide", "MY"],
      "image_url": "https://img.involve.asia/...",
      "expires_at": "2025-12-31T00:00:00+00:00",
      "platform": "Rip Curl (MY)",
      "platform_logo": "https://cnayuxiwjgpjrzkphhwz.supabase.co/storage/...",
      "country": "MY",
      "has_coupon": true
    }
  ],
  "next_cursor": {
    "score": 40,
    "created_at": "2025-10-16T14:42:49.988968+00:00",
    "id": "45cb0ab8-2705-408d-aa00-4b52142e551e"
  }
}
```

**Deal Details Response:**
```json
{
  "id": "61d4590b-9373-4390-8157-a60f49ef6b76",
  "title": "15% OFF at Rip Curl (MY)",
  "code": "RCIAAFF15",
  "promo": {
    "promo_id": "abc123",
    "title": "Special Promo",
    "notes": "Limited time offer",
    "landing_url": "https://example.com/promo"
  },
  "advertiser": {
    "advertiser_id": "adv123",
    "name": "Rip Curl",
    "logo_url": "https://..."
  },
  "deeplink_url": "https://redirect.involve.asia/..."
}
```

### User Settings

| Endpoint | Method | Description | Required Headers |
|----------|--------|-------------|------------------|
| `/rest/v1/user_settings?user_id=eq.{id}` | GET | Get user settings | `apikey`, `Authorization` |
| `/rest/v1/user_settings?user_id=eq.{id}` | PATCH | Update settings | `apikey`, `Authorization` |

**Sample User Settings:**
```json
{
  "user_id": "46ffd133-3634-4a8c-972a-a9c58e4a1110",
  "push_enabled": true,
  "email_enabled": true,
  "currency": "MYR",
  "locale": "ms-MY",
  "logo_lookup_enabled": true
}
```

### Tracking

| Endpoint | Method | Description | Required Headers |
|----------|--------|-------------|------------------|
| `/functions/v1/aff-impression` | POST | Track deal impression | `apikey`, `Authorization` |
| `/rest/v1/affiliate_clicks` | POST | Track deal click | `apikey`, `Authorization` |

**Track Impression Request:**
```json
{
  "deal_id": "61d4590b-9373-4390-8157-a60f49ef6b76"
}
```

### Utilities

| Endpoint | Method | Description | Required Headers |
|----------|--------|-------------|------------------|
| `/rest/v1/rpc/compute_total_saved` | POST | Calculate total savings | `apikey`, `Authorization` |
| `/rest/v1/merchant_logo_cache?merchant_slug=eq.{slug}` | GET | Get cached logo | `apikey`, `Authorization` |

**Compute Total Saved Request:**
```json
{
  "p_user_id": "46ffd133-3634-4a8c-972a-a9c58e4a1110",
  "p_preferred_currency": "MYR"
}
```

**Response:**
```json
[
  {
    "total": 180,
    "has_mixed_currencies": true
  }
]
```

## 🔐 Authentication Flow

### 1. Sign Up / Sign In

```typescript
// Sign up
const { data: signUpData } = await api.auth.signUp(
  'user@example.com',
  'password123',
  'https://yourapp.com/redirect'
);

// Sign in
const { data: signInData } = await api.auth.signIn(
  'user@example.com',
  'password123'
);

// Store tokens
await tokenStore.setTokens(
  signInData.access_token,
  signInData.refresh_token
);
```

### 2. Make Authenticated Requests

The `createApiClient` automatically adds the `Authorization: Bearer {token}` header to all requests using the `tokenStore`.

```typescript
// All these calls are automatically authenticated
const { data: vouchers } = await api.vouchers.list();
const { data: deals } = await api.deals.list();
const { data: settings } = await api.settings.get(userId);
```

### 3. Token Refresh

Supabase tokens expire after 1 hour (3600 seconds). Implement auto-refresh:

```typescript
async function refreshTokenIfNeeded() {
  const session = await tokenStore.getSession();
  if (!session) return;

  // Check if token will expire in next 5 minutes
  const expiresAt = session.expires_at * 1000; // Convert to ms
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  if (expiresAt - now < fiveMinutes) {
    const { data } = await api.auth.refreshSession(session.refresh_token);
    await tokenStore.setTokens(data.access_token, data.refresh_token);
  }
}

// Call this before important requests or set up an interval
setInterval(refreshTokenIfNeeded, 60000); // Check every minute
```

### 4. Sign Out

```typescript
await api.auth.signOut();
await tokenStore.clearTokens();
```

## 🎨 Design Tokens

The `design-tokens.json` file contains all design system values extracted from your Tailwind config:

```typescript
import designTokens from './mobile-core-pack/design/design-tokens.json';

// Use in React Native StyleSheet
const styles = StyleSheet.create({
  container: {
    backgroundColor: designTokens.colors.background.DEFAULT,
    padding: parseInt(designTokens.spacing['4']),
    borderRadius: parseInt(designTokens.borderRadius['2xl']),
  },
  title: {
    fontSize: parseInt(designTokens.typography.fontSize['2xl']),
    fontWeight: designTokens.typography.fontWeight.bold,
  },
});
```

**Note:** You'll need to convert HSL colors to RGB for React Native. Use a library like `color` or `tinycolor2`:

```typescript
import { hslToRgb } from 'color-convert';

// Convert HSL to RGB for React Native
const hslString = 'hsl(210, 100%, 50%)'; // Parse from token
const rgb = hslToRgb(/* h */ 210, /* s */ 100, /* l */ 50);
const color = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
```

## 🔍 Validation

Use Zod schemas for runtime validation:

```typescript
import { voucherUpdateSchema } from './mobile-core-pack/validation/schemas';

const voucherData = {
  merchant: 'Starbucks',
  currency: 'MYR',
  tags: ['coffee'],
};

try {
  const validated = voucherUpdateSchema.parse(voucherData);
  const { data } = await api.vouchers.create(validated);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Validation errors:', error.errors);
  }
}
```

## 📦 Required Headers

All Supabase requests require these headers:

```typescript
{
  'apikey': process.env.SUPABASE_ANON_KEY,
  'Authorization': 'Bearer {access_token}',  // For authenticated requests
  'Content-Type': 'application/json',
  'x-client-info': 'mobile-app/1.0.0'
}
```

The `createApiClient` handles this automatically via the `getHeaders` function.

## 🌍 Environment Variables Needed

```env
# Supabase Configuration
API_BASE_URL=https://cnayuxiwjgpjrzkphhwz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Analytics/Tracking
ANALYTICS_ENABLED=true

# Optional: Feature Flags
ENABLE_DEALS=true
ENABLE_AFFILIATE_TRACKING=true
```

## 🚨 Error Handling

All API calls throw `HttpError` on failure:

```typescript
import { HttpError } from './mobile-core-pack/core/http';

try {
  const { data } = await api.vouchers.list();
} catch (error) {
  if (error instanceof HttpError) {
    console.error('HTTP Error:', error.status, error.message);
    console.error('Response:', error.response);
    
    // Handle specific errors
    if (error.status === 401) {
      // Unauthorized - refresh token or redirect to login
    } else if (error.status === 404) {
      // Not found
    }
  }
}
```

## 📱 React Native Example

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createApiClient } from './mobile-core-pack/core/api';
import { AsyncStorageTokenStore } from './mobile-core-pack/core/auth';
import type { Voucher } from './mobile-core-pack/validation/types';

const tokenStore = new AsyncStorageTokenStore(AsyncStorage);
const api = createApiClient({
  supabaseUrl: process.env.API_BASE_URL!,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY!,
  tokenStore,
});

export default function VoucherScreen() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVouchers();
  }, []);

  async function loadVouchers() {
    try {
      const { data } = await api.vouchers.list({ status: 'active' });
      setVouchers(data);
    } catch (error) {
      console.error('Failed to load vouchers:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        My Vouchers
      </Text>
      <FlatList
        data={vouchers}
        keyExtractor={(item) => item.voucher_id}
        renderItem={({ item }) => (
          <View style={{ padding: 16, borderRadius: 8, marginBottom: 12, backgroundColor: '#f5f5f5' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.merchant}</Text>
            <Text>{item.display_title}</Text>
            <Text>Expires: {item.expiry_date}</Text>
          </View>
        )}
      />
    </View>
  );
}
```

## 🔗 Additional Resources

- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript)
- [Zod Validation](https://zod.dev/)
- [React Native AsyncStorage](https://react-native-async-storage.github.io/async-storage/)

## 📄 License

This Core Pack is part of the PromoParser project. All rights reserved.
