/**
 * PRODUCTION config — Kilode native → Kilode Nine
 * Mock is fallback only when Nine has no public JSON route yet.
 */
export const API_BASE =
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL) ||
  "https://kilode-nine.vercel.app";

/** Never ship with this true in production builds */
export const FORCE_MOCK = false;

export const APP_ENV = "production";
