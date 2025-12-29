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
