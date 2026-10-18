/**
 * Kilode RN → backend targets
 * Primary: Kilode Nine / Kilode-v2 (Neon + Better Auth + server fns)
 * Override with EXPO_PUBLIC_API_URL in .env when known.
 */
export const API_BASE =
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL) ||
  "https://kilode-v2.vercel.app";

export const APP_NAME = "Kilode";
export const BUNDLE_ID = "ng.kilode.app";

/** When true, always use local mock data (no network). */
export const FORCE_MOCK = false;
