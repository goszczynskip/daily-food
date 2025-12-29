import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  shared: {
    CI: z
      .enum(["1", "0", "true", "false"])
      .default("0")
      .transform((x) => {
        switch (x) {
          case "1":
          case "true":
            return true;
          case "0":
          case "false":
            return false;
        }
      }),
    AUTH_ADMIN_EMAIL: z.string().default("admin@tonik.com"),
    AUTH_ADMIN_PASSWORD: z.string().default("pass1234"),
    SUPABASE_URL: z.string().default("http://127.0.0.1:54321"),
    SUPABASE_SERVICE_ROLE_KEY: z.string().default(
      // This is a default supabase service role key for localhost instance. It's not a production key. No need to panic :)
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
    ),
    TEST_USER_EMAIL: z.string().default("test@tonik.com"),
    TEST_USER_PASSWORD: z.string().default("pass1234"),
  },
  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  experimental__runtimeEnv: {
    CI: process.env.CI,
    AUTH_ADMIN_EMAIL: process.env.AUTH_ADMIN_EMAIL,
    AUTH_ADMIN_PASSWORD: process.env.AUTH_ADMIN_PASSWORD,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    TEST_USER_EMAIL: process.env.TEST_USER_EMAIL,
    TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD,
  },
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === "lint",
});
