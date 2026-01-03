import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Session } from "@tonik/supabase";

interface InitialAuthContext {
  state: "loading";
  session: null;
}

interface AnonAuthContext {
  state: "anon";
  session: null;
}

interface AuthenticatedAuthContext {
  state: "authenticated";
  session: Session;
}

type AuthContext =
  | InitialAuthContext
  | AnonAuthContext
  | AuthenticatedAuthContext;

interface AuthState {
  state: AuthContext["state"];
  session: AuthContext["session"];
}

interface AuthActions {
  login: (session: Session) => void;
  logout: () => void;
  setSession: (session: Session | null) => void;
}

export type AuthStore = AuthState & AuthActions;

export interface SecureStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

export const createAuthStore = (storage: SecureStorage) =>
  create<AuthStore>()(
    persist(
      (set) => ({
        state: "loading",
        session: null,
        login: (session) => set({ state: "authenticated", session }),
        logout: () => set({ state: "anon", session: null }),
        setSession: (session) =>
          session
            ? set({ state: "authenticated", session })
            : set({ state: "anon", session: null }),
      }),
      {
        name: "auth-storage",
        storage: createJSONStorage(() => ({
          getItem: (key) => storage.getItem(key),
          setItem: (key, value) => storage.setItem(key, value),
          removeItem: (key) => storage.removeItem(key),
        })),
      },
    ),
  );

export type AuthStoreApi = ReturnType<typeof createAuthStore>;
