import type { CookieMethodsServer } from "@supabase/ssr";
import type { Session, User } from "@supabase/supabase-js";
import type { cookies } from "next/headers";
import type { z } from "zod";

import type { userMetadataSchema } from "./schemas";

export type * from "./types.gen";

export interface CookieStore {
  getAll: CookieMethodsServer["getAll"];
  set: Awaited<ReturnType<typeof cookies>>["set"];
}

export type TypedUser = Omit<User, "user_metadata"> &
  { user_metadata: z.infer<typeof userMetadataSchema> };

export type TypedSession = Omit<Session, "user"> & { user: TypedUser };
