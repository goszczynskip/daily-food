import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { FALLBACK_LANGUAGE, getInitialLanguage, resources } from "./resources";

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: FALLBACK_LANGUAGE,
  ns: ["common", "app"],
  defaultNS: "common",
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: "v4",
  react: {
    useSuspense: false,
  },
});

export { i18n };
