# Auth Packages Restructuring Plan v2

> **Supersedes**: `2025-12-29-expo-auth-implementation.md`
>
> This plan restructures the auth packages to deliver composable "form" components following a consistent pattern across web and native platforms. The app layer owns integration with Supabase/tRPC.

## Overview

The current `auth-native` package violates separation of concerns by:

- Creating its own Supabase client
- Managing auth state internally
- Using raw `StyleSheet` instead of a shared UI system

This plan restructures auth packages to match the well-designed `auth-web` pattern:

- Packages deliver **form components only**
- App layer owns **Supabase client and auth state**
- New `ui-native` package provides **NativeWind-based components**
- Native uses **tRPC** for API calls (except OAuth which goes direct to Supabase)

---

## Current vs Target Architecture

| Aspect          | Current (Native)                      | Target (Native)                                   |
| --------------- | ------------------------------------- | ------------------------------------------------- |
| Supabase client | Created in `auth-native`              | Created in Expo app                               |
| Auth state      | Managed by `auth-native` AuthProvider | Managed by Expo app AuthProvider                  |
| UI components   | Raw StyleSheet in `auth-native`       | NativeWind components from `ui-native`            |
| Form pattern    | Monolithic `LoginScreen`              | Compound components (like `auth-web`)             |
| API calls       | Direct Supabase from package          | tRPC mutations passed from app                    |
| OAuth           | Handled in package                    | Native SDK in app, direct Supabase token exchange |

---

## Target Package Structure

```
packages/
├── auth/                    # Shared schemas + utils (unchanged)
├── auth-web/                # Web auth forms (unchanged)
├── auth-native/             # Native auth forms (restructured)
├── ui/                      # Web UI components (unchanged)
└── ui-native/               # New: NativeWind + RNR components
```

---

## Phase 1: Create `@tonik/ui-native` Package

### Overview

Create a new native UI kit using NativeWind and React Native Reusables components, matching the API of `@tonik/ui` where applicable.

### 1.1 Package Structure

```
packages/ui-native/
├── src/
│   ├── index.ts                      # Main exports
│   ├── lib/
│   │   ├── utils.ts                  # cn() utility
│   │   └── icons.tsx                 # lucide-react-native exports
│   └── components/
│       ├── button.tsx
│       ├── input.tsx
│       ├── text.tsx
│       ├── card.tsx
│       ├── separator.tsx
│       ├── alert.tsx
│       ├── spinner.tsx
│       └── form.tsx                  # Form + FormField (react-hook-form)
├── package.json
├── tsconfig.json
└── eslint.config.js
```

### 1.2 package.json

```json
{
  "name": "@tonik/ui-native",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/src/index.d.ts",
      "default": "./src/index.ts"
    },
    "./*": {
      "types": "./dist/src/*.d.ts",
      "default": ["./src/*.tsx", "./src/*.ts"]
    },
    "./lib/*": {
      "types": "./dist/src/lib/*.d.ts",
      "default": ["./src/lib/*.ts", "./src/lib/*.tsx"]
    }
  },
  "scripts": {
    "build": "tsc",
    "clean": "git clean -xdf .cache .turbo dist node_modules",
    "dev": "tsc",
    "lint": "eslint",
    "typecheck": "tsc --noEmit --emitDeclarationOnly false"
  },
  "dependencies": {
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5",
    "@rn-primitives/slot": "^1.1.0",
    "@hookform/resolvers": "^3.9.1",
    "react-hook-form": "^7.54.0"
  },
  "peerDependencies": {
    "react": "*",
    "react-native": "*",
    "nativewind": "^4.0.0",
    "lucide-react-native": "^0.460.0",
    "react-native-svg": "*",
    "zod": "*"
  },
  "devDependencies": {
    "@tonik/eslint-config": "workspace:*",
    "@tonik/prettier-config": "workspace:*",
    "@tonik/tsconfig": "workspace:*",
    "@types/react": "catalog:react",
    "eslint": "catalog:",
    "prettier": "catalog:",
    "typescript": "catalog:"
  },
  "prettier": "@tonik/prettier-config"
}
```

### 1.3 Components to Implement

| Component                                                                  | Description                  | CVA Variants                                                                    |
| -------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------- |
| `Button`                                                                   | Pressable with loading state | default, destructive, outline, secondary, ghost, link + sizes (default, sm, lg) |
| `Input`                                                                    | TextInput with error styling | -                                                                               |
| `Text`                                                                     | Typography wrapper           | h1, h2, h3, h4, p, lead, large, small, muted                                    |
| `Card`, `CardHeader`, `CardContent`, `CardFooter`                          | Container components         | -                                                                               |
| `Separator`                                                                | Horizontal/vertical divider  | horizontal, vertical                                                            |
| `Alert`, `AlertTitle`, `AlertDescription`                                  | Status messages              | default, destructive                                                            |
| `Spinner`                                                                  | ActivityIndicator wrapper    | sizes                                                                           |
| `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` | react-hook-form integration  | -                                                                               |

### 1.4 Key Implementation Details

**`src/lib/utils.ts`**:

```typescript
import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**`src/button.tsx`** (example):

```typescript
import { forwardRef } from "react";
import { Pressable, Text, ActivityIndicator, type PressableProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

const buttonVariants = cva(
  "flex items-center justify-center rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary active:opacity-90",
        destructive: "bg-destructive active:opacity-90",
        outline: "border border-input bg-background active:bg-accent",
        secondary: "bg-secondary active:opacity-80",
        ghost: "active:bg-accent",
        link: "underline-offset-4",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const buttonTextVariants = cva("text-sm font-medium", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      destructive: "text-destructive-foreground",
      outline: "text-foreground",
      secondary: "text-secondary-foreground",
      ghost: "text-foreground",
      link: "text-primary underline",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface ButtonProps extends PressableProps, VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button = forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  ({ className, variant, size, isLoading, disabled, children, ...props }, ref) => {
    return (
      <Pressable
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="currentColor" />
        ) : (
          <Text className={cn(buttonTextVariants({ variant }))}>{children}</Text>
        )}
      </Pressable>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
```

### 1.5 Success Criteria

- [x] Package builds: `pnpm -C packages/ui-native build`
- [x] TypeScript checks pass: `pnpm -C packages/ui-native typecheck`
- [x] All components export correctly
- [ ] Components work with NativeWind classes

---

## Phase 2: Setup NativeWind in Expo App

### Overview

Configure NativeWind in the Expo app to enable Tailwind CSS styling for native components.

### 2.1 Install Dependencies

```bash
cd apps/expo
npx expo install nativewind tailwindcss react-native-css-interop
pnpm add -D tailwindcss
```

### 2.2 New Files

**`apps/expo/metro.config.js`**:

```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: "./global.css",
  inlineRem: 16,
});
```

**`apps/expo/tailwind.config.ts`**:

```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "../../packages/ui-native/src/**/*.{js,jsx,ts,tsx}",
    "../../packages/auth-native/src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
```

**`apps/expo/global.css`**:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  --secondary: 0 0% 96.1%;
  --secondary-foreground: 0 0% 9%;
  --muted: 0 0% 96.1%;
  --muted-foreground: 0 0% 45.1%;
  --accent: 0 0% 96.1%;
  --accent-foreground: 0 0% 9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 89.8%;
  --input: 0 0% 89.8%;
  --ring: 0 0% 63.9%;
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --card: 0 0% 3.9%;
  --card-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 0 0% 9%;
  --secondary: 0 0% 14.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 0 0% 14.9%;
  --muted-foreground: 0 0% 63.9%;
  --accent: 0 0% 14.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 14.9%;
  --input: 0 0% 14.9%;
  --ring: 0 0% 83.1%;
}
```

### 2.3 Modify Existing Files

**`apps/expo/babel.config.js`**:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

**`apps/expo/app/_layout.tsx`** (add at top):

```typescript
import "../global.css";
```

### 2.4 Add Dependencies to package.json

```json
{
  "dependencies": {
    "nativewind": "^4.1.23",
    "react-native-css-interop": "^0.1.12",
    "lucide-react-native": "^0.460.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.17"
  }
}
```

### 2.5 Success Criteria

- [x] Metro bundler starts without errors
- [x] NativeWind classes apply correctly to components
- [x] Theme CSS variables work (light/dark mode)

---

## Phase 3: Create tRPC Client for Expo

### Overview

Create a tRPC client for the Expo app that communicates with the Next.js backend, using SecureStore for auth token storage.

### 3.1 New Files in Expo App

**`apps/expo/src/config/env.ts`** (update):

```typescript
export const env = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL!,
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  API_URL: process.env.EXPO_PUBLIC_API_URL!, // e.g., "http://192.168.1.100:3000" for local dev
};
```

**`apps/expo/src/trpc/react.tsx`**:

```typescript
import { useState } from "react";
import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SuperJSON from "superjson";
import * as SecureStore from "expo-secure-store";

import type { AppRouter } from "@tonik/api";
import { env } from "../config/env";

export const api = createTRPCReact<AppRouter>();

const AUTH_TOKEN_KEY = "supabase-auth-token";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        retry: 1,
      },
    },
  });
}

let clientQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (!clientQueryClient) {
    clientQueryClient = makeQueryClient();
  }
  return clientQueryClient;
}

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            __DEV__ || (op.direction === "down" && op.result instanceof Error),
        }),
        httpBatchLink({
          transformer: SuperJSON,
          url: `${env.API_URL}/api/trpc`,
          async headers() {
            const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
            return {
              "x-trpc-source": "expo-react",
              ...(token && { Authorization: `Bearer ${token}` }),
            };
          },
        }),
      ],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </api.Provider>
    </QueryClientProvider>
  );
}

// Helper to store/clear auth token
export const authTokenStorage = {
  set: (token: string) => SecureStore.setItemAsync(AUTH_TOKEN_KEY, token),
  get: () => SecureStore.getItemAsync(AUTH_TOKEN_KEY),
  clear: () => SecureStore.deleteItemAsync(AUTH_TOKEN_KEY),
};
```

### 3.2 Dependencies to Add to Expo App

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.60.0",
    "@trpc/client": "^11.0.0",
    "@trpc/react-query": "^11.0.0",
    "@tonik/api": "workspace:*",
    "superjson": "^2.2.2"
  }
}
```

### 3.3 Modify API Package for Token Auth

**`packages/api/src/trpc.ts`** - Update `createTRPCContext`:

```typescript
import { createClient, createClientWithToken } from "@tonik/supabase/server";

export const createTRPCContext = async (opts: {
  headers?: Headers;
  cookieStore?: CookieStore;
  supabase: SupabaseConfig;
  source?: string;
  logLevel?: "trace" | "debug" | "info" | "warn" | "error" | "fatal";
}) => {
  const source = opts.headers?.get("x-trpc-source") ?? opts.source ?? "unknown";

  // Support both cookie-based (web) and token-based (native) auth
  const authHeader = opts.headers?.get("Authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;

  const supabaseAnonClient = bearerToken
    ? createClientWithToken({
        supabaseApiUrl: opts.supabase.supabaseUrl,
        supabaseKey: opts.supabase.supabaseAnonKey,
        accessToken: bearerToken,
      })
    : createClient({
        supabaseApiUrl: opts.supabase.supabaseUrl,
        supabaseKey: opts.supabase.supabaseAnonKey,
        cookieStore: opts.cookieStore,
      });

  const supabaseServiceClient = createClient({
    supabaseApiUrl: opts.supabase.supabaseUrl,
    supabaseKey: opts.supabase.supabaseServiceRoleKey,
    cookieStore: opts.cookieStore,
  });

  const {
    data: { user },
  } = await supabaseAnonClient.auth.getUser();

  const {
    data: { session },
  } = await supabaseAnonClient.auth.getSession();

  return {
    logLevel: opts.logLevel ?? "info",
    source,
    headers: opts.headers,
    protocol: opts.headers?.get("x-forwarded-proto") ?? "http",
    host:
      opts.headers?.get("x-forwarded-host") ??
      opts.headers?.get("host") ??
      "http://localhost:3000",
    supabase: supabaseAnonClient,
    __dangerousSupabaseServiceRole: supabaseServiceClient,
    user,
    session,
  };
};
```

**`supabase/src/server.ts`** - Add new function:

```typescript
interface TokenOptions {
  supabaseApiUrl: string;
  supabaseKey: string;
  accessToken: string;
}

export function createClientWithToken(options: TokenOptions) {
  return createServerClient<Database>(
    options.supabaseApiUrl,
    options.supabaseKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${options.accessToken}`,
        },
      },
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    },
  );
}
```

**`supabase/src/index.ts`** - Update exports:

```typescript
export { createClient, createClientWithToken } from "./server";
```

### 3.4 Success Criteria

- [x] tRPC client connects to Next.js backend
- [x] Auth token is sent in headers when available
- [x] Queries and mutations work from Expo app

---

## Phase 4: Restructure `@tonik/auth-native`

### Overview

Restructure the auth-native package to follow the compound component pattern used by auth-web, removing Supabase client creation and auth state management.

### 4.1 New Package Structure

```
packages/auth-native/
├── src/
│   ├── index.ts                          # Main exports
│   ├── types.ts                          # TypeScript interfaces
│   ├── context.ts                        # Shared form context utilities
│   └── recipes/
│       ├── index.ts                      # Recipe exports
│       ├── login.tsx                     # Login compound components
│       ├── signup.tsx                    # Signup compound components
│       ├── forgot-password.tsx           # Forgot password components
│       └── reset-password.tsx            # Reset password components
├── package.json
├── tsconfig.json
└── eslint.config.js
```

### 4.2 Updated package.json

```json
{
  "name": "@tonik/auth-native",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/src/index.d.ts",
      "default": "./src/index.ts"
    },
    "./recipes/*": {
      "types": "./dist/src/recipes/*.d.ts",
      "default": ["./src/recipes/*.tsx", "./src/recipes/*.ts"]
    }
  },
  "scripts": {
    "build": "tsc",
    "clean": "git clean -xdf .cache .turbo dist node_modules",
    "dev": "tsc",
    "lint": "eslint",
    "typecheck": "tsc --noEmit --emitDeclarationOnly false"
  },
  "dependencies": {
    "@tonik/auth": "workspace:*",
    "@tonik/ui-native": "workspace:*",
    "zod": "catalog:"
  },
  "peerDependencies": {
    "react": "*",
    "react-native": "*",
    "@react-native-google-signin/google-signin": "^13.0.0",
    "@invertase/react-native-apple-authentication": "^2.4.0",
    "expo-linking": "*"
  },
  "devDependencies": {
    "@tonik/eslint-config": "workspace:*",
    "@tonik/prettier-config": "workspace:*",
    "@tonik/tsconfig": "workspace:*",
    "@types/react": "catalog:react",
    "eslint": "catalog:",
    "prettier": "catalog:",
    "typescript": "catalog:"
  },
  "prettier": "@tonik/prettier-config"
}
```

### 4.3 Compound Component Design

**`src/types.ts`**:

```typescript
import type { LoginRequest, SignupRequest } from "@tonik/auth/schemas";

export interface LoginContextValue {
  mutate: (data: LoginRequest) => void;
  isPending?: boolean;
  error?: { message?: string } | null;
  isSuccess?: boolean;
  variables?: LoginRequest;
}

export interface SignupContextValue {
  mutate: (data: SignupRequest) => void;
  isPending?: boolean;
  error?: { message?: string } | null;
  isSuccess?: boolean;
  variables?: SignupRequest;
}
```

**`src/recipes/login.tsx`** - Compound components:

| Component                     | Props                              | Description                 |
| ----------------------------- | ---------------------------------- | --------------------------- |
| `Login`                       | `LoginContextValue & { children }` | Root context provider       |
| `LoginContent`                | `{ hideOnSuccess?, children }`     | Conditional content wrapper |
| `LoginUsernamePassword`       | `{ children }`                     | Email/password form section |
| `LoginUsernamePasswordFields` | `{ forgotPasswordLink? }`          | Email + password inputs     |
| `LoginButton`                 | `{ type, children }`               | Submit button with type     |
| `LoginErrorMessage`           | -                                  | Displays mutation error     |
| `LoginSocial`                 | `{ children }`                     | Social buttons container    |
| `LoginSocialGoogle`           | `{ onPress }`                      | Google sign-in button       |
| `LoginSocialApple`            | `{ onPress }`                      | Apple sign-in button        |
| `LoginSectionSplitter`        | -                                  | "or" divider                |
| `LoginOtpEmail`               | `{ children }`                     | Magic link section          |
| `LoginFooter`                 | `{ link?, children }`              | Footer with signup link     |
| `LoginSuccess`                | `{ type, children }`               | Success state content       |

### 4.4 Files to Remove

- `src/provider.tsx` - AuthProvider moves to Expo app
- All Supabase client creation logic
- `SecureStoreAdapter` - moves to Expo app
- `useAuth` hook - moves to Expo app

### 4.5 Example Implementation

**`src/recipes/login.tsx`**:

```typescript
import { createContext, useContext, type ReactNode } from "react";
import { View, Platform } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button, Input, Text, Separator, Alert } from "@tonik/ui-native";
import { emailPasswordSchema, otpEmailSchema } from "@tonik/auth/schemas";
import type { LoginContextValue } from "../types";

const LoginContext = createContext<LoginContextValue | null>(null);

const useLoginContext = () => {
  const ctx = useContext(LoginContext);
  if (!ctx) throw new Error("Login components must be used within <Login>");
  return ctx;
};

// Root component
export function Login({
  children,
  mutate,
  isPending,
  error,
  isSuccess,
  variables,
}: LoginContextValue & { children: ReactNode }) {
  return (
    <LoginContext.Provider value={{ mutate, isPending, error, isSuccess, variables }}>
      <View className="flex-1 p-6 bg-background">{children}</View>
    </LoginContext.Provider>
  );
}

// Content wrapper with conditional hide
export function LoginContent({
  hideOnSuccess,
  children,
}: {
  hideOnSuccess?: string;
  children: ReactNode;
}) {
  const { isSuccess, variables } = useLoginContext();
  if (isSuccess && hideOnSuccess && variables?.type === hideOnSuccess) {
    return null;
  }
  return <>{children}</>;
}

// Social login container
export function LoginSocial({ children }: { children: ReactNode }) {
  return <View className="gap-3">{children}</View>;
}

// Google sign-in button
export function LoginSocialGoogle({ onPress }: { onPress?: () => void }) {
  const { isPending } = useLoginContext();
  return (
    <Button
      variant="outline"
      className="w-full"
      onPress={onPress}
      disabled={isPending}
    >
      Continue with Google
    </Button>
  );
}

// Apple sign-in button (iOS only by default)
export function LoginSocialApple({
  onPress,
  showOnAndroid = false,
}: {
  onPress?: () => void;
  showOnAndroid?: boolean;
}) {
  const { isPending } = useLoginContext();

  if (Platform.OS !== "ios" && !showOnAndroid) {
    return null;
  }

  return (
    <Button
      variant="default"
      className="w-full bg-black"
      onPress={onPress}
      disabled={isPending}
    >
      Continue with Apple
    </Button>
  );
}

// Section splitter ("or" divider)
export function LoginSectionSplitter() {
  return (
    <View className="flex-row items-center my-6">
      <Separator className="flex-1" />
      <Text className="px-4 text-muted-foreground">or</Text>
      <Separator className="flex-1" />
    </View>
  );
}

// Error message display
export function LoginErrorMessage() {
  const { error } = useLoginContext();
  if (!error?.message) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <Text className="text-destructive-foreground">{error.message}</Text>
    </Alert>
  );
}

// Email/password form wrapper
export function LoginUsernamePassword({ children }: { children: ReactNode }) {
  return <View className="gap-4">{children}</View>;
}

// Email/password input fields
export function LoginUsernamePasswordFields({
  forgotPasswordLink,
}: {
  forgotPasswordLink?: ReactNode;
}) {
  const { mutate, isPending } = useLoginContext();

  const form = useForm({
    resolver: zodResolver(emailPasswordSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit((data) => {
    mutate({ type: "email", ...data });
  });

  return (
    <View className="gap-4">
      <Controller
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <View className="gap-2">
            <Text className="text-sm font-medium">Email</Text>
            <Input
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={field.value}
              onChangeText={field.onChange}
              editable={!isPending}
              error={!!fieldState.error}
            />
            {fieldState.error && (
              <Text className="text-sm text-destructive">
                {fieldState.error.message}
              </Text>
            )}
          </View>
        )}
      />
      <Controller
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <View className="gap-2">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm font-medium">Password</Text>
              {forgotPasswordLink}
            </View>
            <Input
              placeholder="********"
              secureTextEntry
              value={field.value}
              onChangeText={field.onChange}
              editable={!isPending}
              error={!!fieldState.error}
            />
            {fieldState.error && (
              <Text className="text-sm text-destructive">
                {fieldState.error.message}
              </Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

// Submit button
export function LoginButton({
  type,
  children,
}: {
  type: "email" | "otp-email";
  children: ReactNode;
}) {
  const { isPending } = useLoginContext();

  return (
    <Button className="w-full mt-4" isLoading={isPending}>
      {children}
    </Button>
  );
}

// OTP Email section
export function LoginOtpEmail({ children }: { children: ReactNode }) {
  return <View className="gap-4">{children}</View>;
}

// Footer with link
export function LoginFooter({
  children,
  link,
}: {
  children: ReactNode;
  link?: ReactNode;
}) {
  return (
    <View className="flex-row justify-center mt-6">
      <Text className="text-muted-foreground">{children}</Text>
      {link}
    </View>
  );
}

// Success state
export function LoginSuccess({
  type,
  children,
}: {
  type: string;
  children: ReactNode;
}) {
  const { isSuccess, variables } = useLoginContext();

  if (!isSuccess || variables?.type !== type) {
    return null;
  }

  return <View className="flex-1 justify-center items-center">{children}</View>;
}
```

### 4.6 Success Criteria

- [x] Package builds without Supabase dependency
- [x] Compound components export correctly
- [x] Components use `@tonik/ui-native` for styling
- [x] Pattern matches `auth-web` structure

---

## Phase 5: Update Expo App Auth Layer

### Overview

Move auth state management to the Expo app layer, using the restructured auth-native components with tRPC.

### 5.1 New App Structure

```
apps/expo/
├── src/
│   ├── config/
│   │   └── env.ts                       # Environment variables
│   ├── lib/
│   │   ├── supabase.ts                  # Supabase client with SecureStore
│   │   └── secure-store-adapter.ts      # SecureStore adapter
│   ├── providers/
│   │   ├── auth-provider.tsx            # Auth state management
│   │   └── index.tsx                    # Combined providers
│   ├── hooks/
│   │   └── use-auth.ts                  # useAuth hook export
│   └── trpc/
│       └── react.tsx                    # tRPC client
├── app/
│   ├── _layout.tsx                      # Root layout with all providers
│   └── (auth)/
│       ├── _layout.tsx                  # Auth group layout
│       ├── login.tsx                    # Composed login screen
│       ├── signup.tsx                   # Composed signup screen
│       ├── forgot-password.tsx
│       └── reset-password.tsx
```

### 5.2 Auth Provider

**`apps/expo/src/providers/auth-provider.tsx`**:

```typescript
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AppState } from "react-native";
import * as SecureStore from "expo-secure-store";
import { createClient, type SupabaseClient, type User, type Session } from "@supabase/supabase-js";

import { env } from "../config/env";
import { authTokenStorage } from "../trpc/react";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  supabase: SupabaseClient;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// SecureStore adapter for Supabase
const SecureStoreAdapter = {
  getItem: async (key: string) => SecureStore.getItemAsync(key),
  setItem: async (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: async (key: string) => SecureStore.deleteItemAsync(key),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Create Supabase client
  const [supabase] = useState(() =>
    createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: {
        storage: SecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  );

  // Sync auth token for tRPC
  const syncAuthToken = useCallback(async (session: Session | null) => {
    if (session?.access_token) {
      await authTokenStorage.set(session.access_token);
    } else {
      await authTokenStorage.clear();
    }
  }, []);

  // Initialize auth
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await syncAuthToken(session);
      setState({
        session,
        user: session?.user ?? null,
        isLoading: false,
        isAuthenticated: !!session,
      });
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await syncAuthToken(session);
        setState((prev) => ({
          ...prev,
          session,
          user: session?.user ?? null,
          isAuthenticated: !!session,
        }));
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, syncAuthToken]);

  // Refresh on app foreground
  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextState) => {
      if (nextState === "active") {
        await supabase.auth.getSession();
      }
    });
    return () => subscription.remove();
  }, [supabase]);

  // OAuth methods (direct Supabase, not tRPC)
  const signInWithGoogle = useCallback(async () => {
    const { GoogleSignin } = await import("@react-native-google-signin/google-signin");
    await GoogleSignin.hasPlayServices();
    const { data: userInfo } = await GoogleSignin.signIn();
    if (!userInfo?.idToken) throw new Error("No ID token from Google");

    const { error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: userInfo.idToken,
    });
    if (error) throw error;
  }, [supabase]);

  const signInWithApple = useCallback(async () => {
    const appleAuth = await import("@invertase/react-native-apple-authentication");
    const credential = await appleAuth.default.performRequest({
      requestedOperation: appleAuth.AppleAuthRequestOperation.LOGIN,
      requestedScopes: [
        appleAuth.AppleAuthRequestScope.EMAIL,
        appleAuth.AppleAuthRequestScope.FULL_NAME,
      ],
    });
    if (!credential.identityToken) throw new Error("No identity token from Apple");

    const { error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: credential.identityToken,
    });
    if (error) throw error;
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    await authTokenStorage.clear();
  }, [supabase]);

  const refreshSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.refreshSession();
    await syncAuthToken(session);
  }, [supabase, syncAuthToken]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        supabase,
        signInWithGoogle,
        signInWithApple,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
```

### 5.3 Composed Login Screen

**`apps/expo/app/(auth)/login.tsx`**:

```typescript
import { View } from "react-native";
import { Link } from "expo-router";
import { Text } from "@tonik/ui-native";
import {
  Login,
  LoginContent,
  LoginUsernamePassword,
  LoginUsernamePasswordFields,
  LoginButton,
  LoginSocial,
  LoginSocialGoogle,
  LoginSocialApple,
  LoginSectionSplitter,
  LoginOtpEmail,
  LoginFooter,
  LoginErrorMessage,
  LoginSuccess,
} from "@tonik/auth-native/recipes/login";

import { api } from "@/src/trpc/react";
import { useAuth } from "@/src/providers/auth-provider";

export default function LoginScreen() {
  const loginMutation = api.auth.login.useMutation();
  const { signInWithGoogle, signInWithApple } = useAuth();

  return (
    <Login
      mutate={loginMutation.mutate}
      isPending={loginMutation.isPending}
      error={loginMutation.error}
      isSuccess={loginMutation.isSuccess}
      variables={loginMutation.variables}
    >
      <View className="flex-1 justify-center">
        <Text className="text-3xl font-bold text-center mb-2">Welcome</Text>
        <Text className="text-muted-foreground text-center mb-8">
          Sign in to continue
        </Text>

        <LoginContent hideOnSuccess="otp-email">
          <LoginSocial>
            <LoginSocialApple onPress={signInWithApple} />
            <LoginSocialGoogle onPress={signInWithGoogle} />
          </LoginSocial>

          <LoginSectionSplitter />

          <LoginErrorMessage />

          <LoginUsernamePassword>
            <LoginUsernamePasswordFields
              forgotPasswordLink={
                <Link href="/forgot-password" className="text-sm text-primary">
                  Forgot password?
                </Link>
              }
            />
            <LoginButton type="email">Sign in</LoginButton>
          </LoginUsernamePassword>

          <LoginSectionSplitter />

          <LoginOtpEmail>
            <LoginButton type="otp-email">
              Continue with Magic Link
            </LoginButton>
          </LoginOtpEmail>

          <LoginFooter
            link={
              <Link href="/signup" className="text-primary font-medium">
                Create one
              </Link>
            }
          >
            Don't have an account?{" "}
          </LoginFooter>
        </LoginContent>

        <LoginSuccess type="otp-email">
          <Text className="text-xl font-semibold mb-2">Check your email</Text>
          <Text className="text-muted-foreground text-center">
            We've sent a login link to your email
          </Text>
        </LoginSuccess>
      </View>
    </Login>
  );
}
```

### 5.4 Root Layout with Providers

**`apps/expo/app/_layout.tsx`**:

```typescript
import "../global.css";

import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider, useAuth } from "@/src/providers/auth-provider";
import { TRPCReactProvider } from "@/src/trpc/react";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
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
        </Stack>
      </AuthGate>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <TRPCReactProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </TRPCReactProvider>
  );
}
```

### 5.5 Success Criteria

- [x] App builds and runs
- [x] Auth state persists across app restarts
- [x] tRPC mutations work for login/signup
- [x] OAuth (Google/Apple) works directly with Supabase
- [x] Navigation guards redirect correctly

---

## Migration Summary

| Phase | Package/Location           | Changes                                        |
| ----- | -------------------------- | ---------------------------------------------- |
| 1     | `packages/ui-native/`      | New package with NativeWind + RNR components   |
| 2     | `apps/expo/`               | NativeWind setup (metro, babel, tailwind, css) |
| 3     | `apps/expo/src/trpc/`      | tRPC client for native                         |
| 3     | `packages/api/src/trpc.ts` | Token-based auth support                       |
| 3     | `supabase/src/server.ts`   | `createClientWithToken` function               |
| 4     | `packages/auth-native/`    | Restructure to compound components             |
| 5     | `apps/expo/src/providers/` | App-level AuthProvider                         |
| 5     | `apps/expo/app/(auth)/`    | Composed auth screens                          |

---

## Environment Variables

**`.env.example`** additions:

```bash
# Expo app
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000  # Local IP for device testing
```

---

## Testing Checklist

### Automated

- [ ] All packages build: `pnpm build`
- [ ] All packages typecheck: `pnpm typecheck`
- [ ] Linting passes: `pnpm lint`

### Manual

- [ ] NativeWind styles apply correctly
- [ ] Login with email/password via tRPC
- [ ] Login with magic link via tRPC
- [ ] Login with Google (direct Supabase)
- [ ] Login with Apple (direct Supabase, iOS only)
- [ ] Session persists after app restart
- [ ] Auth token syncs with tRPC client
- [ ] Navigation guards work correctly
- [ ] Sign out clears session and token

---

## References

- Previous plan: `thoughts/shared/plans/2025-12-29-expo-auth-implementation.md`
- Research: `thoughts/shared/research/2025-12-29-expo-auth-integration.md`
- React Native Reusables: https://reactnativereusables.com/
- NativeWind: https://www.nativewind.dev/
- Supabase Auth: https://supabase.com/docs/guides/auth
