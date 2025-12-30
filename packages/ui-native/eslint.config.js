import baseConfig from "@tonik/eslint-config/base";
import reactConfig from "@tonik/eslint-config/react";

/** @type {import('@tonik/eslint-config/types').Config} */
export default [
  {
    ignores: ["dist/**"],
  },
  ...baseConfig,
  ...reactConfig,
];
