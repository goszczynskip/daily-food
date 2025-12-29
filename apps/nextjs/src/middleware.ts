import { createAuthMiddleware } from "@tonik/auth/middleware";
import { env } from "@tonik/env";

export const middleware = createAuthMiddleware({
  supabase: {
    supabaseUrl: env.SUPABASE_URL,
    supabaseAnonKey: env.SUPABASE_ANON_KEY,
  },
  protectedPaths: [],
});

// Config must be static and cannot be generated dynamically
// @see https://nextjs.org/docs/messages/invalid-page-config
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|trpc/api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
