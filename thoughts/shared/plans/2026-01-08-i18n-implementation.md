# Comprehensive i18n Implementation Plan for Daily Food Expo App

## Overview

Implement robust internationalization across the Daily Food Expo app, auth-native package, and email package using react-i18next with device language detection, Supabase language persistence, and package-level translation overrides.

## Current State Analysis

- **Expo app**: No i18n - hardcoded English strings in login/verify-OTP/main screens
- **Auth-native package**: No i18n - ~30 hardcoded strings in auth components
- **Email package**: Partial i18n using custom `tr()` function with inline translation objects
- **Missing dependencies**: expo-localization, i18next, react-i18next

### Key Files:

- `apps/expo/src/app/_layout.tsx` - Entry point for i18n import
- `apps/expo/src/app/(auth)/login.tsx` - Hardcoded strings to replace
- `packages/auth-native/src/recipes/login.tsx` - ~20 hardcoded strings
- `packages/auth-native/src/recipes/signup.tsx` - ~10 hardcoded strings
- `packages/auth-native/src/recipes/forgot-password.tsx` - ~5 hardcoded strings
- `packages/auth-native/src/recipes/reset-password.tsx` - ~5 hardcoded strings
- `packages/email/src/components/lang.tsx` - Current translation utility (to be replaced)
- `packages/email/src/emails/auth/magic-link.tsx` - Uses inline tr() calls
- `packages/email/src/emails/auth/signup.tsx` - Uses inline tr() calls

## Desired End State

- Complete i18n infrastructure with type-safe translations
- Device language detection with Supabase persistence
- Colocated translation files per package (en/pl)
- Package defaults with app override capability
- Email package migrated to consistent JSON-based translations

### Verification:

1. App detects device language on cold start
2. Language preference persists in Supabase `user_metadata.language`
3. All UI strings are translated (EN/PL)
4. Email content renders in user's preferred language
5. TypeScript provides autocomplete for translation keys

## What We're NOT Doing

- RTL language support (not required for App Store)
- External translation management tools (git-managed JSON files)
- Language switcher UI implementation (only infrastructure for future settings page)
- Adding languages beyond EN/PL in this implementation

---

## Phase 1: Core i18n Infrastructure (Expo App)

### Overview

Set up the foundational i18n infrastructure in the Expo app including dependencies, configuration, and language utilities.

### Changes Required:

#### 1. Install Dependencies

**File**: `apps/expo/package.json`

```bash
cd apps/expo
npx expo install expo-localization
npm install react-i18next i18next --save
```

#### 2. Create i18n Configuration

**File**: `apps/expo/src/i18n/index.ts`

```typescript
import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { registerAuthI18n } from "@tonik/auth-native/i18n";

import enApp from "./locales/en/app.json";
import enCommon from "./locales/en/common.json";
import plApp from "./locales/pl/app.json";
import plCommon from "./locales/pl/common.json";

const resources = {
  en: {
    common: enCommon,
    app: enApp,
  },
  pl: {
    common: plCommon,
    app: plApp,
  },
};

export const SUPPORTED_LANGUAGES = ["en", "pl"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

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
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: "v4",
  react: {
    useSuspense: false,
  },
});

// Register auth package translations AFTER init
registerAuthI18n(i18n);

export default i18n;

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
}

export async function changeLanguage(
  lng: SupportedLanguage,
  supabase: any,
): Promise<void> {
  await i18n.changeLanguage(lng);
  const { error } = await supabase.auth.updateUser({
    data: { language: lng },
  });
  if (error) {
    console.warn("Failed to sync language to Supabase:", error);
  }
}
```

#### 3. TypeScript Declarations

**File**: `apps/expo/src/@types/i18next.d.ts`

```typescript
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

#### 4. Translation Files

**File**: `apps/expo/src/i18n/locales/en/common.json`

```json
{
  "welcome": "Welcome",
  "signInToContinue": "Sign in to continue",
  "somethingWentWrong": "Something went wrong",
  "pleaseTryAgain": "Please try again",
  "or": "or",
  "languages": {
    "english": "English",
    "polish": "Polish"
  }
}
```

**File**: `apps/expo/src/i18n/locales/en/app.json`

```json
{
  "helloUser": "Hello {{name}}",
  "logOut": "Log Out",
  "loginViaEmail": "Login via email",
  "verifyCode": "Verify code"
}
```

**File**: `apps/expo/src/i18n/locales/pl/common.json`

```json
{
  "welcome": "Witaj",
  "signInToContinue": "Zaloguj się, aby kontynuować",
  "somethingWentWrong": "Coś poszło nie tak",
  "pleaseTryAgain": "Spróbuj ponownie",
  "or": "lub",
  "languages": {
    "english": "Angielski",
    "polish": "Polski"
  }
}
```

**File**: `apps/expo/src/i18n/locales/pl/app.json`

```json
{
  "helloUser": "Witaj {{name}}",
  "logOut": "Wyloguj się",
  "loginViaEmail": "Zaloguj przez email",
  "verifyCode": "Zweryfikuj kod"
}
```

#### 5. Update tsconfig.json

**File**: `apps/expo/tsconfig.json`

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "resolveJsonModule": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts",
    "nativewind-env.d.ts",
    "src/@types/**/*.ts"
  ]
}
```

#### 6. Update Entry Point

**File**: `apps/expo/src/app/_layout.tsx`

Add import at the very top of the file:

```typescript
import "../i18n"; // Import i18n configuration FIRST
```

Add language initialization in `RootLayoutNav`:

```typescript
import { useEffect } from "react";
import { initializeLanguageFromSession } from "@/src/i18n";

function RootLayoutNav() {
  const colorScheme = useColorScheme() ?? "light";
  const authState = useAuthStore((s) => s.state);
  const user = useAuthStore((s) => s.user);

  // Initialize language from auth session
  useEffect(() => {
    if (authState === "authenticated" && user?.user_metadata) {
      initializeLanguageFromSession(user.user_metadata);
    }
  }, [authState, user?.user_metadata]);

  // ... rest of component
}
```

### Success Criteria:

#### Automated Verification:

- [x] Dependencies install: `cd apps/expo && npm install`
- [x] TypeScript passes: `cd apps/expo && npm run typecheck`
- [x] Linting passes: `cd apps/expo && npm run lint` (pre-existing monorepo resolution errors only)

#### Manual Verification:

- [ ] App starts without errors
- [ ] Console shows i18n initialized with device language

---

## Phase 2: Auth-Native Package Translations

### Overview

Add translation support to the auth-native package with a registration function that allows the host app to override defaults.

### Changes Required:

#### 1. Create i18n Structure

**File**: `packages/auth-native/src/i18n/locales/en.json`

```json
{
  "login": {
    "emailLabel": "Email",
    "emailPlaceholder": "m@example.com",
    "passwordLabel": "Password",
    "passwordPlaceholder": "Type in your password...",
    "submitButton": "Sign in",
    "continueWithGoogle": "Continue with Google",
    "continueWithApple": "Continue with Apple",
    "or": "or",
    "otpPrompt": "Enter the {{length}}-digit code we sent to your email",
    "pleaseTryAgain": "Please try again",
    "errors": {
      "invalidEmail": "Invalid email",
      "passwordRequired": "Password is required",
      "credentialsRevoked": "User credentials are revoked",
      "tokenNotFound": "Not found a user token",
      "identityTokenFailed": "Failed to obtain identityToken",
      "unsupportedAuthState": "Unsupported auth state",
      "codeLength": "Code must be {{length}} digits"
    }
  },
  "signup": {
    "emailLabel": "Email",
    "emailPlaceholder": "m@example.com",
    "passwordLabel": "Password",
    "passwordPlaceholder": "Type in your password...",
    "submitButton": "Create account",
    "continueWithGoogle": "Continue with Google",
    "continueWithApple": "Continue with Apple",
    "or": "or",
    "pleaseTryAgain": "Please try again",
    "errors": {
      "invalidEmail": "Invalid email",
      "passwordRequired": "Password is required"
    }
  },
  "forgotPassword": {
    "emailLabel": "Email",
    "emailPlaceholder": "m@example.com",
    "submitButton": "Send reset link"
  },
  "resetPassword": {
    "passwordLabel": "New Password",
    "passwordPlaceholder": "Type in your new password...",
    "submitButton": "Reset password"
  }
}
```

**File**: `packages/auth-native/src/i18n/locales/pl.json`

```json
{
  "login": {
    "emailLabel": "Email",
    "emailPlaceholder": "m@example.com",
    "passwordLabel": "Hasło",
    "passwordPlaceholder": "Wpisz swoje hasło...",
    "submitButton": "Zaloguj się",
    "continueWithGoogle": "Kontynuuj z Google",
    "continueWithApple": "Kontynuuj z Apple",
    "or": "lub",
    "otpPrompt": "Wpisz {{length}}-cyfrowy kod wysłany na Twój email",
    "pleaseTryAgain": "Spróbuj ponownie",
    "errors": {
      "invalidEmail": "Nieprawidłowy email",
      "passwordRequired": "Hasło jest wymagane",
      "credentialsRevoked": "Dane uwierzytelniające zostały odwołane",
      "tokenNotFound": "Nie znaleziono tokenu użytkownika",
      "identityTokenFailed": "Nie udało się uzyskać identityToken",
      "unsupportedAuthState": "Nieobsługiwany stan uwierzytelniania",
      "codeLength": "Kod musi mieć {{length}} cyfr"
    }
  },
  "signup": {
    "emailLabel": "Email",
    "emailPlaceholder": "m@example.com",
    "passwordLabel": "Hasło",
    "passwordPlaceholder": "Wpisz swoje hasło...",
    "submitButton": "Utwórz konto",
    "continueWithGoogle": "Kontynuuj z Google",
    "continueWithApple": "Kontynuuj z Apple",
    "or": "lub",
    "pleaseTryAgain": "Spróbuj ponownie",
    "errors": {
      "invalidEmail": "Nieprawidłowy email",
      "passwordRequired": "Hasło jest wymagane"
    }
  },
  "forgotPassword": {
    "emailLabel": "Email",
    "emailPlaceholder": "m@example.com",
    "submitButton": "Wyślij link resetujący"
  },
  "resetPassword": {
    "passwordLabel": "Nowe hasło",
    "passwordPlaceholder": "Wpisz swoje nowe hasło...",
    "submitButton": "Resetuj hasło"
  }
}
```

**File**: `packages/auth-native/src/i18n/locales/index.ts`

```typescript
import en from "./en.json";
import pl from "./pl.json";

export const authLocales = { en, pl } as const;
export type AuthTranslationKeys = typeof en;
```

**File**: `packages/auth-native/src/i18n/index.ts`

```typescript
import type { i18n } from "i18next";

import type { AuthTranslationKeys } from "./locales";
import { authLocales } from "./locales";

export const AUTH_NAMESPACE = "auth";

export interface RegisterAuthI18nOptions {
  overrides?: Partial<Record<string, Partial<AuthTranslationKeys>>>;
  overwriteExisting?: boolean;
}

export function registerAuthI18n(
  i18nInstance: i18n,
  options: RegisterAuthI18nOptions = {},
) {
  const { overrides = {}, overwriteExisting = false } = options;

  for (const [lng, translations] of Object.entries(authLocales)) {
    i18nInstance.addResourceBundle(
      lng,
      AUTH_NAMESPACE,
      translations,
      true,
      overwriteExisting,
    );
  }

  for (const [lng, overrideTranslations] of Object.entries(overrides)) {
    if (overrideTranslations) {
      i18nInstance.addResourceBundle(
        lng,
        AUTH_NAMESPACE,
        overrideTranslations,
        true,
        true,
      );
    }
  }
}

export { authLocales, type AuthTranslationKeys };
```

#### 2. Update Package Exports

**File**: `packages/auth-native/package.json`

Add new export:

```json
{
  "exports": {
    ".": {
      "types": "./dist/src/index.d.ts",
      "default": "./src/index.ts"
    },
    "./recipes/*": {
      "types": "./dist/src/recipes/*.d.ts",
      "default": "./src/recipes/*.tsx"
    },
    "./i18n": {
      "types": "./dist/src/i18n/index.d.ts",
      "default": "./src/i18n/index.ts"
    }
  }
}
```

#### 3. Update Login Recipe

**File**: `packages/auth-native/src/recipes/login.tsx`

Add imports:

```typescript
import { useTranslation } from "react-i18next";

import { AUTH_NAMESPACE } from "../i18n";
```

Update `LoginSocialGoogle`:

```typescript
const LoginSocialGoogle = ({ onPress }: { onPress?: () => void }) => {
  const { isPending } = useLoginContext();
  const { t } = useTranslation(AUTH_NAMESPACE);
  return (
    <Button
      size="lg"
      variant="outline"
      className="w-full"
      onPress={onPress}
      disabled={isPending}
    >
      {t("login.continueWithGoogle")}
    </Button>
  );
};
```

Update `LoginSocialApple` error messages:

```typescript
const LoginSocialApple = ({ ... }) => {
  const { mutate, setLocalError } = useLoginContext();
  const { t } = useTranslation(AUTH_NAMESPACE);

  // Replace hardcoded error messages:
  // "User credentials are revoked" -> t("login.errors.credentialsRevoked")
  // "Not found a user token" -> t("login.errors.tokenNotFound")
  // "Failed to obtain identityToken" -> t("login.errors.identityTokenFailed")
  // "Unsupported auth state" -> t("login.errors.unsupportedAuthState")
};
```

Update `LoginSectionSplitter`:

```typescript
const LoginSectionSplitter = () => {
  const { t } = useTranslation(AUTH_NAMESPACE);
  return (
    <View className="my-6 flex-row items-center">
      <Separator className="flex-1" />
      <Text className="text-muted-foreground px-4">{t("login.or")}</Text>
      <Separator className="flex-1" />
    </View>
  );
};
```

Update `LoginErrorMessage`:

```typescript
const LoginErrorMessage = () => {
  const { error } = useLoginContext();
  const { t } = useTranslation(AUTH_NAMESPACE);
  if (!error?.message) return null;

  return (
    <View className="bg-destructive/30 border-destructive mb-4 rounded-md border px-4 py-2">
      <Text className="text-destructive-foreground text-start text-sm">
        {error.message}
        <Text className="text-muted-foreground block text-xs">
          {t("login.pleaseTryAgain")}
        </Text>
      </Text>
    </View>
  );
};
```

Update `LoginUsernamePasswordFields`:

```typescript
const LoginUsernamePasswordFields = ({ forgotPasswordLink }) => {
  const form = useFormContext<LoginUsernamePasswordData>();
  const { t } = useTranslation(AUTH_NAMESPACE);

  return (
    <>
      <FormField
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <FormItem>
            <View className="flex w-full items-center">
              <FormLabel className="block">{t("login.emailLabel")}</FormLabel>
              {/* ... */}
            </View>
            <Input placeholder={t("login.emailPlaceholder")} {/* ... */} />
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>{t("login.passwordLabel")}</FormLabel>
            <Input placeholder={t("login.passwordPlaceholder")} {/* ... */} />
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
```

Update `LoginOtpEmailFields`:

```typescript
const LoginOtpEmailFields = () => {
  const form = useFormContext<LoginOtpEmailData>();
  const { t } = useTranslation(AUTH_NAMESPACE);

  return (
    <FormField
      control={form.control}
      name="email"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{t("login.emailLabel")}</FormLabel>
          <Input placeholder={t("login.emailPlaceholder")} {/* ... */} />
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
```

Update `LoginOtpVerifyFields`:

```typescript
const LoginOtpVerifyFields = () => {
  const { length } = useLoginOtpVerifyContext();
  const { t } = useTranslation(AUTH_NAMESPACE);
  // ...

  return (
    <View className="gap-4">
      <Text className="text-muted-foreground text-center">
        {t("login.otpPrompt", { length })}
      </Text>
      {/* ... */}
    </View>
  );
};
```

Update `LoginButton`:

```typescript
const LoginButton = ({ type: extType, children, className }) => {
  const { t } = useTranslation(AUTH_NAMESPACE);
  // ...
  return (
    <Button {/* ... */}>
      {children ?? t("login.submitButton")}
    </Button>
  );
};
```

#### 4. Update Zod Schemas with Translations

Create a hook for localized schemas in each recipe file:

```typescript
const useLocalizedLoginSchema = () => {
  const { t } = useTranslation(AUTH_NAMESPACE);

  return useMemo(
    () => ({
      usernamePassword: z.object({
        type: z.literal("email"),
        email: z.email({ message: t("login.errors.invalidEmail") }),
        password: z
          .string()
          .min(1, { message: t("login.errors.passwordRequired") }),
        captchaToken: z.string().optional(),
      }),
      otpEmail: z.object({
        type: z.literal("otp-email"),
        email: z.email({ message: t("login.errors.invalidEmail") }),
        captchaToken: z.string().optional(),
      }),
    }),
    [t],
  );
};
```

Then use in components:

```typescript
const LoginUsernamePassword = ({ children }) => {
  const schemas = useLocalizedLoginSchema();
  const form = useForm({
    schema: schemas.usernamePassword,
    // ...
  });
  // ...
};
```

#### 5. Update Other Recipe Files

Apply the same pattern to:

- `packages/auth-native/src/recipes/signup.tsx`
- `packages/auth-native/src/recipes/forgot-password.tsx`
- `packages/auth-native/src/recipes/reset-password.tsx`

Replace all hardcoded strings with `t()` calls using the translation keys from the JSON files.

### Success Criteria:

#### Automated Verification:

- [ ] Package builds: `cd packages/auth-native && npm run build`
- [ ] TypeScript passes: `cd packages/auth-native && npm run typecheck`
- [ ] Linting passes: `cd packages/auth-native && npm run lint`

#### Manual Verification:

- [ ] Login form shows translated labels and placeholders
- [ ] Error messages appear in correct language
- [ ] Button text is translated
- [ ] Validation errors show in correct language

---

## Phase 3: Email Package Migration

### Overview

Migrate the email package from inline translation objects with `tr()` to JSON-based translations with a consistent API.

### Changes Required:

#### 1. Create i18n Structure

**File**: `packages/email/src/i18n/locales/en.json`

```json
{
  "magicLink": {
    "subject": "Your Daily Food Login Code",
    "preview": "Your Daily Food login code",
    "heading": "Sign in to Daily Food",
    "body": "Enter this code on the sign-in screen to access your account.",
    "expiry": "This code will expire in 1 hour.",
    "footer": "If you didn't request this code, you can safely ignore this email.",
    "signOff": "Happy planning!"
  },
  "signup": {
    "subject": "Confirm Your Daily Food Signup",
    "preview": "Confirm your Daily Food account",
    "heading": "Welcome to Daily Food!",
    "body": "Thanks for signing up with {{email}}. Enter this confirmation code to activate your account.",
    "expiry": "This code will expire in 1 hour.",
    "footer": "If you didn't create an account with Daily Food, you can safely ignore this email.",
    "signOff": "Happy planning!"
  },
  "recovery": {
    "subject": "Reset Your Password"
  },
  "emailChange": {
    "subject": "Confirm Your Email Change"
  }
}
```

**File**: `packages/email/src/i18n/locales/pl.json`

```json
{
  "magicLink": {
    "subject": "Twój kod logowania do Daily Food",
    "preview": "Twój kod do Daily Food",
    "heading": "Dokończ logowanie",
    "body": "Wpisz jednorazowy kod weryfikacyjny w aplikacji Daily Food.",
    "expiry": "Ten kod wygaśnie za 1 godzinę.",
    "footer": "To nie ty się logujesz? Możesz bezpiecznie zignorować tę wiadomość.",
    "signOff": "Udanego planowania!"
  },
  "signup": {
    "subject": "Potwierdź rejestrację w Daily Food",
    "preview": "Potwierdź swoje konto w Daily Food",
    "heading": "Witamy w Daily Food!",
    "body": "Dziękujemy za rejestrację z {{email}}. Wpisz ten kod, aby aktywować swoje konto.",
    "expiry": "Ten kod wygaśnie za 1 godzinę.",
    "footer": "To nie ty zakładałeś konta? Możesz bezpiecznie zignorować tę wiadomość.",
    "signOff": "Udanego planowania!"
  },
  "recovery": {
    "subject": "Zresetuj swoje hasło"
  },
  "emailChange": {
    "subject": "Potwierdź zmianę adresu email"
  }
}
```

**File**: `packages/email/src/i18n/locales/index.ts`

```typescript
import en from "./en.json";
import pl from "./pl.json";

export const emailLocales = { en, pl } as const;
export type EmailTranslations = typeof en;
export type SupportedLanguage = keyof typeof emailLocales;
```

**File**: `packages/email/src/i18n/index.ts`

```typescript
import type { EmailTranslations, SupportedLanguage } from "./locales";
import { emailLocales } from "./locales";

export { type SupportedLanguage, type EmailTranslations };
export { emailLocales };

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
      value = emailLocales["en"];
      for (const fallbackKey of keys) {
        value = value?.[fallbackKey];
      }
      break;
    }
  }

  if (typeof value !== "string") return key;

  if (params) {
    return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey) =>
      String(params[paramKey] ?? `{{${paramKey}}}`),
    );
  }

  return value;
}

export function createTranslator(lang: SupportedLanguage) {
  return (key: string, params?: Record<string, string | number>) =>
    t(lang, key, params);
}
```

#### 2. Update Magic Link Email

**File**: `packages/email/src/emails/auth/magic-link.tsx`

```typescript
import * as React from "react";
import {
  Body,
  Container,
  Head,
  Html,
  pixelBasedPreset,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import type { MagicLinkEmailProps } from "../../types";
import { createTranslator } from "../../i18n";
import { Logo } from "../../components/logo";

export const MagicLinkEmail = ({
  token = "{{ .Token }}",
  siteUrl = "{{ .SiteURL }}",
  lang,
}: MagicLinkEmailProps) => {
  const t = createTranslator(lang);

  return (
    <Html lang={lang}>
      <Head />
      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Preview>{t("magicLink.preview")}</Preview>
          <Container className="mx-auto my-10 max-w-lg">
            <Logo className="mx-auto mb-10" siteUrl={siteUrl} />

            <Text className="mb-8 text-center text-xl font-semibold">
              {t("magicLink.heading")}
            </Text>

            <Text className="mb-8 text-center">
              {t("magicLink.body")}
            </Text>

            <Container className="mb-8">
              <Section className="rounded-lg bg-[rgba(0,0,0,0.1)] text-center">
                <Text className="text-3xl font-semibold tracking-wider">
                  {token}
                </Text>
              </Section>

              <Text className="mb-0 text-center font-semibold">
                {t("magicLink.expiry")}
              </Text>
            </Container>

            <Text className="text-center">
              {t("magicLink.footer")}
            </Text>

            <Section className="text-center">
              <Text>
                {t("magicLink.signOff")}
                <br />
                Daily Food
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

MagicLinkEmail.PreviewProps = {
  token: "123456",
  _email: "user@example.com",
  siteUrl: "http://localhost:3000",
  lang: "en",
} as MagicLinkEmailProps;

export default MagicLinkEmail;
```

#### 3. Update Signup Email

**File**: `packages/email/src/emails/auth/signup.tsx`

Apply same pattern as magic-link.tsx, using:

- `t("signup.preview")`
- `t("signup.heading")`
- `t("signup.body", { email })`
- `t("signup.expiry")`
- `t("signup.footer")`
- `t("signup.signOff")`

#### 4. Update Render Functions

**File**: `packages/email/src/lib/render.tsx`

```typescript
import * as React from "react";
import { render } from "@react-email/components";

import { MagicLinkEmail } from "../emails/auth/magic-link";
import { SignupEmail } from "../emails/auth/signup";
import { t, type SupportedLanguage } from "../i18n";

export type EmailType = "magic_link" | "signup" | "recovery" | "email_change";

export type { SupportedLanguage };

export interface RenderMagicLinkEmailOptions {
  token: string;
  siteUrl: string;
  lang: SupportedLanguage;
}

export interface RenderSignupEmailOptions {
  token: string;
  siteUrl: string;
  email: string;
  lang: SupportedLanguage;
}

export async function renderMagicLinkEmail(
  options: RenderMagicLinkEmailOptions,
): Promise<{ html: string; subject: string }> {
  const { token, siteUrl, lang } = options;

  const html = await render(
    <MagicLinkEmail token={token} siteUrl={siteUrl} lang={lang} />,
  );

  return {
    html,
    subject: t(lang, "magicLink.subject"),
  };
}

export async function renderSignupEmail(
  options: RenderSignupEmailOptions,
): Promise<{ html: string; subject: string }> {
  const { token, siteUrl, email, lang } = options;

  const html = await render(
    <SignupEmail token={token} siteUrl={siteUrl} email={email} lang={lang} />,
  );

  return {
    html,
    subject: t(lang, "signup.subject"),
  };
}

export function getEmailSubject(
  emailType: EmailType,
  lang: SupportedLanguage,
): string {
  const keyMap: Record<EmailType, string> = {
    magic_link: "magicLink.subject",
    signup: "signup.subject",
    recovery: "recovery.subject",
    email_change: "emailChange.subject",
  };
  return t(lang, keyMap[emailType]);
}
```

#### 5. Update Package Exports

**File**: `packages/email/src/index.ts`

Remove old exports and add new ones:

```typescript
// Remove:
// export { tr } from "./components/lang";

// Add:
export {
  t,
  createTranslator,
  type SupportedLanguage,
  type EmailTranslations,
} from "./i18n";
export {
  renderMagicLinkEmail,
  renderSignupEmail,
  getEmailSubject,
  type EmailType,
  type RenderMagicLinkEmailOptions,
  type RenderSignupEmailOptions,
} from "./lib/render";
```

#### 6. Delete Old Translation File

**File**: `packages/email/src/components/lang.tsx`

Delete this file entirely. It is replaced by `packages/email/src/i18n/index.ts`.

### Success Criteria:

#### Automated Verification:

- [ ] Package builds: `cd packages/email && npm run build`
- [ ] TypeScript passes: `cd packages/email && npm run typecheck`
- [ ] Linting passes: `cd packages/email && npm run lint`

#### Manual Verification:

- [ ] Magic link email renders correctly in English
- [ ] Magic link email renders correctly in Polish
- [ ] Signup email renders correctly in both languages
- [ ] Email subjects are correctly translated

---

## Phase 4: Expo App Screen Translations

### Overview

Update all Expo app screens to use the translation hooks.

### Changes Required:

#### 1. Update Login Screen

**File**: `apps/expo/src/app/(auth)/login.tsx`

```typescript
import { View } from "react-native";
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
  withTiming,
  Easing
} from "react-native-reanimated";
import { Redirect } from "expo-router";
import { api } from "@/src/trpc/react";
import { useTranslation } from "react-i18next";

import { useAuthStore } from "@tonik/auth-native";
import {
  Login,
  LoginButton,
  LoginContent,
  LoginErrorMessage,
  LoginOtpEmail,
  LoginOtpEmailFields,
  LoginSectionSplitter,
  LoginSocial,
  LoginSocialApple,
  LoginSocialGoogle,
  LoginSuccess,
} from "@tonik/auth-native/recipes/login";
import { Text } from "@tonik/ui-native";

export default function LoginScreen() {
  const loginMutation = api.auth.login.useMutation();
  const isAuthenticated = useAuthStore((s) => s.state === "authenticated");
  const { t } = useTranslation(["common", "app"]);

  const keyboard = useAnimatedKeyboard();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      flex: 1,
      justifyContent: "center",
      transform: [
        {
          translateY: withTiming(-keyboard.height.value / 3, {
            easing: Easing.linear,
            duration: 100
          }),
        },
      ],
    };
  });

  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  const encodedEmail =
    loginMutation.variables?.type === "otp-email"
      ? encodeURIComponent(loginMutation.variables.email)
      : null;

  return (
    <Login
      mutate={loginMutation.mutate}
      isPending={loginMutation.isPending}
      error={loginMutation.error}
      isSuccess={loginMutation.isSuccess}
      variables={loginMutation.variables}
    >
      <Animated.View style={animatedStyle}>
        <LoginContent hideOnSuccess="otp-email">
          <Text className="mb-2 text-center text-3xl font-bold">
            {t("common:welcome")}
          </Text>
          <Text className="text-muted-foreground mb-8 text-center">
            {t("common:signInToContinue")}
          </Text>

          <LoginSocial>
            <LoginSocialApple />
            <LoginSocialGoogle onPress={() => console.log("google")} />
          </LoginSocial>

          <LoginSectionSplitter />

          <LoginOtpEmail>
            <LoginOtpEmailFields />
            <LoginButton type="otp-email">{t("app:loginViaEmail")}</LoginButton>
          </LoginOtpEmail>

          <LoginErrorMessage />
        </LoginContent>

        <LoginSuccess type="otp-email">
          {encodedEmail ? (
            <Redirect href={`/(auth)/verify-otp/${encodedEmail}`} />
          ) : (
            <View>
              <Text>{t("common:somethingWentWrong")}</Text>
            </View>
          )}
        </LoginSuccess>
      </Animated.View>
    </Login>
  );
}
```

#### 2. Update OTP Verification Screen

**File**: `apps/expo/src/app/(auth)/verify-otp/[email].tsx`

```typescript
import { Text, View } from "react-native";
import { Redirect, useLocalSearchParams } from "expo-router";
import { api } from "@/src/trpc/react";
import { useTranslation } from "react-i18next";

import {
  Login,
  LoginButton,
  LoginContent,
  LoginErrorMessage,
  LoginOtpVerify,
  LoginOtpVerifyFields,
  LoginSuccess,
} from "@tonik/auth-native/recipes/login";

function VerifyOTPPage() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const loginMutation = api.auth.login.useMutation();
  const { t } = useTranslation(["common", "app"]);

  return (
    <Login
      mutate={loginMutation.mutate}
      isPending={loginMutation.isPending}
      error={loginMutation.error}
      isSuccess={loginMutation.isSuccess}
      variables={loginMutation.variables}
    >
      <View className="flex-1 justify-center">
        <LoginContent>
          <Text className="mb-2 text-center text-3xl font-bold">
            {t("common:welcome")}
          </Text>
          <Text className="text-muted-foreground mb-8 text-center">
            {t("common:signInToContinue")}
          </Text>

          <LoginOtpVerify email={email}>
            <LoginOtpVerifyFields />
            <LoginButton type="otp-verify">{t("app:verifyCode")}</LoginButton>
          </LoginOtpVerify>

          <LoginErrorMessage />
        </LoginContent>

        <LoginSuccess type="otp-verify">
          <Redirect href={`/(app)`} />
        </LoginSuccess>
      </View>
    </Login>
  );
}

export default VerifyOTPPage;
```

#### 3. Update Main App Screen

**File**: `apps/expo/src/app/(app)/index.tsx`

```typescript
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useAuthStore } from "@tonik/auth-native";

export default function Index() {
  const { logout, user } = useAuthStore();
  const { t } = useTranslation("app");

  return (
    <View className="flex items-center justify-center">
      <Text>
        {t("helloUser", { name: user?.email ?? "anon" })}
      </Text>
      <Text
        onPress={() => {
          logout();
        }}
      >
        {t("logOut")}
      </Text>
    </View>
  );
}
```

### Success Criteria:

#### Automated Verification:

- [ ] TypeScript passes: `cd apps/expo && npm run typecheck`
- [ ] Linting passes: `cd apps/expo && npm run lint`
- [ ] App builds: `cd apps/expo && npx expo export`

#### Manual Verification:

- [ ] Login screen shows translated text
- [ ] OTP verification screen shows translated text
- [ ] Main app screen shows translated greeting
- [ ] All screens work correctly in both EN and PL

---

## Testing Strategy

### Unit Tests:

- Test i18n configuration initialization
- Test `changeLanguage` function
- Test `initializeLanguageFromSession` function
- Test translation fallback behavior
- Test `registerAuthI18n` function
- Test email `t()` helper with interpolation

### Integration Tests:

- Test language persistence through Supabase session
- Test device language detection on cold start
- Test email rendering with different languages
- Test app-level translation overrides of package defaults

### Manual Testing Steps:

1. **Device Language Detection**:
   - Set device language to Polish
   - Clear app data/reinstall
   - Launch app
   - Verify UI appears in Polish

2. **Language Persistence**:
   - Log in as user
   - Call `changeLanguage("pl", supabase)`
   - Kill app completely
   - Relaunch app
   - Verify language is still Polish

3. **Email Translations**:
   - Set user language to English
   - Trigger magic link email
   - Verify email is in English
   - Change to Polish
   - Trigger magic link email
   - Verify email is in Polish

4. **Auth Component Translations**:
   - Navigate to login screen
   - Verify all labels, placeholders, buttons are translated
   - Trigger validation errors
   - Verify error messages are translated
   - Test social login error messages

---

## Performance Considerations

- All translations bundled synchronously (no async loading)
- Total bundle size increase: ~10KB for all translation files
- No network calls for translations (offline support)
- Fast language switching via in-memory i18next cache

---

## Migration Notes

### Breaking Changes in Email Package:

- `tr()` function removed, use `createTranslator(lang)` instead
- Import path changed: `import { createTranslator } from "@tonik/email/i18n"`

### Breaking Changes in Auth-Native Package:

- Components now depend on i18next being initialized
- Must call `registerAuthI18n(i18n)` after `i18n.init()`

### Expo App Changes:

- i18n import MUST be first import in `_layout.tsx`
- Auth provider integration required for language sync

---

## References

- Original research: `thoughts/shared/research/2026-01-08-expo-i18n-react-i18next.md`
- react-i18next docs: https://react.i18next.com/
- expo-localization docs: https://docs.expo.dev/versions/latest/sdk/localization/

---

## Success Criteria Summary

### Automated Verification:

- [ ] All dependencies install: `npm install` in each package
- [ ] TypeScript passes in all packages
- [ ] Linting passes in all packages
- [ ] Expo app starts without errors
- [ ] Email package builds successfully
- [ ] Auth-native package builds successfully

### Manual Verification:

- [ ] Device language detection works on cold start
- [ ] Language persists across app restarts via Supabase
- [ ] All auth components show translated strings (EN/PL)
- [ ] All app screens show translated strings (EN/PL)
- [ ] Email content renders correctly in both languages
- [ ] Validation errors appear in correct language
- [ ] No regressions in auth flow functionality
- [ ] No regressions in email sending functionality
