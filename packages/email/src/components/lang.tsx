type LanguageTexts = Record<string, string>;

const DEFAULT_LANG = "en";

/**
 * Runtime translation function for dynamic email rendering.
 * Use this when rendering emails via the auth hook (not static export).
 *
 * @param texts - Object with language codes as keys and translated strings as values
 * @param lang - The language code to use for translation
 * @returns The translated string for the given language, or fallback to default/first available
 */
export const tr =
  (lang: string) =>
  (texts: LanguageTexts): string => {
    return texts[lang] ?? texts[DEFAULT_LANG] ?? Object.values(texts)[0] ?? "";
  };

/**
 * Static translation function for template generation.
 * Use this for static email templates that will be processed by Go templates.
 */
export const t = (texts: LanguageTexts): string => {
  return texts[DEFAULT_LANG] ?? Object.values(texts)[0] ?? "";
};
