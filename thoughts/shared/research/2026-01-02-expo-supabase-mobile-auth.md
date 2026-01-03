---
date: 2026-01-02T16:50:32Z
researcher: AI Assistant
git_commit: ead1d3f51d20c70d9cf36a5c77f621d4de339249
branch: main
repository: daily-food
topic: "Expo Mobile Authentication with Supabase - Universal Links, Magic Link, and Social Login Implementation"
tags:
  [
    research,
    codebase,
    authentication,
    expo,
    supabase,
    mobile,
    universal-links,
    apple,
    google,
  ]
status: complete
last_updated: 2026-01-02
last_updated_by: AI Assistant
last_updated_note: "Converted AUTH_PLAN.md to research document with detailed implementation plan for mobile auth with Universal Links, Magic Link, Apple Sign-In, and Google Sign-In"
---

## Research Question

Create a comprehensive implementation plan for Magic Link and Social Login (Apple/Google) authentication for an Expo mobile app using Supabase Auth, with Universal Links for deep linking and NextJS as the auth callback handler.

## Summary

This research document provides a detailed implementation plan for adding mobile authentication to the Expo app using Supabase. The architecture leverages Universal Links (iOS) to handle auth callbacks from magic links, directing tokens back to the app via a Next.js route handler. Social authentication uses native Apple and Google sign-in through ID token exchange with Supabase.

Key architectural decisions:

- **AASA File as Route Handler**: Serve the Apple App Site Association file from a Next.js route (`apps/nextjs/src/app/.well-known/apple-app-site-association/route.ts`) instead of the public directory to ensure correct headers
- **Universal Links Flow**: Magic links from Supabase redirect through Next.js, which then redirects to a Universal Link with tokens in the URL fragment
- **Native Social Auth**: Apple Sign-In uses `expo-apple-authentication`, Google Sign-In uses `@react-native-google-signin/google-signin`, both exchange ID tokens with Supabase via `signInWithIdToken()`

## Detailed Findings

### Architecture Overview

#### Magic Link Authentication Flow

```
┌────────┐     ┌──────────┐     ┌─────────────┐     ┌────────────────────┐
│ User   │────>│ Expo App │────>│ Supabase    │────>│ Email with link    │
│ enters │     │ signIn   │     │ sends email │     │ to NextJS          │
│ email  │     │ WithOtp  │     │             │     │ /api/auth/confirm  │
└────────┘     └──────────┘     └─────────────┘     └────────────────────┘
                                                              │
                                                              ▼
                                             ┌────────────────────────────┐
                                             │ NextJS /api/auth/confirm   │
                                             │ 1. Verifies token_hash     │
                                             │ 2. Exchanges for session   │
                                             │ 3. Redirects to Universal  │
                                             │    Link with tokens        │
                                             └────────────────────────────┘
                                                              │
                                                              ▼
                                             ┌────────────────────────────┐
                                             │ Universal Link opens App   │
                                             │ 1. App receives URL        │
                                             │ 2. Extracts tokens         │
                                             │ 3. Calls setSession()      │
                                             │ 4. Stores in SecureStore   │
                                             └────────────────────────────┘
```

#### Social Login Flow (Apple - Native)

```
┌────────┐     ┌──────────────┐     ┌─────────────────────┐
│ User   │────>│ expo-apple-  │────>│ Apple returns       │
│ taps   │     │ authentication│    │ identityToken (JWT) │
│ button │     │ native prompt│     │                     │
└────────┘     └──────────────┘     └─────────────────────┘
                                              │
                                              ▼
                               ┌────────────────────────────┐
                               │ supabase.auth.signInWith   │
                               │ IdToken({ provider:        │
                               │ 'apple', token })          │
                               │ 1. Supabase validates      │
                               │ 2. Creates/links user      │
                               │ 3. Returns session         │
                               │ 4. Stores in SecureStore   │
                               └────────────────────────────┘
```

### Phase 1: Universal Links Configuration

#### Step 1.1: Apple App Site Association (AASA) File

The AASA file tells iOS that your domain is associated with your app, enabling Universal Links. **Critical decision**: Serve this from a Next.js route handler instead of the public directory.

**Location**: `apps/nextjs/src/app/.well-known/apple-app-site-association/route.ts`

**Rationale for Route Handler Approach**:

- Ensures correct `Content-Type: application/json` header
- Allows control over caching headers to prevent stale configurations
- Eliminates need for `next.config.mjs` headers configuration
- Easier to manage environment variables (APPLE_TEAM_ID)

**Required Headers**:

```typescript
{
  "Content-Type": "application/json",
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0"
}
```

**AASA Content**:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appIDs": ["<TEAM_ID>.com.goszczu.daily-food"],
        "paths": ["/auth/*", "/api/auth/*"],
        "components": [
          { "/": "/auth/*", "comment": "Matches auth callback paths" },
          { "/": "/api/auth/*", "comment": "Matches API auth paths" }
        ]
      }
    ]
  }
}
```

**Environment Variable Required**:

- `APPLE_TEAM_ID` - 10-character alphanumeric from Apple Developer account

#### Step 1.2: Mobile Auth Callback Route

**Location**: `apps/nextjs/src/app/(main)/(auth)/auth/mobile-callback/route.ts`

**Flow**:

1. Receive `token_hash` and `type` from Supabase email link
2. Verify OTP and exchange for session
3. Redirect to Universal Link URL with tokens in fragment:
   ```
   https://your-domain.com/auth/callback#access_token=...&refresh_token=...
   ```

**Implementation**:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";

  if (!tokenHash || !type) {
    return NextResponse.redirect(new URL("/auth/auth-code-error", request.url));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as "email" | "magiclink" | "recovery",
  });

  if (error || !data.session) {
    return NextResponse.redirect(new URL("/auth/auth-code-error", request.url));
  }

  const isMobileRedirect = next.includes("/auth/callback");

  if (isMobileRedirect) {
    const callbackUrl = new URL(next);
    callbackUrl.hash = `access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}&expires_in=${data.session.expires_in}`;
    return NextResponse.redirect(callbackUrl);
  }

  return NextResponse.redirect(new URL(next, request.url));
}
```

#### Step 1.3: Universal Link Fallback Page

**Location**: `apps/nextjs/src/app/(main)/(auth)/auth/callback/page.tsx`

Handles cases where Universal Link doesn't open the app (user doesn't have app installed):

```tsx
export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="mb-4 text-2xl font-bold">Authentication Successful</h1>
      <p className="mb-4 text-center">
        If the app didn't open automatically, please open it manually.
      </p>
      <a
        href="expoapp://auth"
        className="bg-primary rounded-lg px-6 py-3 text-white"
      >
        Open App
      </a>
    </div>
  );
}
```

### Phase 2: Expo App Deep Link Handling

#### Step 2.1: Supabase Client for Native

**Location**: `apps/expo/src/lib/supabase.ts`

```typescript
import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";

import { config } from "../config/env";

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(
  config.supabaseUrl,
  config.supabaseAnonKey,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Important: We handle URLs manually
    },
  },
);
```

#### Step 2.2: Deep Link Handler Hook

**Location**: `apps/expo/src/hooks/useDeepLinkAuth.ts`

```typescript
import { useEffect } from "react";
import * as Linking from "expo-linking";

import { supabase } from "../lib/supabase";

export function useDeepLinkAuth() {
  useEffect(() => {
    const handleUrl = async (url: string) => {
      const urlObj = new URL(url);
      const fragment = urlObj.hash.substring(1);
      const params = new URLSearchParams(fragment);

      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      }
    };

    Linking.getInitialURL().then((url) => url && handleUrl(url));

    const subscription = Linking.addEventListener("url", ({ url }) =>
      handleUrl(url),
    );

    return () => subscription.remove();
  }, []);
}
```

### Phase 3: Apple Sign In Implementation

**Dependencies**:

- `expo-apple-authentication`: Native Apple Sign-In button and API
- No additional web flow needed - uses native ID token exchange

**Location**: `apps/expo/src/components/auth/AppleSignInButton.tsx`

```typescript
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { supabase } from '../../lib/supabase';

export function AppleSignInButton({ onSuccess, onError }) {
  if (Platform.OS !== 'ios') return null;

  const handlePress = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('No identity token received from Apple');
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      if (error) throw error;
      onSuccess?.(data);
    } catch (error) {
      if (error.code !== 'ERR_REQUEST_CANCELED') {
        onError?.(error);
      }
    }
  };

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={5}
      style={{ width: '100%', height: 48 }}
      onPress={handlePress}
    />
  );
}
```

### Phase 4: Google Sign In Implementation

**Dependencies**:

- `@react-native-google-signin/google-signin`: Native Google Sign-In
- Requires both Web and iOS OAuth clients

**Location**: `apps/expo/src/components/auth/GoogleSignInButton.tsx`

```typescript
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { config } from '../../config/env';

export function GoogleSignInButton({ onSuccess, onError }) {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: config.googleWebClientId,
      iosClientId: config.googleIosClientId,
      offlineAccess: true,
    });
  }, []);

  const handlePress = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (!userInfo.data?.idToken) {
        throw new Error('No ID token received from Google');
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: userInfo.data.idToken,
      });

      if (error) throw error;
      onSuccess?.(data);
    } catch (error) {
      if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
        onError?.(error);
      }
    }
  };

  return (
    <GoogleSigninButton
      size={GoogleSigninButton.Size.Wide}
      color={GoogleSigninButton.Color.Dark}
      onPress={handlePress}
    />
  );
}
```

### Phase 5: Magic Link Implementation

**Location**: `apps/expo/src/lib/auth.ts`

```typescript
import { supabase } from "./supabase";

const PRODUCTION_URL = "https://your-domain.com";

export async function signInWithMagicLink(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${PRODUCTION_URL}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
}
```

### Phase 6: Dependencies Summary

**Location**: `apps/expo/package.json`

```json
{
  "dependencies": {
    "@react-native-google-signin/google-signin": "^13.0.0",
    "expo-apple-authentication": "~6.4.2"
  }
}
```

**Note**: `expo-web-browser` is already installed and can be used for OAuth fallback flows.

## Code References

### New Files to Create

| File                                                                  | Purpose                               |
| --------------------------------------------------------------------- | ------------------------------------- |
| `apps/nextjs/src/app/.well-known/apple-app-site-association/route.ts` | AASA file served with correct headers |
| `apps/nextjs/src/app/(main)/(auth)/auth/mobile-callback/route.ts`     | Mobile auth callback handler          |
| `apps/nextjs/src/app/(main)/(auth)/auth/callback/page.tsx`            | Universal Link fallback page          |
| `apps/expo/src/lib/supabase.ts`                                       | Supabase client for React Native      |
| `apps/expo/src/lib/auth.ts`                                           | Auth helper functions                 |
| `apps/expo/src/hooks/useDeepLinkAuth.ts`                              | Deep link handler                     |
| `apps/expo/src/components/auth/AppleSignInButton.tsx`                 | Apple Sign In component               |
| `apps/expo/src/components/auth/GoogleSignInButton.tsx`                | Google Sign In component              |

### Files to Modify

| File                                    | Changes                                          |
| --------------------------------------- | ------------------------------------------------ |
| `apps/nextjs/next.config.mjs`           | Remove - not needed with route handler           |
| `apps/expo/app.json`                    | Add associated domains, plugins, usesAppleSignIn |
| `apps/expo/package.json`                | Add new dependencies                             |
| `apps/expo/src/config/env.ts`           | Add Google Client IDs                            |
| `apps/expo/src/app/_layout.tsx`         | Add deep link handler                            |
| `apps/expo/src/app/login.tsx`           | Update with new auth buttons                     |
| `packages/auth-native/src/provider.tsx` | Add Supabase listener                            |
| `supabase/config.toml`                  | Add redirect URLs                                |
| `supabase/templates/magic_link.html`    | Update template                                  |

## Architecture Insights

### Route Handler vs Public Directory for AASA

The original AUTH_PLAN.md suggested placing the AASA file in `apps/nextjs/public/.well-known/apple-app-site-association`. This approach requires additional `next.config.mjs` configuration to set correct headers:

```javascript
// next.config.mjs approach
async headers() {
  return [
    {
      source: '/.well-known/apple-app-site-association',
      headers: [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'Cache-Control', value: 'no-store' },
      ],
    },
  ];
}
```

**Route Handler Advantages**:

- Self-contained configuration without modifying next.config.mjs
- Direct access to environment variables (APPLE_TEAM_ID)
- Clearer separation of concerns
- TypeScript support for content generation

### Token Security in URL Fragments

The implementation uses URL fragments (`#access_token=...`) instead of query parameters:

- Fragments are not sent to the server in HTTP requests
- Tokens won't appear in server logs or referrer headers
- iOS extracts tokens from the fragment before passing to the app

## Configuration Summary

### Environment Variables

| Variable                           | Location           | Purpose                    |
| ---------------------------------- | ------------------ | -------------------------- |
| `APPLE_TEAM_ID`                    | `apps/nextjs/.env` | iOS Universal Links        |
| `EXPO_PUBLIC_SUPABASE_URL`         | `.env`             | Supabase project URL       |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY`    | `.env`             | Supabase anonymous key     |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | `.env`             | Google OAuth Web Client ID |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | `.env`             | Google OAuth iOS Client ID |

### Supabase Dashboard Configuration

| Setting               | Value                                                    |
| --------------------- | -------------------------------------------------------- |
| **Site URL**          | `https://your-domain.com`                                |
| **Redirect URLs**     | See implementation steps                                 |
| **Apple Client IDs**  | `com.goszczu.daily-food`, `host.exp.Exponent` (dev only) |
| **Google Client IDs** | Web + iOS Client IDs                                     |

### Supabase Local Config (`supabase/config.toml`)

```toml
[auth]
site_url = "http://localhost:3000"
additional_redirect_urls = [
  "http://localhost:3000/api/auth/callback",
  "http://localhost:3000/auth/callback",
  "http://localhost:3000/auth/mobile-callback",
  "expoapp://auth"
]
```

### Apple Developer Configuration

| Setting                | Value                      |
| ---------------------- | -------------------------- |
| **App ID**             | `com.goszczu.daily-food`   |
| **Sign in with Apple** | Enabled                    |
| **Associated Domains** | `applinks:your-domain.com` |
| **Team ID**            | From `APPLE_TEAM_ID` env   |

## Historical Context (from thoughts/)

- [`thoughts/shared/research/2025-12-29-expo-auth-integration.md`](thoughts/shared/research/2025-12-29-expo-auth-integration.md) - Baseline research establishing the need for mobile auth, identifying reusable components from the NextJS auth system, and outlining initial requirements for LocalAuth, social auth, offline support, and session management

This document builds on the baseline research by providing detailed implementation steps with specific file paths and code examples for the authentication flow.

## Related Research

- [`thoughts/shared/research/2025-12-29-expo-auth-integration.md`](thoughts/shared/research/2025-12-29-expo-auth-integration.md) - Initial research on adding Supabase authentication to Expo app

## Open Questions

1. **Production Domain**: What is the production domain? (e.g., `daily-food.vercel.app` or custom domain)
2. **Apple Team ID**: What is the Apple Developer Team ID? (10-character alphanumeric)
3. **Google Cloud Project**: Is there an existing Google Cloud project, or should the plan include creating one?
4. **Expo Go Testing**: Should `host.exp.Exponent` be kept as a client ID for Expo Go testing during development?
5. **Email Templates**: Should email templates be updated locally (`supabase/templates/`) or in the Supabase Dashboard?

## Testing Checklist

### Development Testing

- [ ] AASA file served at `http://localhost:3000/.well-known/apple-app-site-association` with correct headers
- [ ] Magic Link sends email with correct callback URL
- [ ] Clicking magic link on device opens app
- [ ] Session is stored after magic link auth
- [ ] Apple Sign In shows native prompt (iOS only)
- [ ] Apple Sign In creates session successfully
- [ ] Google Sign In shows native prompt
- [ ] Google Sign In creates session successfully
- [ ] tRPC calls include Bearer token
- [ ] Protected routes redirect unauthenticated users
- [ ] Logout clears session and redirects to login

### Production Testing

- [ ] AASA file accessible at `https://domain.com/.well-known/apple-app-site-association`
- [ ] Universal Links open app from Safari
- [ ] Universal Links open app from Mail
- [ ] All OAuth providers configured in Supabase
- [ ] Redirect URLs match production domain
