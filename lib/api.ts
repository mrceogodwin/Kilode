import { API_BASE, FORCE_MOCK } from "./config";
import { TAKES, ROOMS, NEWS, TRACKS, ACTIVITY, CAROUSEL } from "../data";

export type ApiResult<T> =
  | { ok: true; data: T; source: "live" | "mock" }
  | { ok: false; error: string; data: T; source: "mock" };

async function getJson<T>(path: string, fallback: T): Promise<ApiResult<T>> {
  if (FORCE_MOCK) {
    return { ok: true, data: fallback, source: "mock" };
  }
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(`${API_BASE}${path}`, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(t);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as T;
    return { ok: true, data, source: "live" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "network";
    return { ok: false, error: msg, data: fallback, source: "mock" };
  }
}

export async function fetchTakes() {
  const paths = ["/api/takes", "/api/listTakes", "/_server/takes"];
  for (const p of paths) {
    const r = await getJson(p, TAKES);
    if (r.ok && r.source === "live") return r;
  }
  return { ok: true as const, data: TAKES, source: "mock" as const };
}

export async function fetchRooms() {
  const paths = ["/api/rooms", "/api/listRooms"];
  for (const p of paths) {
    const r = await getJson(p, ROOMS);
    if (r.ok && r.source === "live") return r;
  }
  return { ok: true as const, data: ROOMS, source: "mock" as const };
}

export async function fetchNews() {
  const paths = ["/api/news", "/api/nf_posts"];
  for (const p of paths) {
    const r = await getJson(p, NEWS);
    if (r.ok && r.source === "live") return r;
  }
  return { ok: true as const, data: NEWS, source: "mock" as const };
}

export async function fetchTracks() {
  const paths = ["/api/tracks", "/api/music"];
  for (const p of paths) {
    const r = await getJson(p, TRACKS);
    if (r.ok && r.source === "live") return r;
  }
  return { ok: true as const, data: TRACKS, source: "mock" as const };
}

export async function fetchActivity() {
  return getJson("/api/activity", ACTIVITY);
}

export async function fetchCarousel() {
  return { ok: true as const, data: CAROUSEL, source: "mock" as const };
}

export async function postTake(body: string, token?: string | null) {
  const text = body.trim();
  if (!text) return { ok: false as const, error: "Empty", source: "mock" as const };

  if (FORCE_MOCK || !token || token === "guest" || token === "local") {
    return {
      ok: true as const,
      id: `local-${Date.now()}`,
      source: "mock" as const,
      take: {
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
      },
    };
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
      take: data.take || {
        id: data.id || `live-${Date.now()}`,
        name: "You",
        handle: "you",
        time: "now",
        role: "Member",
        text,
        likes: 0,
        comments: 0,
        reposts: 0,
        tags: ["take"],
      },
    };
  } catch {
    return {
      ok: true as const,
      id: `local-${Date.now()}`,
      source: "mock" as const,
      take: {
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
      },
    };
  }
}
