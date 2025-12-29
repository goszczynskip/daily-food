import { z } from "zod";

export const emailLoginFormSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const mainFilterSchema = z.enum([
  "all",
  "published",
  "upcoming",
  "draft",
  "archived",
]);
