export { MagicLinkEmail } from "./emails/auth/magic-link";
export { SignupEmail } from "./emails/auth/signup";
export type { MagicLinkEmailProps, SignupEmailProps } from "./types";
export { tr } from "./components/lang";
export {
  renderMagicLinkEmail,
  renderSignupEmail,
  getEmailSubject,
  type EmailType,
  type SupportedLanguage,
  type RenderMagicLinkEmailOptions,
  type RenderSignupEmailOptions,
} from "./lib/render";
