import { cache } from "react";
import { cookies, headers } from "next/headers";

import { createCaller, createTRPCContext } from "@tonik/api";
import { env } from "@tonik/env";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");
  const cookiesStore = await cookies();

  /** turbo gen: createContext body */

  return createTRPCContext({
    cookieStore: cookiesStore,
    supabase: {
      supabaseAnonKey: env.SUPABASE_ANON_KEY,
      supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: env.SUPABASE_URL,
    },
    headers: heads,
    logLevel: env.LOG_LEVEL,
  });
});

export const api = createCaller(createContext);
