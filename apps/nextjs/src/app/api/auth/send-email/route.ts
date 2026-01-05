/**
 * Supabase Auth Hook: Send Email
 *
 * This endpoint handles email sending for Supabase authentication events.
 * It replaces Supabase's built-in email sending with custom React Email templates.
 *
 * - Development: Sends to local Inbucket (Supabase's email testing server) via SMTP
 * - Production: Sends via Resend API
 *
 * @see {@link https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook}
 */

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import { Webhook } from "standardwebhooks";

import type { SupportedLanguage } from "@tonik/email";
import { renderMagicLinkEmail, renderSignupEmail } from "@tonik/email";
import { env } from "@tonik/env";
import { getBaseUrl } from "~/lib/utils";

type EmailType = "magic_link" | "signup" | "recovery" | "email_change";

const isDevelopment = env.NODE_ENV === "development";

/**
 * Email sending configuration
 */
interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email via local Inbucket SMTP (development only)
 */
async function sendViaInbucket(options: EmailOptions): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: "localhost",
    port: 54325, // Inbucket SMTP port configured in supabase/config.toml
    secure: false,
    // No auth required for Inbucket
  });

  await transporter.sendMail({
    from: options.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}

/**
 * Send email via Resend API (production)
 */
async function sendViaResend(
  options: EmailOptions,
  apiKey: string,
): Promise<void> {
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: options.from,
    to: [options.to],
    subject: options.subject,
    html: options.html,
  });

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Supabase Auth Hook payload structure
 */
interface AuthHookPayload {
  user: {
    id: string;
    email: string;
    user_metadata: {
      language?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
    token_new: string;
    token_hash_new: string;
  };
}

/**
 * Map Supabase email action types to our email types
 */
function mapEmailActionType(actionType: string): EmailType | null {
  const mapping: Record<string, EmailType> = {
    signup: "signup",
    signup_confirmation: "signup",
    magic_link: "magic_link",
    recovery: "recovery",
    email_change: "email_change",
  };
  return mapping[actionType] ?? null;
}

/**
 * Validate and normalize language code
 */
function normalizeLanguage(lang: string | undefined): SupportedLanguage {
  const supported: SupportedLanguage[] = ["en", "pl"];
  if (lang && supported.includes(lang as SupportedLanguage)) {
    return lang as SupportedLanguage;
  }
  return "en";
}

export async function POST(request: Request) {
  try {
    // Validate required environment variables
    if (!env.SEND_EMAIL_HOOK_SECRET) {
      console.error("SEND_EMAIL_HOOK_SECRET is not configured");
      return NextResponse.json(
        {
          error: {
            http_code: 500,
            message: "Email hook not configured",
          },
        },
        { status: 500 },
      );
    }

    // In production, Resend configuration is required
    if (!isDevelopment && (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL)) {
      console.error("Resend configuration is incomplete for production");
      return NextResponse.json(
        {
          error: {
            http_code: 500,
            message: "Email service not configured",
          },
        },
        { status: 500 },
      );
    }

    // Get the raw payload for signature verification
    const payload = await request.text();
    const headers = Object.fromEntries(request.headers);

    // Verify webhook signature
    // Remove the "v1,whsec_" prefix if present
    const secret = env.SEND_EMAIL_HOOK_SECRET.replace(/^v1,whsec_/, "");

    const wh = new Webhook(secret);

    let data: AuthHookPayload;
    try {
      data = wh.verify(payload, headers) as AuthHookPayload;
    } catch (verifyError) {
      console.error("Webhook signature verification failed:", verifyError);
      return NextResponse.json(
        {
          error: {
            http_code: 401,
            message: "Invalid webhook signature",
          },
        },
        { status: 401 },
      );
    }

    const { user, email_data } = data;
    const emailType = mapEmailActionType(email_data.email_action_type);

    if (!emailType) {
      console.warn(
        `Unsupported email action type: ${email_data.email_action_type}`,
      );
      // Return 200 to acknowledge receipt but skip sending
      // This allows other email types to fall through to default behavior
      return NextResponse.json({});
    }

    // Get user's preferred language from metadata
    const lang = normalizeLanguage(user.user_metadata.language);

    // Render the email based on type
    let html: string;
    let subject: string;

    switch (emailType) {
      case "magic_link":
        const magicLinkResult = await renderMagicLinkEmail({
          token: email_data.token,
          siteUrl: getBaseUrl(),
          lang,
        });
        html = magicLinkResult.html;
        subject = magicLinkResult.subject;
        break;

      case "signup":
        const signupResult = await renderSignupEmail({
          token: email_data.token,
          siteUrl: getBaseUrl(),
          email: user.email,
          lang,
        });
        html = signupResult.html;
        subject = signupResult.subject;
        break;

      default:
        console.warn(`Email type ${emailType} not yet implemented`);
        return NextResponse.json({});
    }

    // Default from address for development
    const fromEmail =
      env.RESEND_FROM_EMAIL ?? "Daily Food <noreply@dailyfood.local>";

    const emailOptions: EmailOptions = {
      from: fromEmail,
      to: user.email,
      subject,
      html,
    };

    // Send email based on environment
    try {
      if (isDevelopment) {
        await sendViaInbucket(emailOptions);
        console.log(
          `[DEV] Email sent to Inbucket: type=${emailType}, to=${user.email}, lang=${lang}`,
        );
      } else if (env.RESEND_API_KEY) {
        // In production, RESEND_API_KEY is guaranteed to exist (validated above)
        await sendViaResend(emailOptions, env.RESEND_API_KEY);
        console.log(
          `Email sent via Resend: type=${emailType}, to=${user.email}, lang=${lang}`,
        );
      }
    } catch (sendError) {
      console.error("Failed to send email:", sendError);
      return NextResponse.json(
        {
          error: {
            http_code: 500,
            message:
              sendError instanceof Error ? sendError.message : "Send failed",
          },
        },
        { status: 500 },
      );
    }

    // Return empty 200 response to indicate success
    return NextResponse.json({});
  } catch (error) {
    console.error("Unexpected error in send-email hook:", error);
    return NextResponse.json(
      {
        error: {
          http_code: 500,
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    );
  }
}
