import { z } from "zod";

import type { Auth } from "@tonik/supabase";

export const emailPasswordSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  captchaToken: z.string().optional(),
});

export const phoneSchema = z.object({
  phone: z.string(),
  password: z.string(),
  captchaToken: z.string().optional(),
});

/**
 * List of supported providers, needs to be manually updated as new providers are added.
 */
export const providerList = z.enum([
  "apple",
  "azure",
  "bitbucket",
  "discord",
  "facebook",
  "figma",
  "github",
  "gitlab",
  "google",
  "kakao",
  "keycloak",
  "linkedin",
  "linkedin_oidc",
  "notion",
  "slack",
  "slack_oidc",
  "spotify",
  "twitch",
  "twitter",
  "workos",
  "zoom",
  "fly",
]) satisfies z.ZodType<Auth.Provider>;

type OnlyLiterals<T> = T extends string 
  ? string extends T 
    ? never 
    : T 
  : never;

type OIDCProviders = OnlyLiterals<Auth.SignInWithIdTokenCredentials['provider']>

export const providerListOIDC = z.enum([
  "apple",
  "azure",
  "google",
  "facebook",
  "kakao",
]) satisfies z.ZodType<OIDCProviders>

export const socialSchema = z.object({
  provider: providerList,
});

export const socialWithIdTokenSchema = z.object({
  provider: providerListOIDC,
  token: z.string(),
  captchaToken: z.string().optional(),
})

export const otpEmailSchema = z.object({
  email: z.string().email(),
  captchaToken: z.string().optional(),
});

export const otpPhoneSchema = z.object({
  phone: z.string(),
  captchaToken: z.string().optional(),
});

export const loginRequestSchema = z.discriminatedUnion("type", [
  emailPasswordSchema.extend({ type: z.literal("email") }),
  phoneSchema.extend({ type: z.literal("phone") }),
  socialSchema.extend({ type: z.literal("social") }),
  socialWithIdTokenSchema.extend({ type: z.literal("social-id-token") }),
  otpEmailSchema.extend({ type: z.literal("otp-email") }),
  otpPhoneSchema.extend({ type: z.literal("otp-phone") }),
]);

export const signupRequestSchema = z.discriminatedUnion("type", [
  emailPasswordSchema.extend({ type: z.literal("email") }),
  phoneSchema.extend({ type: z.literal("phone") }),
  socialSchema.extend({ type: z.literal("social") }),
  socialWithIdTokenSchema.extend({ type: z.literal("social-id-token") }),
  otpEmailSchema.extend({ type: z.literal("otp-email") }),
  otpPhoneSchema.extend({ type: z.literal("otp-phone") }),
]);

export const initPasswordResetRequestSchema = z.object({
  email: z.string().email(),
  captchaToken: z.string().optional(),
});

export const resetPasswordRequestSchema = z.object({
  password: z.string(),
  captchaToken: z.string().optional(),
});
