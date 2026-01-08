import { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import SuperJSON from "superjson";

import type { AppRouter } from "@tonik/api";
import { useAuthStore } from "@tonik/auth-native";

import { config } from "../config/env";

export const api = createTRPCReact<AppRouter>();

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
  const accessToken = useAuthStore(s => s.session?.access_token);

  const trpcClient = useMemo(
    () =>
      api.createClient({
        links: [
          loggerLink({
            enabled: (op) =>
              __DEV__ ||
              (op.direction === "down" && op.result instanceof Error),
            colorMode: "ansi"
          }),
          httpBatchLink({
            transformer: SuperJSON,
            url: `${config.apiUrl}/api/trpc`,
            async headers() {
              return {
                "x-trpc-source": "expo-react",
                ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
              };
            },
          }),
        ],
      }),
    [accessToken],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </api.Provider>
    </QueryClientProvider>
  );
}
