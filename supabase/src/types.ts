import type { CookieMethodsServer } from "@supabase/ssr";
import type { cookies } from "next/headers";

export type * from "./types.gen";
export interface CookieStore {
  getAll: CookieMethodsServer["getAll"];
  set: Awaited<ReturnType<typeof cookies>>["set"];
}
