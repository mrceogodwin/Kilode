/**
 * Kilode native client configuration.
 *
 * Product: Expo React Native app in mrceogodwin/Kilode.
 *
 * Backend policy (product decision):
 * - Kilode iOS/Android uses a **dedicated** backend (recommended: separate Supabase project).
 * - Do **not** use kilode-nine.vercel.app or Kilode-v2 as the application backend for this app.
 * - Vercel preview is a visual export only; it is not the system of record for native data.
 *
 * Until EXPO_PUBLIC_SUPABASE_URL (and anon key) or EXPO_PUBLIC_API_URL are set,
 * the client runs in offline/seed mode with local sessions labelled localOnly.
 */

const env = (key: string): string | undefined => {
  if (typeof process === "undefined") return undefined;
  const v = process.env?.[key];
  return v && String(v).trim() ? String(v).trim() : undefined;
};

/** Optional custom HTTPS API (Edge Functions / BFF). Empty = not configured. */
export const API_BASE = env("EXPO_PUBLIC_API_URL") || "";

/** Dedicated Supabase project URL (https://xxxx.supabase.co). */
export const SUPABASE_URL = env("EXPO_PUBLIC_SUPABASE_URL") || "";

/** Supabase anon (publishable) key only — never the service_role key. */
export const SUPABASE_ANON_KEY = env("EXPO_PUBLIC_SUPABASE_ANON_KEY") || "";

/** development | preview | production */
export const APP_ENV = env("EXPO_PUBLIC_APP_ENV") || "development";

/**
 * FORCE_MOCK forces seed data even if a backend URL is set.
 * Keep false for production builds once a dedicated backend is live.
 */
export const FORCE_MOCK = env("EXPO_PUBLIC_FORCE_MOCK") === "true";

export const IS_PROD = APP_ENV === "production";

export type BackendMode = "offline" | "supabase" | "custom_api";

/** Resolved backend mode — never implies live data without credentials. */
export function getBackendMode(): BackendMode {
  if (FORCE_MOCK) return "offline";
  if (SUPABASE_URL && SUPABASE_ANON_KEY) return "supabase";
  if (API_BASE) return "custom_api";
  return "offline";
}

export function isBackendConfigured(): boolean {
  return getBackendMode() !== "offline";
}
