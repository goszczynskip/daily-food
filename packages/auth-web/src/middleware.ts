import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { User } from "@tonik/supabase";
import { createMiddleware as createMiddlewareSupabase } from "@tonik/supabase/middleware";

interface ProtectedPath {
  /**
   * Path to protect.
   * It matches request pathname against this path using native js regex.
   *
   * Can be a string, array of strings, RegExp or array of RegExp.
   */
  path: string | RegExp | (string | RegExp)[];
  /**
   * Test function to determine if user is allowed to access the path.
   *
   * Gets supabase user object as an argument and should return a boolean.
   */
  test: (user: User) => boolean;
  /**
   * Function called when user is not allowed to access the path.
   *
   * You can redirect user to login page here.
   */
  onFail: (request: NextRequest) => NextResponse;
  onPass?: (request: NextRequest) => NextResponse;
}

interface CreateMiddlewareOptions {
  supabase: {
    supabaseUrl: string;
    supabaseAnonKey: string;
  };
  protectedPaths?: ProtectedPath[];
}

export const createAuthMiddleware = ({
  supabase: { supabaseAnonKey, supabaseUrl },
  protectedPaths = [],
}: CreateMiddlewareOptions) => {
  const supabaseMiddleware = createMiddlewareSupabase({
    supabaseAnonKey,
    supabaseUrl,
  });

  const regexpProtectedPaths = protectedPaths.map((config) => ({
    match: Array.isArray(config.path)
      ? config.path.map((p) => (typeof p === "string" ? new RegExp(p) : p))
      : typeof config.path === "string"
        ? new RegExp(config.path)
        : config.path,
    ...config,
  }));

  return async function middleware(request: NextRequest) {
    const { user, cookiesToSet } = await supabaseMiddleware(request);

    const matchingPath = regexpProtectedPaths.find(({ match }) =>
      Array.isArray(match)
        ? match.some((m) => m.test(request.nextUrl.pathname))
        : match.test(request.nextUrl.pathname),
    );

    if (matchingPath) {
      if (user && matchingPath.test(user)) {
        if (matchingPath.onPass) {
          return matchingPath.onPass(request);
        }
      } else {
        return matchingPath.onFail(request);
      }
    }

    // set cookies on the request object so application code can use fresh session
    for (const cookie of cookiesToSet) {
      request.cookies.set(cookie);
    }

    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    for (const cookie of cookiesToSet) {
      // Set cookies on the response object as well only if they are not already set by application code
      if (!response.cookies.get(cookie.name)) {
        response.cookies.set(cookie);
      }
    }

    return response;
  };
};
