import React, { createContext, use } from "react";

type LanguageTexts = Record<string, string>;

const DEFAULT_LANG = "en";

interface LanguageTemplateProps {
  texts: LanguageTexts;
  defaultLanguage?: string;
}

export function t(
  texts: LanguageTexts,
  defaultLanguage = DEFAULT_LANG,
): string {
  const { debugLang } = use(langContext)

  const entries = Object.entries(texts);

  if (entries.length === 0) {
    return "";
  }

  if(debugLang) return texts[debugLang] ?? `Error: Text for ${debugLang} not found!`

  const defaultLang = defaultLanguage;

  let template = "";

  entries.forEach(([lang, text], index) => {
    if (index === 0) {
      template += `{{ if eq .Data.language "${lang}" }}${text}`;
    } else {
      template += `{{ else if eq .Data.language "${lang}" }}${text}`;
    }
  });

  template += `{{else}}${texts[defaultLang] ?? entries[0]?.[1] ?? ""}`;
  template += "{{end}}";

  return template;
}

const langContext = createContext<{ debugLang: null | string }>({
  debugLang: null,
});

export const DebugLangProvider = langContext.Provider

export const USER_LANG = "{{ .Data.language }}";

export const LanguageTemplate: React.FC<LanguageTemplateProps> = ({
  texts,
  defaultLanguage,
}) => {
  const template = t(texts, defaultLanguage);
  return <>{template}</>;
};
