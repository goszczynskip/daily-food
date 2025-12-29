import { createServerClient } from "@supabase/ssr";

import type { CookieStore, Database } from "./types";

interface BaseOptions {
  supabaseApiUrl: string;
  /**
   * The key used to authenticate with Supabase. It can be anon key or service
   * role key depending on usage context.
   */
  supabaseKey: string;
  cookieStore?: CookieStore;
}

export function createClient(configOptions: BaseOptions) {
  return createServerClient<Database>(
    configOptions.supabaseApiUrl,
    configOptions.supabaseKey,
    {
      cookies: {
        getAll: () => {
          return configOptions.cookieStore?.getAll() ?? null;
        },
        setAll: (cookies) => {
          if (configOptions.cookieStore?.set) {
            try {
              for (const cookie of cookies) {
                configOptions.cookieStore.set(cookie);
              }
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          }
        },
      },
    },
  );
}
