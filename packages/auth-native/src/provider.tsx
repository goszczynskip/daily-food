import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";

import type { AuthStoreApi, SecureStorage } from "./store";
import { createAuthStore } from "./store";
import type { UseBoundStore } from "zustand";

interface AuthService {
  sendMagicLink: (email: string) => Promise<void>;
  socialLogin: (provider: string) => Promise<void>;
}

interface SessionProviderProps {
  storage: SecureStorage;
  children?: ReactNode;
  authService?: AuthService;
}

export const AuthStoreContext = createContext<AuthStoreApi | null>(null);

export function SessionProvider({ storage, children }: SessionProviderProps) {
  const store = useMemo(() => createAuthStore(storage), [storage]);

  return (
    <AuthStoreContext.Provider value={store}>
      {children}
    </AuthStoreContext.Provider>
  );
}

export const useAuthStore = ((fn) => {
  const context = useContext(AuthStoreContext);
  if (!context) {
    throw new Error("useAuthStore must be used within SessionProvider");
  }

  return context(fn);
}) as UseBoundStore<AuthStoreApi>
