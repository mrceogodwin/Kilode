/**
 * Kilode Native client config
 *
 * Website / API product: mrceogodwin/Kilode-v2 (Vercel)
 * This app:             mrceogodwin/Kilode (Expo + EAS only)
 *
 * Do not deploy this repository as the website.
 */

const envUrl =
  typeof process !== "undefined" ? process.env?.EXPO_PUBLIC_API_URL : undefined;
const envName =
  typeof process !== "undefined" ? process.env?.EXPO_PUBLIC_APP_ENV : undefined;

/** Production API host for Kilode-v2 mobile bridge */
export const API_BASE = (envUrl && envUrl.trim()) || "https://kilode-nine.vercel.app";

/** development | preview | production */
export const APP_ENV = (envName && envName.trim()) || "production";

/**
 * FORCE_MOCK must stay false in production builds.
 * When true (local UI only), API layer may return seed without network.
 */
export const FORCE_MOCK = false;

export const IS_PROD = APP_ENV === "production";
