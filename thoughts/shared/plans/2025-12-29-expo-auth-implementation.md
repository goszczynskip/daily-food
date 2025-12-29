# React Native Authentication Implementation Plan

## Overview

Restructure the current auth system to support both web and React Native platforms by extracting shared logic into `@tonik/auth` (core schemas and utilities) and creating platform-specific packages `@tonik/auth-web` and `@tonik/auth-native`. Implement an MVP auth screen in the Expo app with Apple Sign-In, Google Sign-In, and email magic link authentication.

## Current State Analysis

The current `@tonik/auth` package ([`packages/auth/package.json`](packages/auth/package.json)) contains a mix of shared logic and web-specific components:

### Shared Components (to stay in `@tonik/auth`):

- **Schemas**: Complete validation schemas in [`packages/auth/src/schemas.ts`](packages/auth/src/schemas.ts) for all auth methods (email/password, phone, social, OTP)
- **Utilities**: Shared functions like `getClaims()` and `isAdmin()` in [`packages/auth/src/common.ts`](packages/auth/src/common.ts)
- **Types**: Reusable TypeScript interfaces and discriminated unions

### Web-Specific Components (to move to `@tonik/auth-web`):

- **Recipes**: Login ([`packages/auth/src/recipes/login.tsx`](packages/auth/src/recipes/login.tsx)), signup, password reset components using HTML forms, Tailwind CSS, and `@tonik/ui` components
- **Middleware**: Next.js-specific middleware ([`packages/auth/src/middleware.ts`](packages/auth/src/middleware.ts)) for route protection
- **SSR Utilities**: Server-side rendering utilities ([`packages/auth/src/ssr/index.ts`](packages/auth/src/ssr/index.ts))
- **Hooks**: Platform-specific hooks that depend on DOM detection

### Missing for Native:

- React Native UI components for auth flows
- Mobile OAuth integration (Apple Sign-In, Google Sign-In)
- Deep linking for magic link and OAuth callback handling
- React Native-specific session management with secure storage

### Supabase Configuration:

- Auth configured in [`supabase/config.toml`](supabase/config.toml)
- Google, GitHub, Discord providers configured (currently disabled)
- **Missing**: Apple provider configuration
- Current redirect URLs: `http://localhost:3000/api/auth/callback`

## Desired End State

After implementation, the auth system will have:

1. **`@tonik/auth`**: Platform-agnostic schemas, utilities, and shared logic only
2. **`@tonik/auth-web`**: Web-specific React components using HTML forms and Next.js integration
3. **`@tonik/auth-native`**: React Native components using RN primitives and mobile OAuth
4. **Expo App Integration**: Simple auth screen with social login and email magic link
5. **Deep Linking Support**: OAuth callbacks and magic link handling in the mobile app

### Key Discoveries:

- Login components use compound pattern with React Context ([`packages/auth/src/recipes/login.tsx:45-54`](packages/auth/src/recipes/login.tsx))
- tRPC auth router handles all auth logic server-side ([`packages/api/src/router/auth.ts:29-233`](packages/api/src/router/auth.ts))
- Expo app already has `expo-linking` and `expo-web-browser` installed ([`apps/expo/package.json:24,30`](apps/expo/package.json))
- Current app scheme is `expoapp` ([`apps/expo/app.json:8`](apps/expo/app.json))

## What We're NOT Doing

- Biometric authentication (FaceID/TouchID) - future enhancement
- Phone/SMS authentication - not required for MVP
- Password-based authentication in mobile app - using social + magic link only
- Complex UI designs - MVP approach with basic styling
- Offline sync for auth - basic session management only
- tRPC integration in mobile app initially - direct Supabase client

## Implementation Approach

The implementation follows a clean separation of concerns:

1. **Phase 1**: Extract shared logic to `@tonik/auth`, move web components to `@tonik/auth-web`
2. **Phase 2**: Create `@tonik/auth-native` package with React Native components
3. **Phase 3**: Integrate auth into Expo app with navigation guards
4. **Phase 4**: Configure deep linking for OAuth and magic link callbacks

---

## Phase 1: Package Restructuring

### Overview

Split the existing auth package into three packages with clear separation of concerns. This phase ensures the NextJS app continues to work while preparing for native support.

### Changes Required:

#### 1. Restructure `@tonik/auth` package (shared only)

**File**: `packages/auth/package.json`
**Changes**: Remove web dependencies, keep only shared dependencies

```json
{
  "name": "@tonik/auth",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/src/index.d.ts",
      "default": "./src/index.ts"
    },
    "./schemas": {
      "types": "./dist/src/schemas.d.ts",
      "default": "./src/schemas.ts"
    }
  },
  "dependencies": {
    "zod": "catalog:"
  },
  "peerDependencies": {
    "@tonik/supabase": "workspace:*"
  },
  "devDependencies": {
    "@tonik/eslint-config": "workspace:*",
    "@tonik/prettier-config": "workspace:*",
    "@tonik/tsconfig": "workspace:*",
    "typescript": "catalog:"
  }
}
```

**File**: `packages/auth/src/index.ts`
**Changes**: Export only shared utilities and schemas

```typescript
export { getClaims, isAdmin } from "./common";
export * from "./schemas";
```

#### 2. Create `@tonik/auth-web` package

**File**: `packages/auth-web/package.json` (new)

```json
{
  "name": "@tonik/auth-web",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/src/index.d.ts",
      "default": "./src/index.ts"
    },
    "./middleware": {
      "types": "./dist/src/middleware.d.ts",
      "default": "./src/middleware.ts"
    },
    "./recipes/*": {
      "types": "./dist/src/recipes/*.d.ts",
      "default": "./src/recipes/*.tsx"
    }
  },
  "dependencies": {
    "@tonik/auth": "workspace:*",
    "@tonik/supabase": "workspace:*",
    "@tonik/tailwind-config": "workspace:*",
    "@tonik/ui": "workspace:*",
    "@icons-pack/react-simple-icons": "^13.8.0",
    "@marsidev/react-turnstile": "^1.4.0",
    "lucide-react": "catalog:",
    "zod": "catalog:"
  },
  "peerDependencies": {
    "@supabase/supabase-js": "^2.57.4",
    "next": "catalog:react",
    "react": "catalog:react",
    "react-dom": "catalog:react"
  },
  "devDependencies": {
    "@tonik/eslint-config": "workspace:*",
    "@tonik/prettier-config": "workspace:*",
    "@tonik/tsconfig": "workspace:*",
    "typescript": "catalog:"
  }
}
```

**File**: `packages/auth-web/src/index.ts` (new)

```typescript
export * from "./recipes/login";
export * from "./recipes/forgot-password";
export * from "./recipes/reset-password";
```

**File**: `packages/auth-web/src/middleware.ts` (moved from auth)

- Move the entire content of `packages/auth/src/middleware.ts`

**File**: `packages/auth-web/src/recipes/` (moved from auth)

- Move all files from `packages/auth/src/recipes/`

**File**: `packages/auth-web/src/hooks/` (moved from auth)

- Move `use-event-callback.ts` and `use-isomorphic-layout-effect.ts`

**File**: `packages/auth-web/src/ssr/` (moved from auth)

- Move `packages/auth/src/ssr/index.ts`

#### 3. Update NextJS app imports

**File**: `apps/nextjs/src/middleware.ts`
**Changes**: Update import path

```typescript
import { createAuthMiddleware } from "@tonik/auth-web/middleware";
import { env } from "@tonik/env";

export const middleware = createAuthMiddleware({
  supabase: {
    supabaseUrl: env.SUPABASE_URL,
    supabaseAnonKey: env.SUPABASE_ANON_KEY,
  },
  protectedPaths: [],
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|trpc/api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**Files**: All files in `apps/nextjs/src/app/(main)/(auth)/`
**Changes**: Update imports from `@tonik/auth/recipes/*` to `@tonik/auth-web/recipes/*`

**File**: `apps/nextjs/package.json`
**Changes**: Add `@tonik/auth-web` dependency

```json
{
  "dependencies": {
    "@tonik/auth-web": "workspace:*"
  }
}
```

### Success Criteria:

#### Automated Verification:

- [x] All TypeScript checks pass: `pnpm -C packages/auth typecheck`
- [x] All TypeScript checks pass: `pnpm -C packages/auth-web typecheck`
- [x] NextJS app builds: `pnpm -C apps/nextjs build`
- [x] No circular dependencies between packages
- [x] Linting passes: `pnpm lint`

#### Manual Verification:

- [ ] Existing NextJS login functionality works
- [ ] Existing NextJS signup functionality works
- [ ] OAuth flow (if enabled) works correctly
- [ ] Magic link authentication works

---

## Phase 2: Native Auth Package Implementation

### Overview

Create the `@tonik/auth-native` package with React Native components for authentication, including Apple Sign-In, Google Sign-In, and magic link support.

### Changes Required:

#### 1. Create `@tonik/auth-native` package

**File**: `packages/auth-native/package.json` (new)

```json
{
  "name": "@tonik/auth-native",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "src/index.ts",
  "exports": {
    ".": {
      "types": "./dist/src/index.d.ts",
      "default": "./src/index.ts"
    },
    "./provider": {
      "types": "./dist/src/provider.d.ts",
      "default": "./src/provider.tsx"
    },
    "./components": {
      "types": "./dist/src/components/index.d.ts",
      "default": "./src/components/index.ts"
    }
  },
  "dependencies": {
    "@tonik/auth": "workspace:*",
    "zod": "catalog:"
  },
  "peerDependencies": {
    "@supabase/supabase-js": "^2.57.4",
    "@invertase/react-native-apple-authentication": "^2.4.0",
    "@react-native-google-signin/google-signin": "^13.0.0",
    "expo-secure-store": "~14.0.1",
    "expo-linking": "~8.0.0",
    "expo-web-browser": "~15.0.0",
    "react": "*",
    "react-native": "*"
  },
  "devDependencies": {
    "@tonik/eslint-config": "workspace:*",
    "@tonik/prettier-config": "workspace:*",
    "@tonik/tsconfig": "workspace:*",
    "@types/react": "~19.1.0",
    "typescript": "catalog:"
  }
}
```

**File**: `packages/auth-native/tsconfig.json` (new)

```json
{
  "extends": "@tonik/tsconfig/internal-package.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**File**: `packages/auth-native/eslint.config.js` (new)

```javascript
import baseConfig from "@tonik/eslint-config/base.js";

export default [...baseConfig];
```

#### 2. Create auth types

**File**: `packages/auth-native/src/types.ts` (new)

```typescript
import type { Session, User } from "@supabase/supabase-js";

export interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  signInWithApple: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithMagicLink: (
    email: string,
  ) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
  supabaseUrl: string;
  supabaseAnonKey: string;
  onAuthStateChange?: (state: AuthState) => void;
}
```

#### 3. Create auth provider

**File**: `packages/auth-native/src/provider.tsx` (new)

```typescript
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AppState, Platform } from "react-native";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

import type { AuthContextType, AuthProviderProps, AuthState } from "./types";

// Complete any pending auth sessions
WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext<AuthContextType | null>(null);

// Secure storage adapter for Supabase
const SecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error("SecureStore setItem error:", error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error("SecureStore removeItem error:", error);
    }
  },
};

export function AuthProvider({
  children,
  supabaseUrl,
  supabaseAnonKey,
  onAuthStateChange,
}: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Create Supabase client with secure storage
  const supabase = useMemo<SupabaseClient>(() => {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: SecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }, [supabaseUrl, supabaseAnonKey]);

  // Update state helper
  const updateState = useCallback(
    (newState: Partial<AuthState>) => {
      setState((prev) => {
        const updated = { ...prev, ...newState };
        onAuthStateChange?.(updated);
        return updated;
      });
    },
    [onAuthStateChange]
  );

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        updateState({
          session,
          user: session?.user ?? null,
          isLoading: false,
          isAuthenticated: !!session,
        });
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        updateState({ isLoading: false });
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        updateState({
          session,
          user: session?.user ?? null,
          isAuthenticated: !!session,
        });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, updateState]);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextAppState) => {
      if (nextAppState === "active") {
        // Refresh session when app becomes active
        await supabase.auth.getSession();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [supabase]);

  // Sign in with Apple
  const signInWithApple = useCallback(async () => {
    if (Platform.OS !== "ios") {
      throw new Error("Apple Sign-In is only available on iOS");
    }

    try {
      const { AppleAuthentication } = await import(
        "@invertase/react-native-apple-authentication"
      );

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error("No identity token returned from Apple");
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Apple Sign-In error:", error);
      throw error;
    }
  }, [supabase]);

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    try {
      const { GoogleSignin } = await import(
        "@react-native-google-signin/google-signin"
      );

      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (!userInfo.idToken) {
        throw new Error("No ID token returned from Google");
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: userInfo.idToken,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Google Sign-In error:", error);
      throw error;
    }
  }, [supabase]);

  // Sign in with magic link
  const signInWithMagicLink = useCallback(
    async (email: string) => {
      try {
        const redirectUrl = Linking.createURL("auth/callback");

        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

        if (error) throw error;

        return {
          success: true,
          message: "Check your email for a login link!",
        };
      } catch (error) {
        console.error("Magic link error:", error);
        return {
          success: false,
          message: error instanceof Error ? error.message : "Failed to send magic link",
        };
      }
    },
    [supabase]
  );

  // Sign out
  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  }, [supabase]);

  // Refresh session
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) throw error;

      updateState({
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session,
      });
    } catch (error) {
      console.error("Refresh session error:", error);
      throw error;
    }
  }, [supabase, updateState]);

  const value = useMemo<AuthContextType>(
    () => ({
      ...state,
      signInWithApple,
      signInWithGoogle,
      signInWithMagicLink,
      signOut,
      refreshSession,
    }),
    [state, signInWithApple, signInWithGoogle, signInWithMagicLink, signOut, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
```

#### 4. Create auth UI components

**File**: `packages/auth-native/src/components/login-screen.tsx` (new)

```typescript
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { otpEmailSchema } from "@tonik/auth";
import { useAuth } from "../provider";

interface LoginScreenProps {
  onSuccess?: () => void;
  showApple?: boolean;
  showGoogle?: boolean;
}

export function LoginScreen({
  onSuccess,
  showApple = Platform.OS === "ios",
  showGoogle = true,
}: LoginScreenProps) {
  const {
    signInWithApple,
    signInWithGoogle,
    signInWithMagicLink,
    isLoading,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleAppleSignIn = async () => {
    try {
      setIsSubmitting(true);
      await signInWithApple();
      onSuccess?.();
    } catch (error) {
      Alert.alert(
        "Sign In Failed",
        error instanceof Error ? error.message : "Failed to sign in with Apple"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      await signInWithGoogle();
      onSuccess?.();
    } catch (error) {
      Alert.alert(
        "Sign In Failed",
        error instanceof Error ? error.message : "Failed to sign in with Google"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMagicLink = async () => {
    const result = otpEmailSchema.safeParse({ email });
    if (!result.success) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await signInWithMagicLink(email);

      if (response.success) {
        setEmailSent(true);
      } else {
        Alert.alert("Error", response.message);
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to send magic link"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (emailSent) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successTitle}>Check your email</Text>
          <Text style={styles.successText}>
            We've sent a login link to {email}
          </Text>
          <Pressable
            style={styles.linkButton}
            onPress={() => setEmailSent(false)}
          >
            <Text style={styles.linkButtonText}>Use a different email</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        {/* Social Login Buttons */}
        <View style={styles.socialContainer}>
          {showApple && (
            <Pressable
              style={[styles.socialButton, styles.appleButton]}
              onPress={handleAppleSignIn}
              disabled={isSubmitting}
            >
              <Text style={[styles.socialButtonText, styles.appleButtonText]}>
                Continue with Apple
              </Text>
            </Pressable>
          )}

          {showGoogle && (
            <Pressable
              style={[styles.socialButton, styles.googleButton]}
              onPress={handleGoogleSignIn}
              disabled={isSubmitting}
            >
              <Text style={[styles.socialButtonText, styles.googleButtonText]}>
                Continue with Google
              </Text>
            </Pressable>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Email Magic Link */}
        <View style={styles.emailContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSubmitting}
          />

          <Pressable
            style={[styles.magicLinkButton, isSubmitting && styles.buttonDisabled]}
            onPress={handleMagicLink}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.magicLinkButtonText}>
                Email me a sign-in link
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    color: "#111827",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 32,
  },
  socialContainer: {
    gap: 12,
  },
  socialButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  appleButton: {
    backgroundColor: "#000",
  },
  googleButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  appleButtonText: {
    color: "#fff",
  },
  googleButtonText: {
    color: "#374151",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    paddingHorizontal: 16,
    color: "#9CA3AF",
    fontSize: 14,
  },
  emailContainer: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },
  magicLinkButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  magicLinkButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  linkButton: {
    paddingVertical: 8,
  },
  linkButtonText: {
    color: "#3B82F6",
    fontSize: 16,
    fontWeight: "500",
  },
});
```

**File**: `packages/auth-native/src/components/index.ts` (new)

```typescript
export { LoginScreen } from "./login-screen";
```

#### 5. Create package index

**File**: `packages/auth-native/src/index.ts` (new)

```typescript
export { AuthProvider, useAuth } from "./provider";
export { LoginScreen } from "./components/login-screen";
export type { AuthContextType, AuthProviderProps, AuthState } from "./types";
```

### Success Criteria:

#### Automated Verification:

- [x] Package builds: `pnpm -C packages/auth-native build`
- [x] TypeScript checks pass: `pnpm -C packages/auth-native typecheck`
- [x] No missing dependencies or import errors
- [x] Linting passes: `pnpm lint`

#### Manual Verification:

- [x] Package exports are correct and importable
- [x] Types are properly exported

---

## Phase 3: Expo App Integration

### Overview

Add the native auth package to the Expo app, configure Supabase, and integrate with existing navigation.

### Changes Required:

#### 1. Add dependencies to Expo app

**File**: `apps/expo/package.json`
**Changes**: Add auth and Supabase dependencies

```json
{
  "dependencies": {
    "@tonik/auth-native": "workspace:*",
    "@supabase/supabase-js": "^2.57.4",
    "@invertase/react-native-apple-authentication": "^2.4.0",
    "@react-native-google-signin/google-signin": "^13.0.0",
    "expo-secure-store": "~14.0.1"
  }
}
```

#### 2. Create environment configuration

**File**: `apps/expo/src/config/env.ts` (new)

```typescript
// Environment configuration for Expo app
// In production, these should be injected via EAS secrets or expo-constants

export const config = {
  // Local Supabase development
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321",
  supabaseAnonKey:
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",

  // OAuth configuration (needed for Google Sign-In)
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "",
  googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "",
} as const;
```

#### 3. Update app layout with auth provider

**File**: `apps/expo/app/_layout.tsx`
**Changes**: Add AuthProvider to root layout

```typescript
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@tonik/auth-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { config } from "@/src/config/env";

export const unstable_settings = {
  anchor: "(tabs)",
};

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to sign-in if not authenticated
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to home if authenticated and in auth group
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, segments, router]);

  return <>{children}</>;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthGate>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
        </Stack>
      </AuthGate>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider
      supabaseUrl={config.supabaseUrl}
      supabaseAnonKey={config.supabaseAnonKey}
    >
      <RootLayoutNav />
    </AuthProvider>
  );
}
```

#### 4. Create auth screens

**File**: `apps/expo/app/(auth)/_layout.tsx` (new)

```typescript
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
    </Stack>
  );
}
```

**File**: `apps/expo/app/(auth)/login.tsx` (new)

```typescript
import { useRouter } from "expo-router";
import { LoginScreen } from "@tonik/auth-native";

export default function Login() {
  const router = useRouter();

  return (
    <LoginScreen
      onSuccess={() => {
        router.replace("/(tabs)");
      }}
    />
  );
}
```

#### 5. Add logout functionality to home screen

**File**: `apps/expo/app/(tabs)/index.tsx`
**Changes**: Add logout button (example modification)

```typescript
import { useAuth } from "@tonik/auth-native";
import { Pressable, Text, StyleSheet } from "react-native";

// Inside component:
const { signOut, user } = useAuth();

// Add to JSX:
<Pressable style={styles.logoutButton} onPress={signOut}>
  <Text style={styles.logoutButtonText}>Sign Out</Text>
</Pressable>

// Add styles:
const styles = StyleSheet.create({
  logoutButton: {
    backgroundColor: "#EF4444",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
});
```

### Success Criteria:

#### Automated Verification:

- [ ] Expo app type checks: `pnpm -C apps/expo typecheck`
- [ ] Expo app bundles: `pnpm -C apps/expo start --no-dev`
- [ ] No missing peer dependencies

#### Manual Verification:

- [ ] App redirects to login screen when not authenticated
- [ ] Login screen displays social login options
- [ ] Email input works for magic links
- [ ] Navigation flows work correctly after login
- [ ] Logout works correctly

---

## Phase 4: Deep Linking Configuration

### Overview

Configure deep linking for OAuth callbacks and magic links in the Expo app.

### Changes Required:

#### 1. Configure app scheme

**File**: `apps/expo/app.json`
**Changes**: Update scheme and add deep linking configuration

```json
{
  "expo": {
    "name": "Daily Food",
    "slug": "daily-food",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "dailyfood",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.goszczu.daily-food",
      "usesAppleSignIn": true,
      "associatedDomains": ["applinks:your-domain.com"]
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "backgroundImage": "./assets/images/android-icon-background.png",
        "monochromeImage": "./assets/images/android-icon-monochrome.png"
      },
      "edgeToEdgeEnabled": true,
      "predictiveBackGestureEnabled": false,
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "dailyfood"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    "web": {
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      "@react-native-google-signin/google-signin",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff",
          "dark": {
            "backgroundColor": "#000000"
          }
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true,
      "reactCompiler": true,
      "autolinkingModuleResolution": true
    }
  }
}
```

#### 2. Create auth callback route

**File**: `apps/expo/app/(auth)/callback.tsx` (new)

```typescript
import { useEffect } from "react";
import { ActivityIndicator, View, StyleSheet, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@tonik/auth-native";

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { refreshSession, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      // The Supabase client should automatically handle the auth callback
      // via the deep link. We just need to wait for the auth state to update.

      // Give Supabase time to process the auth callback
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Refresh the session to get the latest state
      await refreshSession();
    };

    handleCallback();
  }, [refreshSession]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text style={styles.text}>Completing sign in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
});
```

#### 3. Update Supabase redirect URLs

**File**: `supabase/config.toml`
**Changes**: Add mobile redirect URLs

```toml
[auth]
enabled = true
site_url = "http://localhost:3000"
# Add mobile scheme to redirect URLs
additional_redirect_urls = [
  "http://localhost:3000/api/auth/callback",
  "dailyfood://auth/callback"
]
```

#### 4. Add Apple provider to Supabase (if not present)

**File**: `supabase/config.toml`
**Changes**: Add Apple provider configuration

```toml
[auth.external.apple]
enabled = false
client_id = "env(SUPABASE_AUTH_EXTERNAL_APPLE_ID)"
secret = "env(SUPABASE_AUTH_EXTERNAL_APPLE_SECRET)"
redirect_uri = ""
```

**File**: `.env.example`
**Changes**: Add Apple auth environment variables

```bash
# Apple Sign-In
export SUPABASE_AUTH_EXTERNAL_APPLE_ID=''
export SUPABASE_AUTH_EXTERNAL_APPLE_SECRET=''

# Expo public variables
export EXPO_PUBLIC_SUPABASE_URL='http://127.0.0.1:54321'
export EXPO_PUBLIC_SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
export EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=''
export EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=''
```

### Success Criteria:

#### Automated Verification:

- [ ] App.json configuration is valid JSON
- [ ] Deep linking configuration is correctly formatted
- [ ] TypeScript checks pass

#### Manual Verification:

- [ ] Magic links sent from app contain correct redirect URL
- [ ] Clicking magic link from email opens the app
- [ ] OAuth callbacks redirect back to the app
- [ ] Auth flow completes successfully after deep link
- [ ] App navigates to home screen after successful auth

---

## Testing Strategy

### Unit Tests:

- Test auth provider state management logic
- Test validation schemas from shared auth package
- Test OAuth integration with mock providers

### Integration Tests:

- Test deep linking for magic links
- Test OAuth flows end-to-end (requires development build)
- Test navigation guards and redirects

### Manual Testing Steps:

1. **Auth Flow Testing:**
   - [ ] Open app without session → redirects to auth screen
   - [ ] Tap Apple Sign-In → should work on iOS device/simulator
   - [ ] Tap Google Sign-In → should work on Android and iOS
   - [ ] Enter email and tap magic link → should send email
   - [ ] Click link in email → app should open and log in

2. **Deep Link Testing:**
   - [ ] Magic link from email opens app
   - [ ] Auth state is properly restored after callback
   - [ ] Navigation to home screen after successful auth

3. **Session Testing:**
   - [ ] Close and reopen app → should stay logged in
   - [ ] Sign out → should redirect to auth screen
   - [ ] Background app and resume → session should persist

4. **Error Handling:**
   - [ ] Invalid email shows error
   - [ ] Network error during sign-in shows appropriate message
   - [ ] Cancelled OAuth shows no error

---

## Performance Considerations

- **Lazy Loading**: Only load auth provider when needed
- **Secure Storage**: Use `expo-secure-store` for tokens
- **Memory Management**: Clean up OAuth listeners and subscriptions
- **Network Efficiency**: Minimize auth state refresh calls
- **Bundle Size**: Consider splitting social auth libraries if not needed

---

## Migration Notes

### Breaking Changes:

- `@tonik/auth` package will no longer export web components
- NextJS apps will need to import from `@tonik/auth-web`
- Package dependencies will need to be updated

### Migration Steps for Existing Code:

1. Update NextJS app imports to use `@tonik/auth-web`
2. Update `package.json` dependencies
3. Test all existing authentication flows
4. Deploy changes incrementally

### Rollback Plan:

- Keep original `@tonik/auth` package structure as backup
- Use feature flags if needed for gradual rollout
- Version both packages appropriately

---

## Future Enhancements (Out of Scope)

- Biometric authentication (FaceID/TouchID)
- Phone/SMS authentication
- Password-based authentication in mobile
- Offline sync for auth state
- Multi-factor authentication
- Session management across devices

---

## References

- Original research: [`thoughts/shared/research/2025-12-29-expo-auth-integration.md`](thoughts/shared/research/2025-12-29-expo-auth-integration.md)
- Current auth implementation: [`packages/auth/src/`](packages/auth/src/)
- Expo app structure: [`apps/expo/app/`](apps/expo/app/)
- Supabase configuration: [`supabase/config.toml`](supabase/config.toml)
- tRPC auth router: [`packages/api/src/router/auth.ts`](packages/api/src/router/auth.ts)
- [Supabase Auth with React Native](https://supabase.com/docs/guides/auth/native-mobile-deep-linking)
- [Expo Deep Linking](https://docs.expo.dev/guides/linking/)
- [Apple Sign-In with Expo](https://docs.expo.dev/versions/latest/sdk/apple-authentication/)
- [Google Sign-In for React Native](https://github.com/react-native-google-signin/google-signin)
