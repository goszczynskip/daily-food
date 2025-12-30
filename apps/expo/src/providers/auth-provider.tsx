import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AppState } from "react-native";

import { createSupabaseClient } from "../lib/supabase";
import { authTokenStorage } from "../trpc/react";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  supabase: ReturnType<typeof createSupabaseClient>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const supabase = createSupabaseClient();

  const syncAuthToken = useCallback(async (session: Session | null) => {
    if (session?.access_token) {
      await authTokenStorage.set(session.access_token);
    } else {
      await authTokenStorage.clear();
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await syncAuthToken(session);
      setState({
        session,
        user: session?.user ?? null,
        isLoading: false,
        isAuthenticated: !!session,
      });
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await syncAuthToken(session);
      setState((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session,
      }));
    });

    return () => subscription.unsubscribe();
  }, [supabase, syncAuthToken]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextState) => {
        if (nextState === "active") {
          await supabase.auth.getSession();
        }
      },
    );
    return () => subscription.remove();
  }, [supabase]);

  const signInWithGoogle = useCallback(async () => {
    const { GoogleSignin } = await import(
      "@react-native-google-signin/google-signin"
    );
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
    const appleAuth = await import(
      "@invertase/react-native-apple-authentication"
    );
    const credential = await appleAuth.default.performRequest({
      requestedOperation: appleAuth.AppleRequestOperation.LOGIN,
      requestedScopes: [
        appleAuth.AppleRequestScope.EMAIL,
        appleAuth.AppleRequestScope.FULL_NAME,
      ],
    });
    if (!credential.identityToken)
      throw new Error("No identity token from Apple");

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
    const {
      data: { session },
    } = await supabase.auth.refreshSession();
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
