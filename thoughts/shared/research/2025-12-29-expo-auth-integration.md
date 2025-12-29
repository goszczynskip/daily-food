---
date: 2025-12-29T10:59:25Z
researcher: AI Assistant
git_commit: 3cbac459e0a8d01e9474dcf766413e489cd7f076
branch: main
repository: daily-food
topic: "Adding Supabase Authentication to Expo App"
tags: [research, codebase, authentication, expo, supabase, mobile]
status: complete
last_updated: 2025-12-29
last_updated_by: AI Assistant
last_updated_note: "Added detailed implementation strategy based on user requirements for LocalAuth, social auth, offline support, and session management"
---

## Research Question

I'd like to add an auth to the expo app. It is setup in nextjs application only. It uses auth from supabase.

## Summary

The codebase has a comprehensive Supabase authentication system implemented for the NextJS application, but the Expo mobile app currently lacks any authentication integration. The auth system is well-architected with reusable components, schemas, and utilities that can be leveraged for mobile implementation. Key findings include a complete `@tonik/auth` package with compound UI components, tRPC integration, and middleware-based route protection. The Expo app uses Expo Router and React Navigation, making it straightforward to add auth integration points.

## Detailed Findings

### Current NextJS Authentication Implementation

#### Core Auth Package (`packages/auth/`)

- **Compound Component Pattern**: Login system with sub-components for different auth methods ([`packages/auth/src/recipes/login.tsx:56-531`](packages/auth/src/recipes/login.tsx))
- **Multiple Auth Methods**: Email/password, social OAuth (27+ providers), OTP email/phone, password reset flows ([`packages/auth/src/schemas.ts:59-73`](packages/auth/src/schemas.ts))
- **Reusable Schemas**: Zod validation schemas work cross-platform ([`packages/auth/src/schemas.ts:5-84`](packages/auth/src/schemas.ts))
- **Utility Functions**: Platform-agnostic helpers like `getClaims()` and `isAdmin()` ([`packages/auth/src/common.ts:11-13`](packages/auth/src/common.ts))

#### Middleware and Route Protection

- **Auth Middleware**: Next.js middleware factory for protected routes ([`packages/auth/src/middleware.ts:38-95`](packages/auth/src/middleware.ts))
- **Protected Path Validation**: Custom test functions for route access control ([`packages/auth/src/middleware.ts:47-73`](packages/auth/src/middleware.ts))
- **Cookie Synchronization**: Request/response cookie handling ([`packages/auth/src/middleware.ts:75-93`](packages/auth/src/middleware.ts))

#### tRPC Integration

- **Auth Router**: Complete API with login, signup, password reset, logout ([`packages/api/src/router/auth.ts:29-233`](packages/api/src/router/auth.ts))
- **Protected Procedures**: Auth guard for sensitive operations ([`packages/api/src/trpc.ts:132-144`](packages/api/src/trpc.ts))
- **Discriminated Union Types**: Type-safe auth request handling ([`packages/api/src/router/auth.ts:59-73`](packages/api/src/router/auth.ts))

### Current Expo App Structure

#### Navigation Setup

- **Expo Router**: File-based routing with Stack navigator ([`apps/expo/app/_layout.tsx`](apps/expo/app/_layout.tsx))
- **Tab Navigation**: Bottom tabs for Home and Explore ([`apps/expo/app/(tabs)/_layout.tsx`](<apps/expo/app/(tabs)/_layout.tsx>))
- **Modal Support**: Modal system for additional screens ([`apps/expo/app/modal.tsx`](apps/expo/app/modal.tsx))

#### Current Dependencies

- **Core Navigation**: `expo-router: "~6.0.21"` and `@react-navigation/*` packages
- **UI System**: Custom themed components with React Native styling ([`apps/expo/components/themed-view.tsx`](apps/expo/components/themed-view.tsx))
- **Theme Support**: Light/dark mode system with color scheme hooks ([`apps/expo/hooks/use-color-scheme.ts`](apps/expo/hooks/use-color-scheme.ts))

#### Auth Integration Points

- **Root Layout**: Ideal location for auth state provider and navigation guards ([`apps/expo/app/_layout.tsx`](apps/expo/app/_layout.tsx))
- **Tab Navigation**: Currently unprotected, needs auth requirements
- **Modal System**: Could host login/signup flows

### Supabase Configuration

#### Client Setup

- **Factory Pattern**: Platform-specific client factories ([`supabase/src/client.ts:10-14`](supabase/src/client.ts))
- **SSR Support**: Server client with cookie management ([`supabase/src/server.ts:15-40`](supabase/src/server.ts))
- **Middleware Client**: Next.js middleware integration ([`supabase/src/middleware.ts:12-46`](supabase/src/middleware.ts))

#### Auth Configuration

- **External Providers**: Discord, GitHub, Google pre-configured (currently disabled) ([`supabase/config.toml:123-170`](supabase/config.toml))
- **Email Templates**: Magic link and password reset templates ([`supabase/templates/magic_link.html`](supabase/templates/magic_link.html))
- **Environment Variables**: Complete auth env setup ([`.env.example:27-34`](.env.example))

#### Current Auth Flow

- **Email Auth**: Confirmation required, links to `/api/auth/confirm` ([`supabase/config.toml:91-96`](supabase/config.toml))
- **OAuth Callbacks**: Dynamic redirect URL handling ([`apps/nextjs/src/app/(main)/(auth)/api/auth/callback/route.ts:21-32`](<apps/nextjs/src/app/(main)/(auth)/api/auth/callback/route.ts>))

## Code References

### Authentication Core

- `packages/auth/src/recipes/login.tsx:56-531` - Complete login component system
- `packages/auth/src/schemas.ts:59-73` - Multi-method auth type definitions
- `packages/auth/src/middleware.ts:38-95` - Auth middleware factory
- `packages/api/src/router/auth.ts:29-233` - Complete tRPC auth router

### Supabase Integration

- `supabase/src/client.ts:10-14` - Browser client factory
- `supabase/src/middleware.ts:12-46` - Next.js middleware client
- `supabase/config.toml:70-171` - Auth configuration and providers

### Expo App Structure

- `apps/expo/app/_layout.tsx` - Root navigation with Stack navigator
- `apps/expo/app/(tabs)/_layout.tsx` - Tab navigation layout
- `apps/expo/package.json` - Current dependencies (missing Supabase)

### NextJS Integration Examples

- `apps/nextjs/src/middleware.ts:4-10` - Auth middleware configuration
- `apps/nextjs/src/app/(main)/(auth)/login/page.tsx:10-22` - Login page implementation
- `apps/nextjs/src/app/(main)/(auth)/api/auth/callback/route.ts:8-41` - OAuth callback handler

## Architecture Insights

### Reusable Patterns

- **Compound Component Pattern**: Auth UI components use React Context for flexible composition ([`packages/auth/src/recipes/login.tsx:45-54`](packages/auth/src/recipes/login.tsx))
- **Factory Pattern**: Client factories for different environments ([`supabase/src/*.ts`](supabase/src/))
- **Type Safety**: Full TypeScript integration with Zod schemas ([`packages/auth/src/schemas.ts`](packages/auth/src/schemas.ts))
- **Middleware Chain**: Auth validation in request pipeline ([`packages/auth/src/middleware.ts:42-95`](packages/auth/src/middleware.ts))

### Platform-Specific Considerations

- **NextJS Middleware**: Cannot be reused in Expo mobile app
- **HTML Forms**: Auth recipes use HTML elements, need React Native equivalents
- **Web Redirects**: OAuth flows need deep linking for mobile
- **Cookie Storage**: Mobile apps use different storage mechanisms

## Implementation Requirements

### Core Dependencies

- `@supabase/supabase-js` - Core Supabase client (currently missing from Expo app)
- `@tanstack/react-query` - Query caching (already used in NextJS, version 5.90.12)
- `@trpc/client` + `@trpc/react-query` - API integration (already used in NextJS)
- `@react-native-async-storage/async-storage` - General data persistence
- `expo-secure-store` - Secure token storage
- `@react-native-community/netinfo` - Network connectivity detection
- `expo-local-authentication` - Biometric authentication
- `expo-dev-client` - Development builds requirement

### Social Auth Dependencies

- `@invertase/react-native-apple-authentication` - Apple Sign-In for iOS
- `@react-native-google-signin/google-signin` - Google Sign-In for Android
- `expo-web-browser` - Already installed, perfect for OAuth flows

### Offline Support

- `@tanstack/react-query-persist-client-async-storage` - Query persistence
- Custom sync logic for mutation queuing and background data sync

### Deep Linking Configuration

- Configure OAuth redirect URLs in `apps/expo/app.json` with mobile scheme
- Set up deep linking handlers in Expo Router for auth callbacks
- Update `supabase/config.toml` with mobile redirect URLs
- Add Apple and Google provider configurations to Supabase

### Navigation Integration

- Add auth state provider to `apps/expo/app/_layout.tsx` root layout
- Implement navigation guards using Expo Router's `<Stack.Protected>` pattern
- Create auth screen hierarchy with existing modal system

### Component Adaptation

- Adapt `packages/auth/src/recipes/` components for React Native styling
- Replace HTML form elements with React Native TextInput and TouchableOpacity
- Convert Tailwind CSS to StyleSheet or React Native styling patterns
- Leverage existing `apps/expo/components/themed-*` components for consistency

## Implementation Requirements

### LocalAuth Integration

- **Development Build Required**: FaceID not supported in Expo Go ([Expo LocalAuth docs](https://docs.expo.dev/versions/latest/sdk/local-authentication))
- **Dependencies**: `expo-local-authentication`, `expo-secure-store` for token storage
- **Configuration**: Need `NSFaceIDUsageDescription` in iOS Info.plist and `eas.json` build profiles
- **Biometric Flow**: Store Supabase tokens securely, require biometrics for subsequent app access

### Social Authentication Requirements

- **Platform Preference**: Apple Sign-In for iOS, Google Sign-In for Android
- **In-App Browser**: Use `expo-web-browser` (already installed) for OAuth flows
- **Dependencies**:
  - `@invertase/react-native-apple-authentication` for Apple Sign-In
  - `@react-native-google-signin/google-signin` for Google Sign-In
- **Deep Linking**: Configure mobile redirect URLs in `apps/expo/app.json` and Supabase
- **Missing Apple Provider**: Currently no Apple provider configuration in `supabase/config.toml`

### Offline Support Architecture

- **TanStack Query**: Current NextJS app uses TanStack Query v5.90.12 with tRPC v11.8.0
- **Persistence Layer**: Add `@tanstack/react-query-persist-client-async-storage` for offline caching
- **Sync Strategy**: Use `@react-native-community/netinfo` for connectivity detection and background sync
- **Recipe Data**: Implement offline-first caching for recipes and user data

### Session Management Lifecycle

- **App State Detection**: Use React Native's `AppState.addEventListener('change')` for background/foreground events
- **Secure Storage**: `expo-secure-store` for auth tokens, AsyncStorage for session data
- **Session Restoration**: Validate tokens on app foreground, refresh via Supabase auto-refresh
- **Persistence**: Implement hybrid storage strategy combining secure and general storage

## Implementation Strategy

### 1. Development Build Setup

- Install `expo-dev-client` for development builds
- Create `eas.json` with development, preview, and production profiles
- Add `expo-local-authentication` plugin to `app.json` with FaceID permission
- Set up EAS CLI and configure build environment

### 2. Authentication Package Structure

- Extend existing `@tonik/auth` package with React Native UI components
- Reference `packages/auth/src/schemas.ts` for shared validation logic
- Create mobile-specific auth components using React Native styling
- Maintain shared hooks and utilities from `packages/auth/src/common.ts`

### 3. Social Provider Configuration

- **Google**: Already configured in `supabase/config.toml:163-165`, needs OAuth client setup
- **Apple**: Need to add Apple provider configuration in Supabase and Apple Developer Console
- **Redirect URLs**: Add mobile scheme (e.g., `dailyfood://`) to Supabase redirect configuration
- **Platform Detection**: Implement conditional rendering for iOS (Apple) vs Android (Google)

### 4. Offline-First Data Strategy

- **Query Client Setup**: Extend current TanStack Query configuration with AsyncStorage persistence
- **Cache Configuration**: Extended stale time (1 hour) and 24-hour garbage collection
- **Mutation Queuing**: Queue operations when offline, sync on reconnection
- **Conflict Resolution**: Implement optimistic updates with rollback strategies

### 5. Session Persistence Flow

```typescript
// Implementation pattern based on research
const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Restore session on app start
    restoreSession();

    // Handle app state changes
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, []);

  const handleAppStateChange = async (nextAppState) => {
    if (nextAppState === "active") {
      await validateAndRestoreSession();
    } else if (nextAppState === "background") {
      await persistSession();
    }
  };
};
```

## Testing Strategy

### Development Environment

- **Local Supabase**: Available at `http://127.0.0.1:54321` during `pnpm dev`
- **Email Testing**: Auth emails captured at `http://localhost:3000/_email` (mailpit)
- **Social Auth**: Use tunneling for OAuth testing during development
- **Biometric Testing**: Requires development build, cannot test in Expo Go

### E2E Testing Considerations

- **Current Gap**: No E2E testing setup exists in the codebase
- **Manual Testing**: Initial testing will be manual on physical devices
- **Future E2E**: Consider adding React Native testing framework for comprehensive coverage

## Production Deployment

### Build Strategy

- **CI Pipeline**: Expo builds prepared in CI, manually tested on devices before publishing
- **Environment Configuration**: Separate Supabase configs for development/production
- **OAuth Production**: Production OAuth client IDs and secrets configured in deployment
- **App Store**: Apple Sign-In mandatory for iOS App Store if using social auth

### Configuration Management

- **Environment Variables**: Leverage existing `.env.example` pattern with mobile-specific additions
- **Deep Linking**: Production app scheme registered with OAuth providers
- **Security**: Secure token storage and biometric protection in production builds

## Historical Context

No existing thoughts/ directory or research documents were found. This appears to be the first comprehensive analysis of adding authentication to the Expo mobile application. The current web authentication system serves as an excellent foundation with well-structured components and patterns that can be adapted for mobile use.

## Related Research

No related research documents exist in the codebase yet. This document serves as the baseline for mobile authentication implementation planning.
