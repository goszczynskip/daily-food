import { TRPCError } from "@trpc/server";

import type { Logger } from "@tonik/logger";
import type { Auth } from "@tonik/supabase";
import {
  initPasswordResetRequestSchema,
  loginRequestSchema,
  resetPasswordRequestSchema,
  signupRequestSchema,
} from "@tonik/auth/schemas";
import { Supabase } from "@tonik/supabase";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

function throwIfError(
  error: Auth.AuthError | null,
  logger: Logger,
): asserts error is null {
  if (!error) {
    return;
  }

  logger.info({ err: error }, "Auth error");

  throw new TRPCError({
    code: "UNAUTHORIZED",
    cause: error,
    message: error.message,
  });
}

export const authRouter = createTRPCRouter({
  me: publicProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase.auth.getUser();

    if (error) {
      if (!Supabase.isAuthSessionMissingError(error)) {
        ctx.logger.error(error, "Failed to get user");
      }
      return null;
    }

    return data.user;
  }),
  signup: publicProcedure
    .input(signupRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = ctx.logger.child({
        "input.type": input.type,
        "input.provider": "provider" in input ? input.provider : null,
      });

      logger.info("Signup");

      switch (input.type) {
        case "email": {
          const { error } = await ctx.supabase.auth.signUp({
            email: input.email,
            password: input.password,
            options: { captchaToken: input.captchaToken },
          });

          throwIfError(error, logger);

          return;
        }
        case "phone": {
          const { error } = await ctx.supabase.auth.signUp({
            phone: input.phone,
            password: input.password,
            options: { captchaToken: input.captchaToken },
          });

          throwIfError(error, logger);

          return;
        }
        case "social": {
          const { error, data } = await ctx.supabase.auth.signInWithOAuth({
            provider: input.provider,

            options: {
              redirectTo:
                ctx.protocol + "://" + ctx.host + "/api/auth/callback",
            },
          });

          throwIfError(error, logger);

          return { provider: data.provider, url: data.url };
        }
        case "otp-email": {
          const { error, data } = await ctx.supabase.auth.signInWithOtp({
            email: input.email,
            options: { captchaToken: input.captchaToken },
          });

          throwIfError(error, logger);

          logger.info({ messageId: data.messageId }, "Email sent");

          return { messageId: data.messageId };
        }
        case "otp-phone": {
          const { error, data } = await ctx.supabase.auth.signInWithOtp({
            phone: input.phone,
            options: { captchaToken: input.captchaToken },
          });

          throwIfError(error, logger);

          logger.info({ emailId: data.messageId }, "Phone message sent");

          return { messageId: data.messageId };
        }
        case "social-id-token": {
          const { error, data } = await ctx.supabase.auth.signInWithIdToken({
            provider: input.provider,
            token: input.token,
            options: { captchaToken: input.captchaToken },
          });

          throwIfError(error, logger);

          return {
            session: data.session,
            user: data.user,
          };
        }

        default:
          input satisfies never;
          throw new Error(
            `Invalid login type. Got: ${(input as { type: string }).type}`,
          );
      }
    }),
  login: publicProcedure
    .input(loginRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const logger = ctx.logger.child({
        "input.type": input.type,
        "input.provider": "provider" in input ? input.provider : null,
      });

      logger.info("Login");

      switch (input.type) {
        case "email": {
          const { error, data } = await ctx.supabase.auth.signInWithPassword({
            email: input.email,
            password: input.password,
            options: { captchaToken: input.captchaToken },
          });

          throwIfError(error, logger);

          return { weakPassword: data.weakPassword };
        }
        case "phone": {
          const { error, data } = await ctx.supabase.auth.signInWithPassword({
            phone: input.phone,
            password: input.password,
            options: { captchaToken: input.captchaToken },
          });

          throwIfError(error, logger);

          return { weakPassword: data.weakPassword };
        }
        case "social": {
          const { error, data } = await ctx.supabase.auth.signInWithOAuth({
            provider: input.provider,
            options: {
              redirectTo:
                ctx.protocol + "://" + ctx.host + "/api/auth/callback",
            },
          });

          throwIfError(error, logger);

          return { provider: data.provider, url: data.url };
        }

        case "social-id-token": {
          const { error, data } = await ctx.supabase.auth.signInWithIdToken({
            provider: input.provider,
            token: input.token,
            options: { captchaToken: input.captchaToken },
          });

          throwIfError(error, logger);

          return {
            session: data.session,
            user: data.user,
          };
        }
        case "otp-email": {
          const { error, data } = await ctx.supabase.auth.signInWithOtp({
            email: input.email,
            options: { captchaToken: input.captchaToken },
          });

          throwIfError(error, logger);

          logger.info({ emailId: data.messageId }, "Email sent");

          return { messageId: data.messageId };
        }

        case "otp-phone": {
          const { error, data } = await ctx.supabase.auth.signInWithOtp({
            phone: input.phone,
            options: { captchaToken: input.captchaToken },
          });

          throwIfError(error, logger);

          logger.info({ emailId: data.messageId }, "Phone message sent");

          return { messageId: data.messageId };
        }
        case "otp-verify": {
          const { error, data } = await ctx.supabase.auth.verifyOtp({
            email: input.email,
            token: input.code,
            type: "email",
          });

          throwIfError(error, logger);

          logger.info({ email: input.email }, "OTP verified");

          return {
            session: data.session,
            user: data.user,
          };
        }
        default:
          input satisfies never;
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Invalid login type. Got: ${(input as { type: string }).type}`,
          });
      }
    }),

  initPasswordReset: publicProcedure
    .input(initPasswordResetRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase.auth.resetPasswordForEmail(
        input.email,
        { captchaToken: input.captchaToken, redirectTo: "/reset-password" },
      );

      if (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }
    }),
  resetPassword: protectedProcedure
    .input(resetPasswordRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase.auth.updateUser({
        password: input.password,
      });

      if (error) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: error.message,
        });
      }
    }),

  logout: publicProcedure.mutation(async ({ ctx }) => {
    await ctx.supabase.auth.signOut();
  }),
});
