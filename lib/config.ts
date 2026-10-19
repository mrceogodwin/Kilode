/**
 * Kilode native client configuration.
 *
 * Native app: mrceogodwin/Kilode (Expo + React Native)
 * Website/API: mrceogodwin/Kilode-v2 (separate Vercel project)
 *
 * Never point the native app at the legacy kilode-nine deployment.
 */
const envUrl =
  typeof process !== "undefined" ? process.env?.EXPO_PUBLIC_API_URL : undefined;
const envName =
  typeof process !== "undefined" ? process.env?.EXPO_PUBLIC_APP_ENV : undefined;

/** Kilode-v2 production API host (separate from the legacy website). */
export const API_BASE =
  (envUrl && envUrl.trim()) || "https://kilode-v2.vercel.app";

/** development | preview | production */
export const APP_ENV = (envName && envName.trim()) || "production";

/** FORCE_MOCK must stay false in production builds. */
export const FORCE_MOCK = false;

export const IS_PROD = APP_ENV === "production";
