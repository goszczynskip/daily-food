import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import {
  defaultNS,
  FALLBACK_LANGUAGE,
  getInitialLanguage,
  resources,
} from "./resources";

void i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: FALLBACK_LANGUAGE,
  ns: ["common", "app", "auth"],
  defaultNS: defaultNS,
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: "v4",
  react: {
    useSuspense: false,
  },
});

export default i18n;
