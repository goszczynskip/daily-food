import type { CookieOptions } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "./types";

interface CreateMiddlewareOptions {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export const createMiddleware = ({
  supabaseAnonKey,
  supabaseUrl,
}: CreateMiddlewareOptions) =>
  async function middleware(request: NextRequest) {
    const cookiesToSet: {
      name: string;
      value: string;
      options?: CookieOptions;
    }[] = [];

    const supabase = createServerClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll: () => {
            return request.cookies.getAll();
          },
          setAll: (cookies) => {
            for (const cookie of cookies) {
              const { name, value } = cookie;

              request.cookies.set(name, value);
              cookiesToSet.push(cookie);
            }
          },
        },
      },
    );

    const { data } = await supabase.auth.getUser();

    return { user: data.user, cookiesToSet };
  };
