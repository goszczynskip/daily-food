---
date: 2026-01-08T15:18:17+01:00
researcher: goszczu
git_commit: 5d1ac3edc6cb8ac811e217d5ba6e01dccec8207a
branch: main
repository: daily-food
topic: "Expo App Internationalization with react-i18next - Local Translation Files and Package-Level Overrides"
tags:
  [
    research,
    i18n,
    react-i18next,
    expo,
    internationalization,
    monorepo,
    auth-native,
  ]
status: complete
last_updated: 2026-01-08
last_updated_by: goszczu
last_updated_note: "Added follow-up decisions on language persistence, RTL, and email migration"
---

## Research Question

How to implement internationalization (i18n) in an Expo app using react-i18next with:

1. Local (git-managed) translation files
2. Multiple structured translation files that can be managed independently
3. Package-level translations (e.g., `@tonik/auth-native`) that can be overridden from the host app (`apps/expo`)

## Summary

This research provides a comprehensive implementation guide for adding i18n to the Daily Food Expo app using `react-i18next`. The key findings are:

1. **Current State**: The codebase has partial i18n only for email templates (`packages/email`). No frontend i18n exists in `apps/expo` or `apps/nextjs`.

2. **Recommended Approach**: Use `react-i18next` with `expo-localization` for device language detection, bundling translations as JSON files (synchronous loading for React Native).

3. **Namespace Pattern**: Split translations into logical namespaces (`common`, `auth`, `profile`) that can be managed independently.

4. **Package Override Pattern**: Use `i18next.addResourceBundle()` with `deep=true, overwrite=false` to allow packages to provide defaults that apps can override.

## Detailed Findings

### 1. Current i18n State in Codebase

The codebase currently has **partial i18n** only for the email package:

| Location                                 | Status                                        |
| ---------------------------------------- | --------------------------------------------- | ----- |
| `packages/email/src/components/lang.tsx` | Custom `tr()` function for email translations |
| `packages/email/src/lib/render.tsx`      | `SupportedLanguage` type: `"en"               | "pl"` |
| `apps/expo/`                             | No i18n - hardcoded English strings           |
| `apps/nextjs/`                           | No i18n - hardcoded `lang="en"`               |

**Key existing files:**

- `packages/email/src/components/lang.tsx:1-26` - Translation utility
- `apps/nextjs/src/app/api/auth/send-email/route.ts:116-124` - Language detection from user metadata

### 2. Required Dependencies

```bash
# For apps/expo
npx expo install expo-localization
npm install react-i18next i18next --save

# No AsyncStorage needed - using Supabase user_metadata for persistence
```

### 3. Recommended File Structure (Colocated Translations)

Each package owns its translations. No shared i18n package.

```
apps/expo/
├── src/
│   ├── i18n/
│   │   ├── index.ts               # i18next configuration + Supabase sync
│   │   ├── types.d.ts             # TypeScript declarations
│   │   └── locales/
│   │       ├── en/
│   │       │   ├── common.json    # App-wide: buttons, labels, errors
│   │       │   └── app.json       # App-specific screens
│   │       └── pl/
│   │           ├── common.json
│   │           └── app.json

packages/auth-native/
├── src/
│   ├── i18n/
│   │   ├── index.ts               # registerAuthI18n() + AUTH_NAMESPACE
│   │   └── locales/
│   │       ├── en.json            # Auth translations (login, signup, etc.)
│   │       ├── pl.json
│   │       └── index.ts           # Exports locales with types

packages/email/
├── src/
│   ├── i18n/
│   │   ├── index.ts               # getTranslation() helper for server-side
│   │   └── locales/
│   │       ├── en.json            # Email translations
│   │       ├── pl.json
│   │       └── index.ts           # Exports locales with types
```

**Colocation benefits:**

- Each package is self-contained and independently versioned
- Translations live next to the code that uses them
- Clear ownership - auth team owns auth translations
- Host app can override package translations via `addResourceBundle()`

### 4. Core i18next Configuration for Expo

```typescript
// apps/expo/src/i18n/index.ts
import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import package translations for registration
import { registerAuthI18n } from "@tonik/auth-native/i18n";

import enApp from "./locales/en/app.json";
// App-specific auth overrides (optional)
import enAuthOverrides from "./locales/en/auth.json";
// Import app translations (bundled)
import enCommon from "./locales/en/common.json";
import plApp from "./locales/pl/app.json";
import plAuthOverrides from "./locales/pl/auth.json";
import plCommon from "./locales/pl/common.json";

const resources = {
  en: {
    common: enCommon,
    app: enApp,
    auth: enAuthOverrides, // App overrides loaded first
  },
  pl: {
    common: plCommon,
    app: plApp,
    auth: plAuthOverrides,
  },
};

// Get device language
const deviceLanguage = getLocales()[0]?.languageCode ?? "en";
const supportedLanguages = ["en", "pl"];
const languageToUse = supportedLanguages.includes(deviceLanguage)
  ? deviceLanguage
  : "en";

i18n.use(initReactI18next).init({
  resources,
  lng: languageToUse,
  fallbackLng: "en",

  // Namespaces
  ns: ["common", "app", "auth"],
  defaultNS: "common",

  interpolation: {
    escapeValue: false, // React already escapes
  },

  // React Native specific
  compatibilityJSON: "v4", // For pluralization

  react: {
    useSuspense: false, // RN doesn't support Suspense well
  },
});

// Register package defaults AFTER init
// These fill in missing keys but don't overwrite app translations
registerAuthI18n(i18n);

export default i18n;
```

### 5. Package Translation Setup (@tonik/auth-native)

```typescript
// packages/auth-native/src/i18n/locales/en.json
{
  "login": {
    "title": "Sign In",
    "emailLabel": "Email",
    "emailPlaceholder": "m@example.com",
    "passwordLabel": "Password",
    "submitButton": "Sign in",
    "continueWithGoogle": "Continue with Google",
    "or": "or",
    "forgotPassword": "Forgot password?",
    "noAccount": "Don't have an account?",
    "signUp": "Sign up",
    "otpPrompt": "Enter the {{length}}-digit code we sent to your email",
    "errors": {
      "invalidEmail": "Invalid email",
      "passwordRequired": "Password is required",
      "credentialsRevoked": "User credentials are revoked",
      "tokenNotFound": "Not found a user token",
      "identityTokenFailed": "Failed to obtain identityToken"
    }
  },
  "signup": {
    "title": "Create Account",
    "confirmPasswordLabel": "Confirm Password"
  },
  "forgotPassword": {
    "title": "Reset Password",
    "description": "Enter your email to receive a reset link"
  }
}
```

```typescript
// packages/auth-native/src/i18n/locales/index.ts
import en from "./en.json";
import pl from "./pl.json";

export const authLocales = { en, pl } as const;
export type AuthTranslationKeys = typeof en;
```

```typescript
// packages/auth-native/src/i18n/index.ts
import type { i18n } from "i18next";

import type { AuthTranslationKeys } from "./locales";
import { authLocales } from "./locales";

export const AUTH_NAMESPACE = "auth";

export interface RegisterAuthI18nOptions {
  /** Override default translations per language */
  overrides?: Partial<Record<string, Partial<AuthTranslationKeys>>>;
  /** If true, package translations overwrite existing (default: false) */
  overwriteExisting?: boolean;
}

/**
 * Registers auth translations with an i18next instance.
 * Call AFTER i18n.init() to add package defaults without overwriting app translations.
 */
export function registerAuthI18n(
  i18nInstance: i18n,
  options: RegisterAuthI18nOptions = {},
) {
  const { overrides = {}, overwriteExisting = false } = options;

  // Register package defaults for each language
  for (const [lng, translations] of Object.entries(authLocales)) {
    i18nInstance.addResourceBundle(
      lng,
      AUTH_NAMESPACE,
      translations,
      true, // deep merge
      overwriteExisting, // false = don't overwrite app translations
    );
  }

  // Apply explicit overrides if provided
  for (const [lng, overrideTranslations] of Object.entries(overrides)) {
    if (overrideTranslations) {
      i18nInstance.addResourceBundle(
        lng,
        AUTH_NAMESPACE,
        overrideTranslations,
        true,
        true, // overwrite for explicit overrides
      );
    }
  }
}

export { authLocales, type AuthTranslationKeys };
```

### 6. TypeScript Configuration

```typescript
// apps/expo/src/@types/i18next.d.ts
import "i18next";

import type { AuthTranslationKeys } from "@tonik/auth-native/i18n";

import type app from "../i18n/locales/en/app.json";
import type common from "../i18n/locales/en/common.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof common;
      app: typeof app;
      auth: AuthTranslationKeys;
    };
    returnNull: false;
  }
}
```

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*", "src/@types/**/*"]
}
```

### 7. Usage in Components

```typescript
// packages/auth-native/src/recipes/login.tsx
import { useTranslation } from 'react-i18next';
import { AUTH_NAMESPACE } from '../i18n';

const LoginForm = () => {
  const { t } = useTranslation(AUTH_NAMESPACE);

  return (
    <View>
      <Text style={styles.title}>{t('login.title')}</Text>
      <Input
        label={t('login.emailLabel')}
        placeholder={t('login.emailPlaceholder')}
      />
      <Input
        label={t('login.passwordLabel')}
        secureTextEntry
      />
      <Button>{t('login.submitButton')}</Button>
      <TouchableOpacity>
        <Text>{t('login.forgotPassword')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const LoginOtpVerify = ({ codeLength }: { codeLength: number }) => {
  const { t } = useTranslation(AUTH_NAMESPACE);

  return (
    <Text>{t('login.otpPrompt', { length: codeLength })}</Text>
  );
};
```

```typescript
// apps/expo/src/app/(app)/profile.tsx
import { useTranslation } from 'react-i18next';

const ProfileScreen = () => {
  const { t, i18n } = useTranslation('app');
  const { t: tCommon } = useTranslation('common');

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // Optionally persist to AsyncStorage
  };

  return (
    <View>
      <Text>{t('profile.title')}</Text>
      <Button onPress={() => changeLanguage('en')}>
        {tCommon('languages.english')}
      </Button>
      <Button onPress={() => changeLanguage('pl')}>
        {tCommon('languages.polish')}
      </Button>
    </View>
  );
};
```

### 8. App Entry Point Integration

```typescript
// apps/expo/src/app/_layout.tsx
import '../i18n'; // Import i18n configuration FIRST

import { Stack } from 'expo-router';
import { TRPCProvider } from '~/trpc/react';
// ... other imports

export default function RootLayout() {
  return (
    <TRPCProvider>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
    </TRPCProvider>
  );
}
```

### 9. Override Pattern Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Translation Resolution                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. App calls t('auth:login.title')                        │
│                                                             │
│  2. i18next checks resources['en']['auth']['login.title']  │
│                                                             │
│  3. Resolution priority:                                    │
│     ┌─────────────────────────────────────┐                │
│     │ App translations (loaded at init)   │  ← WINS       │
│     │ "Welcome Back!"                     │                │
│     └─────────────────────────────────────┘                │
│                      ↓ if missing                          │
│     ┌─────────────────────────────────────┐                │
│     │ Package defaults (addResourceBundle)│  ← FALLBACK   │
│     │ "Sign In"                           │                │
│     └─────────────────────────────────────┘                │
│                      ↓ if missing                          │
│     ┌─────────────────────────────────────┐                │
│     │ fallbackLng ('en')                  │                │
│     └─────────────────────────────────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 10. Language Persistence with Supabase User Metadata

**Decision**: Language preference is stored in Supabase `user_metadata.language` and synced locally via the auth session object. On cold start, detect device language. On subsequent runs, use cached user session.

```typescript
// apps/expo/src/i18n/index.ts
import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// ... resource imports ...

export const SUPPORTED_LANGUAGES = ["en", "pl"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Get initial language for cold start (before auth session is loaded)
 * Uses device language as fallback
 */
function getInitialLanguage(): SupportedLanguage {
  const deviceLanguage = getLocales()[0]?.languageCode ?? "en";
  return SUPPORTED_LANGUAGES.includes(deviceLanguage as SupportedLanguage)
    ? (deviceLanguage as SupportedLanguage)
    : "en";
}

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: "en",
  ns: ["common", "app", "auth"],
  defaultNS: "common",
  interpolation: { escapeValue: false },
  compatibilityJSON: "v4",
  react: { useSuspense: false },
});

export default i18n;

/**
 * Initialize language from user session (call after auth is ready)
 * Falls back to device language if no preference stored
 */
export function initializeLanguageFromSession(
  userMetadata: { language?: string } | null,
): void {
  const sessionLanguage = userMetadata?.language;

  if (
    sessionLanguage &&
    SUPPORTED_LANGUAGES.includes(sessionLanguage as SupportedLanguage)
  ) {
    i18n.changeLanguage(sessionLanguage);
  }
  // If no session preference, keep the device language from init
}

/**
 * Change language and sync to Supabase user metadata
 */
export async function changeLanguage(
  lng: SupportedLanguage,
  supabase: SupabaseClient,
): Promise<void> {
  // Update i18next immediately for UI
  await i18n.changeLanguage(lng);

  // Sync to Supabase user metadata
  const { error } = await supabase.auth.updateUser({
    data: { language: lng },
  });

  if (error) {
    console.warn("Failed to sync language to Supabase:", error);
  }
}
```

```typescript
// apps/expo/src/providers/auth.tsx (integration example)
import { initializeLanguageFromSession } from "~/i18n";

// In auth provider, after session is loaded:
useEffect(() => {
  if (session?.user) {
    initializeLanguageFromSession(session.user.user_metadata);
  }
}, [session]);
```

**Language Resolution Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│                   Language Resolution Flow                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  COLD START (no cached session):                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. App launches                                      │   │
│  │ 2. i18n.init() with getLocales()[0].languageCode    │   │
│  │ 3. User sees UI in device language                   │   │
│  │ 4. Auth session loads from Supabase                  │   │
│  │ 5. initializeLanguageFromSession(user_metadata)      │   │
│  │ 6. If user has preference → switch language          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  SUBSEQUENT RUNS (cached session):                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. App launches                                      │   │
│  │ 2. i18n.init() with device language (brief)         │   │
│  │ 3. Cached session loads instantly from SecureStore   │   │
│  │ 4. initializeLanguageFromSession(user_metadata)      │   │
│  │ 5. Language switches to user preference (fast)       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  USER CHANGES LANGUAGE:                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. User selects new language in settings             │   │
│  │ 2. changeLanguage(lng, supabase) called              │   │
│  │ 3. i18n updates immediately (UI re-renders)          │   │
│  │ 4. Supabase user_metadata.language updated           │   │
│  │ 5. Next session refresh has new preference           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Note**: This approach uses the existing Supabase session caching (via `expo-secure-store` in auth provider) rather than adding a separate AsyncStorage dependency for language alone.

### 11. Namespace Best Practices

| Namespace    | Purpose                             | Scope                      |
| ------------ | ----------------------------------- | -------------------------- |
| `common`     | Buttons, labels, errors, generic UI | Shared across all features |
| `auth`       | Login, signup, password reset       | Auth flows                 |
| `app`        | App-specific screens                | Main app screens           |
| `validation` | Form validation messages            | Forms                      |
| `errors`     | Error messages                      | Error handling             |

**Key guidelines:**

- Keep namespaces under ~300 keys
- Use dot notation for nested keys: `login.form.email.label`
- One namespace per feature/domain
- `common` for truly shared strings only

## Code References

- `packages/email/src/components/lang.tsx` - Existing translation utility pattern
- `packages/email/src/lib/render.tsx:9` - `SupportedLanguage` type definition
- `apps/expo/src/app/(auth)/login.tsx:68-93` - Hardcoded strings to replace
- `apps/expo/src/app/_layout.tsx` - Entry point for i18n import
- `apps/nextjs/src/app/api/auth/send-email/route.ts:116-124` - Language detection pattern

## Architecture Insights

1. **Synchronous Loading**: For React Native, bundle all translations (no async loading) for better performance and offline support.

2. **Package Boundary**: Each package (`auth-native`, `ui-native`) should export its own translations and a registration function.

3. **Override Priority**: Initialize app translations first, then call package `register*I18n()` functions - this ensures app translations take precedence.

4. **Type Safety**: Use TypeScript module augmentation to get autocomplete for translation keys.

5. **Existing Pattern**: The email package's `tr()` function shows the team already uses inline translation objects - the `useTranslation` hook follows a similar mental model.

## External Resources

- [react-i18next Quick Start](https://react.i18next.com/guides/quick-start)
- [react-i18next Multiple Translation Files](https://react.i18next.com/guides/multiple-translation-files)
- [i18next Namespaces](https://www.i18next.com/principles/namespaces)
- [i18next Add or Load Translations](https://www.i18next.com/how-to/add-or-load-translations)
- [i18next TypeScript](https://www.i18next.com/overview/typescript)
- [Expo Localization Guide](https://docs.expo.dev/guides/localization/)
- [expo-localization API](https://docs.expo.dev/versions/latest/sdk/localization/)
- [i18next-resources-to-backend](https://github.com/i18next/i18next-resources-to-backend)
- [GitHub: expo-next-translation-monorepo](https://github.com/hari1602/expo-next-translation-monorepo)

## Implementation Checklist

### Phase 1: Expo App i18n Setup

- [ ] Install dependencies: `expo-localization`, `i18next`, `react-i18next`
- [ ] Create `apps/expo/src/i18n/` directory structure
- [ ] Add `locales/en/common.json` and `locales/en/app.json`
- [ ] Add `locales/pl/common.json` and `locales/pl/app.json`
- [ ] Create `index.ts` with i18next configuration + Supabase sync
- [ ] Add `initializeLanguageFromSession()` function
- [ ] Add `changeLanguage()` with Supabase user_metadata sync
- [ ] Add TypeScript declarations (`types.d.ts`)
- [ ] Import i18n in `_layout.tsx`
- [ ] Integrate with auth provider for session-based language loading

### Phase 2: Auth-Native Package Translations

- [ ] Create `packages/auth-native/src/i18n/` structure
- [ ] Add `locales/en.json` with auth translations
- [ ] Add `locales/pl.json` with auth translations
- [ ] Create `locales/index.ts` exporting locales with types
- [ ] Create `index.ts` with `registerAuthI18n()` function
- [ ] Export `AUTH_NAMESPACE` constant
- [ ] Update auth components to use `useTranslation(AUTH_NAMESPACE)`
- [ ] Update `package.json` exports for `@tonik/auth-native/i18n`

### Phase 3: Email Package Migration

- [ ] Create `packages/email/src/i18n/` directory structure
- [ ] Extract translations from existing `lang.tsx` to `locales/en.json`
- [ ] Add `locales/pl.json` with Polish translations
- [ ] Create `locales/index.ts` exporting locales with types
- [ ] Create `index.ts` with `t()` helper and `createTranslator()`
- [ ] Update email templates to use `createTranslator(lang)`
- [ ] Update `render.tsx` to use new `t()` for subjects
- [ ] Remove old `packages/email/src/components/lang.tsx`

### Phase 4: UI & Polish

- [ ] Add language switcher UI component
- [ ] Add language setting to user profile/settings screen
- [ ] Test language persistence across app restarts
- [ ] Verify email language matches user preference
- [ ] Test package translation overrides from host app

## Decisions Made

1. **Language detection priority**:
   - **Decision**: On cold start, detect device language. On subsequent runs, load from cached user session (Supabase `user_metadata.language`). User preference stored in Supabase syncs across devices.

2. **RTL support**:
   - **Decision**: No RTL support needed unless mandatory for App Store distribution (it's not - only required if you specifically target RTL languages).

3. **Translation management**:
   - **Decision**: Solo developer - no need for external translation management tools. Git-managed JSON files are sufficient.

4. **Email translation migration**:
   - **Decision**: Migrate `packages/email` to use i18next-style approach. Each package has colocated translations - no shared i18n package.

5. **Translation colocation**:
   - **Decision**: All translations colocated within their respective packages. `packages/email` has its own `i18n/` directory, `packages/auth-native` has its own, etc.

## Follow-up: Email Package Migration Plan

Migrate `packages/email` to use colocated translations with a similar pattern to auth-native:

### Email Package i18n Structure

```
packages/email/
├── src/
│   ├── i18n/
│   │   ├── index.ts           # Translation helper + type exports
│   │   └── locales/
│   │       ├── en.json        # English email translations
│   │       ├── pl.json        # Polish email translations
│   │       └── index.ts       # Aggregates locales
│   ├── emails/
│   │   └── auth/
│   │       ├── magic-link.tsx
│   │       └── signup.tsx
│   └── lib/
│       └── render.tsx
```

### Implementation

```typescript
// packages/email/src/i18n/locales/en.json
{
  "magicLink": {
    "subject": "Your Daily Food Login Code",
    "preview": "Sign in to Daily Food",
    "heading": "Sign in to Daily Food",
    "body": "Click the button below to sign in to your account.",
    "button": "Sign In",
    "expiry": "This link expires in 1 hour.",
    "footer": "If you didn't request this email, you can safely ignore it."
  },
  "signup": {
    "subject": "Welcome to Daily Food",
    "preview": "Complete your registration",
    "heading": "Welcome to Daily Food!",
    "body": "Click the button below to confirm your email address.",
    "button": "Confirm Email",
    "expiry": "This link expires in 24 hours."
  },
  "common": {
    "greeting": "Hi {{name}},",
    "footer": "© {{year}} Daily Food. All rights reserved."
  }
}
```

```typescript
// packages/email/src/i18n/locales/index.ts
import en from "./en.json";
import pl from "./pl.json";

export const emailLocales = { en, pl } as const;
export type EmailTranslations = typeof en;
export type SupportedLanguage = keyof typeof emailLocales;
```

```typescript
import type { EmailTranslations, SupportedLanguage } from "./locales";
import { emailLocales } from "./locales";

// packages/email/src/i18n/index.ts

export { type SupportedLanguage, type EmailTranslations };
export { emailLocales };

/**
 * Get a translation value by dot-notation key
 * For server-side email rendering (no i18next instance needed)
 */
export function t(
  lang: SupportedLanguage,
  key: string,
  params?: Record<string, string | number>,
): string {
  const keys = key.split(".");
  let value: any = emailLocales[lang] ?? emailLocales["en"];

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      // Fallback to English
      value = emailLocales["en"];
      for (const fallbackKey of keys) {
        value = value?.[fallbackKey];
      }
      break;
    }
  }

  if (typeof value !== "string") return key;

  // Handle interpolation: {{name}} -> params.name
  if (params) {
    return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey) =>
      String(params[paramKey] ?? `{{${paramKey}}}`),
    );
  }

  return value;
}

/**
 * Create a translator function bound to a specific language
 */
export function createTranslator(lang: SupportedLanguage) {
  return (key: string, params?: Record<string, string | number>) =>
    t(lang, key, params);
}
```

```typescript
// packages/email/src/emails/auth/magic-link.tsx
import { Html, Head, Preview, Body, Text, Button } from '@react-email/components';
import { createTranslator, type SupportedLanguage } from '../../i18n';

interface MagicLinkEmailProps {
  url: string;
  lang: SupportedLanguage;
}

export const MagicLinkEmail = ({ url, lang }: MagicLinkEmailProps) => {
  const t = createTranslator(lang);

  return (
    <Html>
      <Head />
      <Preview>{t('magicLink.preview')}</Preview>
      <Body>
        <Text>{t('magicLink.heading')}</Text>
        <Text>{t('magicLink.body')}</Text>
        <Button href={url}>{t('magicLink.button')}</Button>
        <Text>{t('magicLink.expiry')}</Text>
        <Text>{t('common.footer', { year: new Date().getFullYear() })}</Text>
      </Body>
    </Html>
  );
};
```

```typescript
// packages/email/src/lib/render.tsx
import { render } from '@react-email/render';
import { t, type SupportedLanguage } from '../i18n';
import { MagicLinkEmail } from '../emails/auth/magic-link';

export { type SupportedLanguage };

interface RenderMagicLinkOptions {
  url: string;
  lang: SupportedLanguage;
}

export async function renderMagicLinkEmail({ url, lang }: RenderMagicLinkOptions) {
  const html = await render(<MagicLinkEmail url={url} lang={lang} />);
  const subject = t(lang, 'magicLink.subject');

  return { html, subject };
}
```

### Migration Steps

1. Create `packages/email/src/i18n/` directory structure
2. Extract existing inline translations from `lang.tsx` to JSON files
3. Create `t()` helper and `createTranslator()` factory
4. Update email templates to use new translation functions
5. Remove old `packages/email/src/components/lang.tsx`
6. Update `render.tsx` to use new `t()` for subjects
