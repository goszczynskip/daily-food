import { z } from "zod";

import type { User } from "@tonik/supabase";

const claimsSchema = z
  .object({
    admin: z.boolean().catch(false),
  })
  .catch({ admin: false });

export const isAdmin = (user: User) => getClaims(user).admin;

export const getClaims = (user: User) => claimsSchema.parse(user.app_metadata);
