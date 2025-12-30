import { useState } from "react";
import * as SecureStore from "expo-secure-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import SuperJSON from "superjson";

import type { AppRouter } from "@tonik/api";

import { config } from "../config/env";

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
          url: `${config.apiUrl}/api/trpc`,
          async headers() {
            const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
            return {
              "x-trpc-source": "expo-react",
              ...(token && { Authorization: `Bearer ${token}` }),
            };
          },
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </api.Provider>
    </QueryClientProvider>
  );
}

export const authTokenStorage = {
  set: (token: string) => SecureStore.setItemAsync(AUTH_TOKEN_KEY, token),
  get: () => SecureStore.getItemAsync(AUTH_TOKEN_KEY),
  clear: () => SecureStore.deleteItemAsync(AUTH_TOKEN_KEY),
};
