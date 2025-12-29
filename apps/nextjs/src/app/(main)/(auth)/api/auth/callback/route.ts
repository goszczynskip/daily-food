import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { env } from "@tonik/env";
import { createLogger } from "@tonik/logger";
import { createClient } from "@tonik/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createClient({
      supabaseKey: env.SUPABASE_ANON_KEY,
      supabaseApiUrl: env.SUPABASE_URL,
      cookieStore,
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = env.NODE_ENV === "development";
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } else {
      const logger = createLogger({ name: "auth-callback" });
      logger.error(error, "Failed to exchange code for session");
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
