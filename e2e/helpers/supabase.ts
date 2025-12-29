import type { cookies } from "next/headers";

import { createClient } from "@tonik/supabase/server";

import { env } from "../env";

export const createSupabaseClient = () => {
  const cookiesMap = new Map<
    string,
    {
      name: string;
      value: string | undefined;
      sameSite?: "Strict" | "Lax" | "None" | boolean;
      path?: string;
    }
  >();

  const getAll = () => {
    return Array.from(cookiesMap.values()).filter(
      (
        x,
      ): x is {
        name: string;
        value: string;
        sameSite?: "Strict" | "Lax" | "None" | boolean;
        path?: string;
      } => x.value !== undefined,
    );
  };

  const cookieStore = {} as Awaited<ReturnType<typeof cookies>>;

  cookieStore.getAll = getAll;
  cookieStore.set = (...args) => {
    let name = "",
      value: string | undefined = undefined,
      sameSite: boolean | "lax" | "strict" | "none" | undefined = undefined,
      options;
    if (args[0] instanceof Object) {
      const [extOptions] = args;
      const {
        name: extName,
        value: extValue,
        sameSite: extSameSite,
        ...restOptions
      } = extOptions;
      name = extName;
      value = extValue;
      sameSite = extSameSite;
      options = restOptions;
    } else {
      const [extKey, extValue, partialCookie] = args;
      name = extKey;
      value = extValue;
      sameSite = partialCookie?.sameSite;
    }
    let sameSiteValue: "Strict" | "Lax" | "None" | boolean | undefined;
    switch (sameSite) {
      case "strict":
        sameSiteValue = "Strict";
        break;
      case "lax":
        sameSiteValue = "Lax";
        break;
      case "none":
        sameSiteValue = "None";
        break;
      case true:
      case false:
        sameSiteValue = sameSite;
    }
    cookiesMap.set(name, {
      name,
      value,
      sameSite: sameSiteValue,
      ...(options as unknown as object),
    });
    return cookieStore;
  };

  cookieStore.get = () => {
    throw new Error("Not implemented");
  };
  cookieStore.delete = () => {
    throw new Error("Not implemented");
  };
  cookieStore.has = () => {
    throw new Error("Not implemented");
  };
  cookieStore.toString = () => {
    throw new Error("Not implemented");
  };

  const client = createClient({
    supabaseApiUrl: env.SUPABASE_URL,
    supabaseKey: env.SUPABASE_SERVICE_ROLE_KEY,
    cookieStore,
  });

  return { client, cookies: cookieStore };
};

export type SupabaseClient = ReturnType<typeof createSupabaseClient>["client"];
export type UserAttributes = Parameters<
  SupabaseClient["auth"]["admin"]["createUser"]
>[0];

export const DEFAULT_USER_METADATA = {
  iss: "https://discord.com/api",
  sub: "1111111111111111111",
  name: "testuser#0",
  email: env.TEST_USER_EMAIL,
  picture: "https://cdn.discordapp.com/embed/avatars/0.png",
  full_name: "testuser",
  avatar_url: "https://cdn.discordapp.com/embed/avatars/0.png",
  provider_id: "1111111111111111111",
  custom_claims: { global_name: "Test user" },
  email_verified: true,
  phone_verified: false,
};

/**
 * Creates a test user in Supabase for e2e testing purposes.
 *
 * @param options.user - User attributes to override default values
 * @param options.user.email - User's email (defaults to TEST_USER_EMAIL from env)
 * @param options.user.password - User's password (defaults to TEST_USER_PASSWORD from env)
 * @param options.user.email_confirm - Whether email is confirmed (defaults to true)
 * @param options.skipIfUserExists - If true, returns existing user instead of throwing error
 * @param options.supabase - Optional Supabase client instance to use
 *
 * @returns Object containing the created user's email, password and ID
 *
 * @remarks
 * - By default creates a Discord-authenticated user with preset metadata
 * - Automatically adds 'player' role in app_metadata for API access
 * - Remember to clean up created test users after tests complete
 *
 * @throws Error if user already exists and skipIfUserExists is false
 * @throws Error if user creation fails
 */
export const createUser = async ({
  user: {
    email = env.TEST_USER_EMAIL,
    password = env.TEST_USER_PASSWORD,
    email_confirm = true,
    app_metadata,
    user_metadata,
    ...rest
  } = {},
  skipIfUserExists = false,
  supabase: extSupabaseClient,
}: {
  supabase?: ReturnType<typeof createSupabaseClient>["client"];
  user?: UserAttributes;
  skipIfUserExists?: boolean;
}) => {
  let supabase: ReturnType<typeof createSupabaseClient>["client"];

  if (extSupabaseClient) {
    supabase = extSupabaseClient;
  } else {
    const { client } = createSupabaseClient();
    supabase = client;
  }

  const listUsersResponse = await supabase.auth.admin.listUsers();

  const existingUser = listUsersResponse.data.users.find(
    (user) => user.email === email,
  );
  if (existingUser) {
    if (skipIfUserExists) {
      console.log(
        `User with email ${email} already exists. Skipping creation.`,
      );
      return { email, password, id: existingUser.id };
    } else {
      throw new Error(`User with email ${email} already exists.`);
    }
  }

  const { error, data } = await supabase.auth.admin.createUser({
    email_confirm,
    app_metadata: {
      /**
       * Required for the user to be able to use api.
       */
      player: true,
      ...app_metadata,
    },
    user_metadata: {
      ...DEFAULT_USER_METADATA,
      ...user_metadata,
    },
    email,
    password,
    ...rest,
  });

  if (error) {
    throw new Error(`Failed to create mock user ${error.message}`);
  }

  return { email, password, id: data.user.id };
};
