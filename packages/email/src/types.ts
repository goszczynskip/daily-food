export interface MagicLinkEmailProps {
  /** The 6-digit OTP code from Supabase */
  token?: string;
  /** Site URL for reference */
  siteUrl?: string;
  lang: string;
}

export interface SignupEmailProps {
  /** The 6-digit OTP confirmation code from Supabase */
  token?: string;
  /** Site URL for reference */
  siteUrl?: string;
  /** User's email address */
  email?: string;
  lang: string;
}
