/**
 * Kilode Native client config
 *
 * Native app: mrceogodwin/Kilode (Expo + EAS).
 * A dedicated Kilode API must be explicitly configured before live requests are enabled.
 */

const envUrl =
  typeof process !== "undefined" ? process.env?.EXPO_PUBLIC_API_URL : undefined;
const envName =
  typeof process !== "undefined" ? process.env?.EXPO_PUBLIC_APP_ENV : undefined;

/** Dedicated Kilode API host; empty until explicitly configured. */
export const API_BASE = (envUrl && envUrl.trim())
  ? envUrl.trim().replace(/\\/+$/, "")
  : "";

/** development | preview | production */
export const APP_ENV = (envName && envName.trim()) || "production";

/**
 * FORCE_MOCK must stay false in production builds.
 * When true (local UI only), API layer may return seed without network.
 */
export const FORCE_MOCK = false;

export const IS_PROD = APP_ENV === "production";
