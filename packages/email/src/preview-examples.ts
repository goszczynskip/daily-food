import { MagicLinkEmail, withDebugLang } from "./index";

// Example: Create a preview version with default debug language
export const MagicLinkEmailPreview = withDebugLang(MagicLinkEmail, "en");

// Usage examples:
//
// 1. Basic usage (same as original MagicLinkEmail):
// <MagicLinkEmail token="123456" siteUrl="https://example.com" lang="en" debugLang="en" />
//
// 2. Preview version with default English debug language:
// <MagicLinkEmailPreview token="123456" siteUrl="https://example.com" lang="en" />
//
// 3. Override debug language even with preview version:
// <MagicLinkEmailPreview token="123456" siteUrl="https://example.com" lang="pl" debugLang="pl" />
//
// 4. Create other email components with debug support:
// const OtherEmail = withDebugLang(MyOtherEmailComponent);
// const OtherEmailPreview = withDebugLang(MyOtherEmailComponent, "pl");
