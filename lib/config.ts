/** Production web app — Kilode Nine on Vercel */
export const API_BASE =
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL) ||
  "https://kilode-nine.vercel.app";

/** Force mock while mobile API routes are not public */
export const FORCE_MOCK = false;
