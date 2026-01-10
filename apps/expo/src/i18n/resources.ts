import { getLocales } from "expo-localization";
import { keys } from "remeda";
import { z } from "zod"
import enApp from "./locales/en/app.json";
import enCommon from "./locales/en/common.json";
import plApp from "./locales/pl/app.json";
import plCommon from "./locales/pl/common.json";

export const resources = {
  en: {
    common: enCommon,
    app: enApp,
  },
  pl: {
    common: plCommon,
    app: plApp,
  },
};

export const SUPPORTED_LANGUAGES = keys(resources);
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const FALLBACK_LANGUAGE = "en" satisfies SupportedLanguage;

export const supportedLanguagesSchema = z.enum(SUPPORTED_LANGUAGES)

export function getInitialLanguage(): SupportedLanguage {
  const deviceLanguage = getLocales()[0]?.languageCode ?? FALLBACK_LANGUAGE;
  return SUPPORTED_LANGUAGES.includes(deviceLanguage as SupportedLanguage)
    ? (deviceLanguage as SupportedLanguage)
    : FALLBACK_LANGUAGE;
}
