import baseConfig, { restrictEnvAccess } from "@tonik/eslint-config/base";
import nextjsConfig from "@tonik/eslint-config/nextjs";
import reactConfig from "@tonik/eslint-config/react";

/** @type {import('@tonik/eslint-config/types').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
];
