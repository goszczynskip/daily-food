/// <reference lib="dom" />
import { env } from ".";

declare const window: Window &
  typeof globalThis & {
    location: Location;
  };

/**
 * Get the client-side URL host.
 * Returns the host (origin without the protocol). Reads value directly from `window.location.host`.
 */
export const getClientSideHost = () => {
  if (typeof window === "undefined") {
    throw new Error("getClientSideUrl() can only be called on the client side");
  }

  return window.location.host;
};

/**
 * Get the Vercel deployment URL based on the current environment.
 * Returns production URL for production environment,
 * branch/preview URL for preview environment,
 * and development URL for development environment.
 */
export const getVercelDeploymentUrl = () => {
  if (env.VERCEL_ENV === "production") {
    return env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
  }

  if (env.VERCEL_ENV === "preview") {
    return env.NEXT_PUBLIC_VERCEL_BRANCH_URL ?? env.NEXT_PUBLIC_VERCEL_URL;
  }

  if (env.VERCEL_ENV === "development") {
    return env.NEXT_PUBLIC_VERCEL_URL;
  }
};

/**
 * Get the URL of the app without protocol.
 * It returns the Vercel deployment URL if the app is deployed on Vercel
 * or local url for development.
 */
export const getUrl = () => {
  return getVercelDeploymentUrl() ?? `localhost:3000`;
};

/**
 * Get the URL of the app with protocol.
 * It returns the Vercel deployment URL if the app is deployed on Vercel
 * or local url for development.
 */
export const getUrlWithProtocol = () => {
  const vercelUrl = getVercelDeploymentUrl();
  if (vercelUrl) return `https://${vercelUrl}`;

  return `http://localhost:3000`;
};
