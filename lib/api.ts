/**
 * Kilode native API client
 *
 * SOURCE OF TRUTH (Kilode-v2):
 * - Business logic is TanStack `createServerFn` modules, not a public REST catalog.
 * - takes-server.ts exports include: listTakes, saveTake, voteTake, likeTake,
 *   listTakeReplies, replyTake, repostTake, toggleFollow, connectFellow, … (53 fns)
 * - forum-server.ts: listPosts, savePost, saveComment, listMsgs, saveMsg, listTracks,
 *   listAds, getProfile, saveProfile, … (45 fns)
 * - register-server.ts: registerAccount, dbStatus
 * - Auth: better-auth at same-origin `/api/auth/*` (see src/lib/auth/client.ts)
 *
 * PRODUCTION FACT:
 * kilode-nine.vercel.app serves the HTML app + server functions.
 * Arbitrary GET with Accept: application/json typically returns non-JSON / 406.
 * Until explicit mobile-safe routes or a documented server-fn bridge exist,
 * live calls fail and the client MUST surface that — not pretend seed is live.
 *
 * FORCE_MOCK: local UI work only. Never ship true in production builds.
 */

import { API_BASE, FORCE_MOCK } from "./config";
import {
  TAKES,
  ROOMS,
  NEWS,
  TRACKS,
  ACTIVITY,
  CAROUSEL,
} from "../data";

export type DataSource = "live" | "mock" | "error";

export type ApiResult<T> = {
  ok: boolean;
  data: T;
  source: DataSource;
  error?: string;
  /** Server function name this maps to in Kilode-v2 */
  fn?: string;
};

async function tryLiveJson<T>(
  path: string,
  fallback: T,
  fnName: string
): Promise<ApiResult<T>> {
  if (FORCE_MOCK) {
    return { ok: true, data: fallback, source: "mock", fn: fnName };
  }
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 9000);
    const res = await fetch(`${API_BASE}${path}`, {
      signal: ctrl.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "KilodeNative/1.0 (iOS; Expo)",
      },
    });
    clearTimeout(timer);
    if (!res.ok) {
      return {
        ok: false,
        data: fallback,
        source: "error",
        error: `HTTP ${res.status}`,
        fn: fnName,
      };
    }
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("json")) {
      return {
        ok: false,
        data: fallback,
        source: "error",
        error: "non-json (server is HTML/server-fn app, not public REST)",
        fn: fnName,
      };
    }
    const data = (await res.json()) as T;
    return { ok: true, data, source: "live", fn: fnName };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "network";
    return { ok: false, data: fallback, source: "error", error: msg, fn: fnName };
  }
}

/** Maps to takes-server `listTakes` */
export function fetchTakes() {
  return tryLiveJson("/api/takes", TAKES as any[], "listTakes");
}

/** Maps to forum-server room/list surfaces — path provisional until mobile route exists */
export function fetchRooms() {
  return tryLiveJson("/api/rooms", ROOMS as any[], "listRooms");
}

/** Maps toward news-engine-server */
export function fetchNews() {
  return tryLiveJson("/api/news", NEWS as any[], "listNews");
}

/** Maps to forum-server `listTracks` */
export function fetchTracks() {
  return tryLiveJson("/api/tracks", TRACKS as any[], "listTracks");
}

/** Maps toward social-server notes / activity */
export function fetchActivity() {
  return tryLiveJson("/api/activity", ACTIVITY as any[], "listNotes");
}

export function fetchCarousel() {
  return tryLiveJson("/api/carousel", CAROUSEL as any[], "listCarousel");
}

/** Maps to takes-server `saveTake` */
export async function postTake(
  text: string,
  token?: string
): Promise<ApiResult<{ id: string; text: string } | null>> {
  const local = {
    id: `local-${Date.now()}`,
    text,
    name: "You",
    handle: "you",
    time: "now",
    role: "member",
    likes: 0,
    comments: 0,
    reposts: 0,
    tags: ["take"],
    factPct: 50,
  };
  if (FORCE_MOCK) {
    return { ok: true, data: local as any, source: "mock", fn: "saveTake" };
  }
  try {
    const res = await fetch(`${API_BASE}/api/takes`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "User-Agent": "KilodeNative/1.0 (iOS; Expo)",
      },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      return {
        ok: false,
        data: local as any,
        source: "error",
        error: `HTTP ${res.status}`,
        fn: "saveTake",
      };
    }
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("json")) {
      return {
        ok: false,
        data: local as any,
        source: "error",
        error: "non-json",
        fn: "saveTake",
      };
    }
    const data = await res.json();
    return { ok: true, data, source: "live", fn: "saveTake" };
  } catch (e) {
    return {
      ok: false,
      data: local as any,
      source: "error",
      error: e instanceof Error ? e.message : "network",
      fn: "saveTake",
    };
  }
}

/** Maps to takes-server `replyTake` / forum `saveComment` */
export async function postComment(
  takeId: string,
  text: string,
  token?: string
): Promise<ApiResult<{ id: string; text: string } | null>> {
  const local = { id: `c-${Date.now()}`, text, takeId };
  if (FORCE_MOCK) {
    return { ok: true, data: local, source: "mock", fn: "replyTake" };
  }
  try {
    const res = await fetch(`${API_BASE}/api/takes/${takeId}/replies`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "User-Agent": "KilodeNative/1.0 (iOS; Expo)",
      },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      return {
        ok: false,
        data: local,
        source: "error",
        error: `HTTP ${res.status}`,
        fn: "replyTake",
      };
    }
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("json")) {
      return {
        ok: false,
        data: local,
        source: "error",
        error: "non-json",
        fn: "replyTake",
      };
    }
    return { ok: true, data: await res.json(), source: "live", fn: "replyTake" };
  } catch (e) {
    return {
      ok: false,
      data: local,
      source: "error",
      error: e instanceof Error ? e.message : "network",
      fn: "replyTake",
    };
  }
}

/**
 * v2 takes-server function names (for future bridge / mobile routes).
 * Do not invent REST paths without matching server implementation.
 */
export const V2_TAKES_FNS = [
  "listTakes",
  "listLive",
  "listTrending",
  "listTakesByTag",
  "listUserTakes",
  "searchTakes",
  "getTake",
  "saveTake",
  "voteTake",
  "likeTake",
  "listTakeReplies",
  "replyTake",
  "repostTake",
  "toggleSaveTake",
  "toggleFollow",
  "connectFellow",
  "reportTake",
] as const;

export const V2_FORUM_FNS = [
  "listPosts",
  "savePost",
  "saveComment",
  "listMsgs",
  "saveMsg",
  "listTracks",
  "saveTrack",
  "listAds",
  "getProfile",
  "saveProfile",
] as const;
