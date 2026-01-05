import { fileURLToPath } from "url";
import { createJiti } from "jiti";

const jiti = createJiti(fileURLToPath(import.meta.url), { debug: true });

/**
 * Import env files to validate at build time. Use jiti so we can load .ts files in here.
 * @type {import("@tonik/env")}
 */
await jiti.import("@tonik/env");

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  experimental: {
    // Explore route composition and segment overrides via DevTools
    devtoolSegmentExplorer: true,
  },

  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@tonik/api",
    "@tonik/auth",
    "@tonik/env",
    "@tonik/logger",
    "@tonik/payload",
    "@tonik/supabase",
    "@tonik/ui",
    "@tonik/validators",
  ],

  serverExternalPackages: ["sequelize", "pino", "pino-pretty"],

  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  redirects:
    process.env.NODE_ENV === "production"
      ? undefined
      : async () => {
          return [
            {
              source: "/_db",
              destination: "http://localhost:54323",
              basePath: false,
              permanent: false,
            },
            {
              source: "/_otel",
              destination: "http://localhost:16686",
              basePath: false,
              permanent: false,
            },
            {
              source: "/_email",
              destination: "http://localhost:3001",
              basePath: false,
              permanent: false,
            },
            {
              source: "/_inbox",
              destination: "http://localhost:54324",
              basePath: false,
              permanent: false,
            },
          ];
        },
};

export default config;
