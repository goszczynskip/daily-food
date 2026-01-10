import z from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { userMetadataSchema } from "@tonik/supabase/schemas";

export const userRouter = createTRPCRouter({
  profile: publicProcedure.query(({ ctx }) => {
    return ctx.user;
  }),
  changeLanguage: protectedProcedure.input(z.object({ language: z.string() })).mutation(async ({ ctx, input }) => {
    const response = await ctx.supabase.auth.updateUser({ data: { language: input.language }})

    if(response.error) {
      throw response.error
    }

    const userMetadata = userMetadataSchema.parse(response.data.user.user_metadata)

    return { language: userMetadata.language }
  })
});
