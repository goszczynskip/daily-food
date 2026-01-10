import expoConfig from "eslint-config-expo/flat.js";

import { restrictEnvAccess } from "@tonik/eslint-config/base";

/** @type {import('@tonik/eslint-config/types').Config} */
export default [
  {
    ignores: ["dist/**"],
  },
  ...expoConfig,
  ...restrictEnvAccess,
];
