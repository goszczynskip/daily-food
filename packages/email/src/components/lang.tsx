'use client';

import React, { createContext, use } from "react";

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
export function tr(texts: LanguageTexts, lang: string): string {
  return texts[lang] ?? texts[DEFAULT_LANG] ?? Object.values(texts)[0] ?? "";
}

interface LanguageTemplateProps {
  texts: LanguageTexts;
  defaultLanguage?: string;
}

export function t(
  texts: LanguageTexts,
  defaultLanguage = DEFAULT_LANG,
): string {
  const { debugLang } = use(langContext);

  const entries = Object.entries(texts);

  if (entries.length === 0) {
    return "";
  }

  if (debugLang)
    return texts[debugLang] ?? `Error: Text for ${debugLang} not found!`;

  const defaultLang = defaultLanguage;

  let template = "";

  entries.forEach(([lang, text], index) => {
    if (index === 0) {
      template += `{{if eq .Data.language "${lang}" }}${text}`;
    } else {
      template += `{{ else if eq .Data.language "${lang}" }}${text}`;
    }
  });

  template += `{{ else }}${texts[defaultLang] ?? entries[0]?.[1] ?? ""}`;
  template += "{{end}}";

  return template;
}

const langContext = createContext<{ debugLang: null | string }>({
  debugLang: null,
});

export const DebugLangProvider = langContext.Provider;

export const USER_LANG = "{{ .Data.language }}";

export const LanguageTemplate: React.FC<LanguageTemplateProps> = ({
  texts,
  defaultLanguage,
}) => {
  const template = t(texts, defaultLanguage);
  return <>{template}</>;
};
