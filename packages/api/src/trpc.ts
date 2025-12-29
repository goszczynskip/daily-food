/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1)
 * 2. You want to create a new middleware or type of procedure (see Part 3)
 *
 * tl;dr - this is where all the tRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end
 */
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import z, { ZodError } from "zod";

import type { CookieStore } from "@tonik/supabase";
import { createClient } from "@tonik/supabase/server";

import { createLoggerPlugin } from "./logger";

interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
}

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = (opts: {
  headers?: Headers;
  cookieStore?: CookieStore;
  supabase: SupabaseConfig;
  source?: string;
  logLevel?: "trace" | "debug" | "info" | "warn" | "error" | "fatal";
}) => {
  const source = opts.headers?.get("x-trpc-source") ?? opts.source ?? "unknown";

  const supabaseAnonClient = createClient({
    supabaseApiUrl: opts.supabase.supabaseUrl,
    supabaseKey: opts.supabase.supabaseAnonKey,
    cookieStore: opts.cookieStore,
  });

  const supabaseServiceClient = createClient({
    supabaseApiUrl: opts.supabase.supabaseUrl,
    supabaseKey: opts.supabase.supabaseServiceRoleKey,
    cookieStore: opts.cookieStore,
  });

  return {
    logLevel: opts.logLevel ?? "info",
    source,
    headers: opts.headers,
    protocol: opts.headers?.get("x-forwarded-proto") ?? "http",
    host:
      opts.headers?.get("x-forwarded-host") ??
      opts.headers?.get("host") ??
      "http://localhost:3000",
    supabase: supabaseAnonClient,
    __dangerousSupabaseServiceRole: supabaseServiceClient,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError:
        error.cause instanceof ZodError ? z.treeifyError(error.cause) : null,
    },
  }),
});

/**
 * Create a server-side caller
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

const loggerPlugin = createLoggerPlugin();
const baseProcedure = t.procedure.concat(loggerPlugin.logger);

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = baseProcedure;
