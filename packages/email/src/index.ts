export { MagicLinkEmail, MagicLinkEmailBase } from "./emails/auth/magic-link";
export type { MagicLinkEmailProps } from "./types";
export { withDebugLang } from "./components/with-debug-lang";
export { tr } from "./components/lang";
export {
  renderMagicLinkEmail,
  getEmailSubject,
  type EmailType,
  type SupportedLanguage,
  type RenderMagicLinkEmailOptions,
} from "./lib/render";
