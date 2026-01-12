import "i18next";

import type app from "../i18n/locales/en/app.json";
import type common from "../i18n/locales/en/common.json";
import type auth from "../i18n/locales/en/auth.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof common;
      app: typeof app;
      auth: typeof auth;
    };
    returnNull: false;
  }
}
