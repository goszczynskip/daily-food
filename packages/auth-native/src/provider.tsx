import type { SupabaseClient } from "@supabase/supabase-js";
import * as React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AppState, Platform } from "react-native";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import { createClient } from "@supabase/supabase-js";

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
    [onAuthStateChange],
  );

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      updateState({
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, updateState]);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        if (nextAppState === "active") {
          // Refresh session when app becomes active
          await supabase.auth.getSession();
        }
      },
    );

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
          message:
            error instanceof Error
              ? error.message
              : "Failed to send magic link",
        };
      }
    },
    [supabase],
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
      const {
        data: { session },
        error,
      } = await supabase.auth.refreshSession();
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
    [
      state,
      signInWithApple,
      signInWithGoogle,
      signInWithMagicLink,
      signOut,
      refreshSession,
    ],
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
