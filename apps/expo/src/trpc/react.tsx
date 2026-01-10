import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import superjson from "superjson";

import type { AppRouter } from "@tonik/api";
import { useAuthStore } from "@tonik/auth-native";

import { config } from "../config/env";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
    },
  },
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: createTRPCClient({
    links: [
      loggerLink({
        enabled: (op) =>
          __DEV__ || (op.direction === "down" && op.result instanceof Error),
        colorMode: "ansi",
      }),
      httpBatchLink({
        transformer: superjson,
        url: `${config.apiUrl}/api/trpc`,
        async headers() {
          const accessToken = useAuthStore.getState().session?.access_token;
          return {
            "x-trpc-source": "expo-react",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          };
        },
      }),
    ],
  }),
  queryClient
});
