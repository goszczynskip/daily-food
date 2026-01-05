import * as React from "react";
import { render } from "@react-email/components";

import { MagicLinkEmail } from "../emails/auth/magic-link";
import { SignupEmail } from "../emails/auth/signup";

export type EmailType = "magic_link" | "signup" | "recovery" | "email_change";

export type SupportedLanguage = "en" | "pl";

export interface RenderMagicLinkEmailOptions {
  token: string;
  siteUrl: string;
  lang: SupportedLanguage;
}

export interface RenderSignupEmailOptions {
  token: string;
  siteUrl: string;
  email: string;
  lang: SupportedLanguage;
}

/**
 * Render the magic link email to HTML string.
 * Used by the auth hook to generate email content at runtime.
 */
export async function renderMagicLinkEmail(
  options: RenderMagicLinkEmailOptions,
): Promise<{ html: string; subject: string }> {
  const { token, siteUrl, lang } = options;

  const html = await render(
    <MagicLinkEmail token={token} siteUrl={siteUrl} lang={lang} />,
  );

  const subjects: Record<SupportedLanguage, string> = {
    en: "Your Daily Food Login Code",
    pl: "Twój kod logowania do Daily Food",
  };

  return {
    html,
    subject: subjects[lang],
  };
}

/**
 * Render the signup confirmation email to HTML string.
 * Used by the auth hook to generate email content at runtime.
 */
export async function renderSignupEmail(
  options: RenderSignupEmailOptions,
): Promise<{ html: string; subject: string }> {
  const { token, siteUrl, email, lang } = options;

  const html = await render(
    <SignupEmail token={token} siteUrl={siteUrl} email={email} lang={lang} />,
  );

  const subjects: Record<SupportedLanguage, string> = {
    en: "Confirm Your Daily Food Signup",
    pl: "Potwierdź rejestrację w Daily Food",
  };

  return {
    html,
    subject: subjects[lang],
  };
}

/**
 * Get email subject for a given email type and language.
 */
export function getEmailSubject(
  emailType: EmailType,
  lang: SupportedLanguage,
): string {
  const subjects: Record<EmailType, Record<SupportedLanguage, string>> = {
    magic_link: {
      en: "Your Daily Food Login Code",
      pl: "Twój kod logowania do Daily Food",
    },
    signup: {
      en: "Confirm Your Daily Food Signup",
      pl: "Potwierdź rejestrację w Daily Food",
    },
    recovery: {
      en: "Reset Your Password",
      pl: "Zresetuj swoje hasło",
    },
    email_change: {
      en: "Confirm Your Email Change",
      pl: "Potwierdź zmianę adresu email",
    },
  };

  return subjects[emailType][lang];
}
