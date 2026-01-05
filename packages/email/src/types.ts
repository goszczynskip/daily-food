export interface MagicLinkEmailProps {
  /** The 6-digit OTP code from Supabase */
  token?: string;
  /** Site URL for reference */
  siteUrl?: string;
  lang?: string;
  debugLang?: string | null;
}
