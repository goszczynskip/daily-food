import { z } from "zod";

export const userMetadataSchema = z.object({
  language: z.string().optional(),
  currency_code: z.string().optional(),

});
