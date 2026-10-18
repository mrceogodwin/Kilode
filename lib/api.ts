import { API_BASE, FORCE_MOCK } from "./config";
import { TAKES, ROOMS, NEWS, TRACKS, ACTIVITY, CAROUSEL } from "../data";

export type ApiResult<T> =
  | { ok: true; data: T; source: "live" | "mock" }
  | { ok: false; error: string; data: T; source: "mock" };

/**
 * Production client: try Kilode Nine first.
 * Mock is offline/fallback only — Nine currently returns 406 for JSON Accept.
 */
async function getJson<T>(path: string, fallback: T): Promise<ApiResult<T>> {
  if (FORCE_MOCK) {
    return { ok: true, data: fallback, source: "mock" };
  }
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 9000);
    const res = await fetch(`${API_BASE}${path}`, {
      signal: ctrl.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "KilodeNative/1.0 (iOS; Expo)",
      },
    });
    clearTimeout(t);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("json")) throw new Error("non-json");
    const data = (await res.json()) as T;
    return { ok: true, data, source: "live" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "network";
    return { ok: false, error: msg, data: fallback, source: "mock" };
  }
}

const TAKE_PATHS = ["/api/takes", "/api/listTakes", "/api/feed", "/api/posts"];
const ROOM_PATHS = ["/api/rooms", "/api/listRooms"];
const NEWS_PATHS = ["/api/news", "/api/nf_posts"];
const TRACK_PATHS = ["/api/tracks", "/api/music"];

export async function fetchTakes() {
  for (const p of TAKE_PATHS) {
    const r = await getJson(p, TAKES);
    if (r.ok && r.source === "live") return r;
  }
  return { ok: true as const, data: TAKES, source: "mock" as const };
}

export async function fetchRooms() {
  for (const p of ROOM_PATHS) {
    const r = await getJson(p, ROOMS);
    if (r.ok && r.source === "live") return r;
  }
  return { ok: true as const, data: ROOMS, source: "mock" as const };
}

export async function fetchNews() {
  for (const p of NEWS_PATHS) {
    const r = await getJson(p, NEWS);
    if (r.ok && r.source === "live") return r;
  }
  return { ok: true as const, data: NEWS, source: "mock" as const };
}

export async function fetchTracks() {
  for (const p of TRACK_PATHS) {
    const r = await getJson(p, TRACKS);
    if (r.ok && r.source === "live") return r;
  }
  return { ok: true as const, data: TRACKS, source: "mock" as const };
}

export async function fetchActivity() {
  const r = await getJson("/api/activity", ACTIVITY);
  if (r.ok && r.source === "live") return r;
  return { ok: true as const, data: ACTIVITY, source: "mock" as const };
}

export async function fetchCarousel() {
  return { ok: true as const, data: CAROUSEL, source: "mock" as const };
}

export async function postTake(body: string, token?: string | null) {
  const text = body.trim();
  if (!text) return { ok: false as const, error: "Empty", source: "mock" as const };

  const localTake = {
    id: `local-${Date.now()}`,
    name: "You",
    handle: "you",
    time: "now",
    role: "Member",
    text,
    likes: 0,
    comments: 0,
    reposts: 0,
    tags: ["take"],
  };

  if (FORCE_MOCK || !token || token === "guest" || token === "local") {
    return { ok: true as const, id: localTake.id, source: "mock" as const, take: localTake };
  }

  try {
    const res = await fetch(`${API_BASE}/api/takes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ body: text }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      ok: true as const,
      id: data.id ?? "ok",
      source: "live" as const,
      take: data.take || { ...localTake, id: data.id || localTake.id },
    };
  } catch {
    return { ok: true as const, id: localTake.id, source: "mock" as const, take: localTake };
  }
}

export async function postComment(takeId: string, body: string, token?: string | null) {
  const text = body.trim();
  if (!text) return { ok: false as const, error: "Empty" };
  try {
    if (token && token !== "guest" && token !== "local" && !FORCE_MOCK) {
      const res = await fetch(`${API_BASE}/api/takes/${takeId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body: text }),
      });
      if (res.ok) {
        const data = await res.json();
        return { ok: true as const, source: "live" as const, comment: data };
      }
    }
  } catch {
    /* fall through */
  }
  return {
    ok: true as const,
    source: "mock" as const,
    comment: {
      id: `c-${Date.now()}`,
      takeId,
      text,
      name: "You",
      time: "now",
    },
  };
}
