/**
 * Kilode native API client → Kilode-v2 mobile bridge
 *
 * Live paths (when deployed on the v2 host):
 *   GET  /api/mobile/health
 *   GET  /api/mobile/takes
 *   POST /api/mobile/takes
 *   GET  /api/mobile/tracks
 *
 * Production truth: if the network call fails, source is "error".
 * Seed data may fill the UI for layout only — never reported as "live".
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
  fn?: string;
};

const UA = "KilodeNative/1.0 (iOS; Expo)";

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
    const timer = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch(`${API_BASE}${path}`, {
      signal: ctrl.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": UA,
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
        error: "non-json response",
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

function normalizeTakes(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.takes)) return payload.takes;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

export async function fetchTakes(): Promise<ApiResult<any[]>> {
  const r = await tryLiveJson<any>("/api/mobile/takes", { takes: TAKES }, "listTakes");
  if (r.ok) {
    const list = normalizeTakes(r.data);
    return {
      ok: true,
      data: list,
      source: "live",
      fn: "listTakes",
    };
  }
  return {
    ok: false,
    data: TAKES as any[],
    source: "error",
    error: r.error,
    fn: "listTakes",
  };
}

export function fetchRooms() {
  return tryLiveJson("/api/mobile/rooms", ROOMS as any[], "listRooms");
}

export function fetchNews() {
  return tryLiveJson("/api/mobile/news", NEWS as any[], "listNews");
}

export async function fetchTracks(): Promise<ApiResult<any[]>> {
  const r = await tryLiveJson<any>("/api/mobile/tracks", { tracks: TRACKS }, "listTracks");
  if (r.ok) {
    const list = Array.isArray(r.data)
      ? r.data
      : Array.isArray(r.data?.tracks)
        ? r.data.tracks
        : [];
    return { ok: true, data: list, source: "live", fn: "listTracks" };
  }
  return {
    ok: false,
    data: TRACKS as any[],
    source: "error",
    error: r.error,
    fn: "listTracks",
  };
}

export function fetchActivity() {
  return tryLiveJson("/api/mobile/activity", ACTIVITY as any[], "listNotes");
}

export function fetchCarousel() {
  return tryLiveJson("/api/mobile/carousel", CAROUSEL as any[], "listCarousel");
}

export async function fetchHealth(): Promise<ApiResult<{ ok: boolean }>> {
  return tryLiveJson("/api/mobile/health", { ok: false }, "health");
}

export async function postTake(
  text: string,
  token?: string
): Promise<ApiResult<any>> {
  const local = {
    id: `local-${Date.now()}`,
    text,
    body: text,
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
    return { ok: true, data: local, source: "mock", fn: "saveTake" };
  }
  try {
    const res = await fetch(`${API_BASE}/api/mobile/takes`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "User-Agent": UA,
      },
      body: JSON.stringify({ body: text, kind: "take" }),
    });
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("json")) {
      return { ok: false, data: local, source: "error", error: "non-json", fn: "saveTake" };
    }
    const data = await res.json();
    if (!res.ok || data?.ok === false) {
      return {
        ok: false,
        data: local,
        source: "error",
        error: data?.error || data?.reason || `HTTP ${res.status}`,
        fn: "saveTake",
      };
    }
    return { ok: true, data: data.take || data, source: "live", fn: "saveTake" };
  } catch (e) {
    return {
      ok: false,
      data: local,
      source: "error",
      error: e instanceof Error ? e.message : "network",
      fn: "saveTake",
    };
  }
}

export async function postComment(
  takeId: string,
  text: string,
  token?: string
): Promise<ApiResult<any>> {
  const local = { id: `c-${Date.now()}`, text, takeId };
  if (FORCE_MOCK) {
    return { ok: true, data: local, source: "mock", fn: "replyTake" };
  }
  try {
    const res = await fetch(
      `${API_BASE}/api/mobile/takes/${encodeURIComponent(takeId)}/replies`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "User-Agent": UA,
        },
        body: JSON.stringify({ body: text }),
      }
    );
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("json")) {
      return { ok: false, data: local, source: "error", error: "non-json", fn: "replyTake" };
    }
    const data = await res.json();
    if (!res.ok || data?.ok === false) {
      return {
        ok: false,
        data: local,
        source: "error",
        error: data?.error || data?.reason || `HTTP ${res.status}`,
        fn: "replyTake",
      };
    }
    return { ok: true, data, source: "live", fn: "replyTake" };
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
