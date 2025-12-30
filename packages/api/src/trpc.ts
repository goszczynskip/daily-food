import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import z, { ZodError } from "zod";

import type { CookieStore } from "@tonik/supabase";
import { createClient, createClientWithToken } from "@tonik/supabase/server";

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
export const createTRPCContext = async (opts: {
  headers?: Headers;
  cookieStore?: CookieStore;
  supabase: SupabaseConfig;
  source?: string;
  logLevel?: "trace" | "debug" | "info" | "warn" | "error" | "fatal";
}) => {
  const source = opts.headers?.get("x-trpc-source") ?? opts.source ?? "unknown";

  // Support both cookie-based (web) and token-based (native) auth
  const authHeader = opts.headers?.get("Authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;

  const supabaseAnonClient = bearerToken
    ? createClientWithToken({
        supabaseApiUrl: opts.supabase.supabaseUrl,
        supabaseKey: opts.supabase.supabaseAnonKey,
        accessToken: bearerToken,
      })
    : createClient({
        supabaseApiUrl: opts.supabase.supabaseUrl,
        supabaseKey: opts.supabase.supabaseAnonKey,
        cookieStore: opts.cookieStore,
      });

  const supabaseServiceClient = createClient({
    supabaseApiUrl: opts.supabase.supabaseUrl,
    supabaseKey: opts.supabase.supabaseServiceRoleKey,
    cookieStore: opts.cookieStore,
  });

  const {
    data: { user },
  } = await supabaseAnonClient.auth.getUser();

  const {
    data: { session },
  } = await supabaseAnonClient.auth.getSession();

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
    user,
    session,
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

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = baseProcedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }

  return next({
    ctx: {
      user: ctx.user,
    },
  });
});
