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

/** development | preview | production */
export const APP_ENV = (envName && envName.trim()) || "production";

/**
 * Never treat the legacy Kilode Nine web app as the native JSON API.
 * Fail closed if it is accidentally configured: the client then reports that
 * the dedicated API is missing instead of sending mobile requests to the web app.
 */
function resolveApiBase(value: string | undefined): string {
  const candidate = value?.trim();
  if (!candidate) return "";

  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:" && !(APP_ENV === "development" && url.protocol === "http:")) {
      return "";
    }
    if (url.hostname.toLowerCase() === "kilode-nine.vercel.app") {
      return "";
    }
    return url.toString().replace(/\/+$/, "");
  } catch {
    return "";
  }
}

/** Dedicated HTTPS API host; empty until explicitly configured and validated. */
export const API_BASE = resolveApiBase(envUrl);

/**
 * FORCE_MOCK must stay false in production builds.
 * When true (local UI only), API layer may return seed without network.
 */
export const FORCE_MOCK = false;

export const IS_PROD = APP_ENV === "production";
