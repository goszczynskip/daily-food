import { env } from "@tonik/env";

export const getBaseUrl = () => {
  if (typeof window !== "undefined") return window.location.origin;
  if (env.NEXT_PUBLIC_VERCEL_URL)
    return `https://${env.NEXT_PUBLIC_VERCEL_URL}`;
  return `http://localhost:3000`;
};
