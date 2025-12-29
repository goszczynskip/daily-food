import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
  },
  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {
    /**
     * The secret key used to sign the JWT tokens.
     * Used by inngest to sign JWT with a custom role.
     */
    SUPABASE_JWT_SECRET: z.string(),
    SUPABASE_SERVICE_ROLE_KEY: z.string(),
    /**
     * The Supabase ANON key. Even though it's safe to share it publicly we don't recommend it.
     * Keep it private the same way you keep your other secrets.
     *
     * We don't need it in browser since supabase works only inside of tRPC
     * This way even if RLS policies are flawed users can't directly access the data.
     *
     * !!! WARNING !!!
     * Do not use NEXT_PUBLIC_SUPABASE_ANON_KEY env variable
     */
    SUPABASE_ANON_KEY: z.string(),

    SUPABASE_URL: z.string(),

    POSTGRES_URL: z.string().transform((v) => {
      if (
        v.includes("workaround=supabase-pooler.vercel") ||
        !process.env.VERCEL_ENV
      ) {
        return v;
      } else {
        const newUrl = new URL(v);
        newUrl.searchParams.set("workaround", "supabase-pooler.vercel");
        return newUrl.toString();
      }
    }),
    VERCEL: z.string().optional(),

    LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace"])
      .default("info"),
  },
  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_VERCEL_URL: z.string().optional(),
    NEXT_PUBLIC_VERCEL_BRANCH_URL: z.string().optional(),
    NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
  },
  experimental__runtimeEnv: {
    VERCEL_ENV: process.env.VERCEL_ENV,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
    NEXT_PUBLIC_VERCEL_BRANCH_URL: process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL,
    NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL:
      process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
  },
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === "lint",
});
