import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@tonik/supabase";

import { config } from "../config/env";

const SecureStoreAdapter = {
  getItem: async (key: string) => SecureStore.getItemAsync(key),
  setItem: async (key: string, value: string) =>
    SecureStore.setItemAsync(key, value),
  removeItem: async (key: string) => SecureStore.deleteItemAsync(key),
};

export function createSupabaseClient() {
  return createClient<Database>(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      storage: SecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

export type SupabaseClient = ReturnType<typeof createSupabaseClient>;
