import type { z, ZodError } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Session } from "@tonik/supabase";
import type { TypedSession } from "@tonik/supabase/types";
import { userMetadataSchema } from "@tonik/supabase/schemas";

interface InitialAuthContext {
  state: "loading";
  session: null;
  error: null;
}

interface AnonAuthContext {
  state: "anon";
  session: null;
  error: ZodError<z.infer<typeof userMetadataSchema>> | Error | string | null;
}

interface AuthenticatedAuthContext {
  state: "authenticated";
  session: TypedSession;
  error: ZodError<z.infer<typeof userMetadataSchema>> | Error | string | null;
}

type AuthContext =
  | InitialAuthContext
  | AnonAuthContext
  | AuthenticatedAuthContext;

interface AuthActions {
  login: (session: Session) => void;
  logout: () => void;
  setSession: (session: Session | null) => void;
}

export type AuthStore = AuthContext & AuthActions;

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
        error: null,
        login: (session) => set({ state: "authenticated", session }),
        logout: () => set({ state: "anon", session: null }),
        setSession: (session, error?: string) => {
          if (!session) {
            set({ state: "anon", session: null, error });
            return;
          }

          const typedSessionResult = userMetadataSchema.safeParse(
            session.user.user_metadata,
          );

          if (!typedSessionResult.success) {
            set({
              state: "anon",
              session: null,
              error: typedSessionResult.error,
            });

            return;
          }

          set({ state: "authenticated", session, error });
        },
      }),
      {
        name: "auth-storage",
        storage: createJSONStorage(() => ({
          getItem: (key) => storage.getItem(key),
          setItem: (key, value) => storage.setItem(key, value),
          removeItem: (key) => storage.removeItem(key),
        })),
        onRehydrateStorage: () => (state) => {
          // After rehydration completes, if still "loading" (no stored session), set to "anon"
          if (state?.state === "loading") {
            state.setSession(null);
          }
        },
      },
    ),
  );

export type AuthStoreApi = ReturnType<typeof createAuthStore>;
