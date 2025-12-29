/**
 * OTP confirmation route
 *
 * When user clicks on URL with OTP token, this route is triggered.
 * This route implements the PKCE auth flow, following the Supabase guide:
 * @see {@link https://supabase.com/docs/guides/auth/passwords?queryGroups=flow&flow=pkce#signing-up-with-an-email-and-password}
 * @see {@link https://supabase.com/docs/guides/auth/passwords?queryGroups=flow&flow=pkce#resetting-a-password}
 */

import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { Supabase } from "@tonik/supabase";
import { env } from "@tonik/env";
import { createClient } from "@tonik/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as Supabase.EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const cookieStore = await cookies();
    const supabase = createClient({
      supabaseKey: env.SUPABASE_ANON_KEY,
      supabaseApiUrl: env.SUPABASE_URL,
      cookieStore,
    });

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // redirect user to specified redirect URL or root of app
      redirect(next);
    }
  }

  // redirect the user to an error page with some instructions
  redirect("/error");
}
