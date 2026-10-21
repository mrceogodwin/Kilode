import * as FileSystem from "expo-file-system";
/**
 * Kilode native API client → dedicated Kilode API (configured explicitly)
 *
 * Live paths (when a dedicated Kilode API is configured):
 *   GET  /api/mobile/health
 *   GET  /api/mobile/takes
 *   POST /api/mobile/takes
 *   GET  /api/mobile/music/tracks
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
  nextCursor?: string | null;
  hasMore?: boolean;
};

const UA = "KilodeNative/1.0 (iOS; Expo)";

// Writes must time out too: a stalled connection should never leave a composer
// waiting indefinitely. Keep the timeout bounded for slower mobile networks.
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 12000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error("Request timed out. Check your connection and try again.");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function tryLiveJson<T>(
  path: string,
  fallback: T,
  fnName: string
): Promise<ApiResult<T>> {
  if (FORCE_MOCK) {
    return { ok: true, data: fallback, source: "mock", fn: fnName };
  }
  if (!API_BASE) {
    return { ok: false, data: fallback, source: "error", error: "Dedicated Kilode API is not configured", fn: fnName };
  }
  let timer: ReturnType<typeof setTimeout> | undefined;
  const ctrl = new AbortController();
  try {
    timer = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch(`${API_BASE}${path}`, {
      signal: ctrl.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": UA,
      },
    });
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
    const msg = ctrl.signal.aborted
      ? "Request timed out. Check your connection and try again."
      : e instanceof Error
        ? e.message
        : "Network request failed. Check your connection and try again.";
    return { ok: false, data: fallback, source: "error", error: msg, fn: fnName };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function normalizeTakes(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  if (Array.isArray(payload.takes)) return payload.takes;
  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && typeof payload.data === "object") {
    if (Array.isArray(payload.data.takes)) return payload.data.takes;
    if (Array.isArray(payload.data.data)) return payload.data.data;
  }
  return [];
}

function paginationPayload(payload: any): any {
  if (payload?.pagination && typeof payload.pagination === "object") return payload;
  if (payload?.data && typeof payload.data === "object") return payload.data;
  return payload;
}

export async function fetchTakes(cursor?: string | null): Promise<ApiResult<any[]>> {
  const params = new URLSearchParams({ limit: "20" });
  if (cursor) params.set("cursor", cursor);
  const r = await tryLiveJson<any>(`/api/mobile/takes?${params.toString()}`, { takes: TAKES }, "listTakes");
  if (r.ok) {
    const list = normalizeTakes(r.data);
    const page = paginationPayload(r.data);
    const nextCursor = typeof page?.nextCursor === "string"
      ? page.nextCursor
      : typeof page?.next_cursor === "string"
        ? page.next_cursor
        : typeof page?.pagination?.nextCursor === "string"
          ? page.pagination.nextCursor
          : typeof page?.pagination?.next_cursor === "string"
            ? page.pagination.next_cursor
            : null;
    const hasMore = typeof page?.hasMore === "boolean"
      ? page.hasMore
      : typeof page?.has_more === "boolean"
        ? page.has_more
        : typeof page?.pagination?.hasMore === "boolean"
          ? page.pagination.hasMore
          : typeof page?.pagination?.has_more === "boolean"
            ? page.pagination.has_more
            : Boolean(nextCursor);
    return {
      ok: true,
      data: list,
      source: "live",
      nextCursor,
      hasMore: hasMore && Boolean(nextCursor),
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

export type MusicUploadRequest = {
  fileName: string;
  contentType: string;
  sizeBytes: number;
  title: string;
  genre?: string;
};

export type MusicUploadTicket = {
  uploadId: string;
  uploadUrl: string;
  audioAssetKey?: string;
  expiresAt?: string;
};

async function requestMusicJson<T>(
  path: string,
  method: "GET" | "POST",
  token: string,
  body?: Record<string, unknown>
): Promise<ApiResult<T>> {
  const empty = null as T;
  if (!API_BASE) {
    return { ok: false, data: empty, source: "error", error: "Dedicated Kilode API is not configured", fn: "music" };
  }
  if (!token.trim() || token === "guest" || token === "local" || token === "live") {
    return { ok: false, data: empty, source: "error", error: "Sign in with a real Kilode artist account to use music uploads.", fn: "music" };
  }
  try {
    const response = await fetchWithTimeout(`${API_BASE}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("json") ? await response.json() : null;
    if (!response.ok) {
      return {
        ok: false,
        data: empty,
        source: "error",
        error: payload && typeof payload === "object"
          ? String((payload as any).message || (payload as any).error || `HTTP ${response.status}`)
          : `HTTP ${response.status}`,
        fn: "music",
      };
    }
    if (!payload || typeof payload !== "object") {
      return { ok: false, data: empty, source: "error", error: "Music API returned an invalid response.", fn: "music" };
    }
    return { ok: true, data: payload as T, source: "live", fn: "music" };
  } catch (error) {
    return {
      ok: false,
      data: empty,
      source: "error",
      error: error instanceof Error ? error.message : "Music request failed.",
      fn: "music",
    };
  }
}

export function requestMusicUpload(token: string, input: MusicUploadRequest): Promise<ApiResult<MusicUploadTicket>> {
  return requestMusicJson<MusicUploadTicket>("/api/mobile/music/uploads", "POST", token, input);
}


export async function uploadMusicAsset(
  uploadUrl: string,
  fileUri: string,
  contentType: string
): Promise<{ ok: boolean; error?: string }> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(uploadUrl);
  } catch {
    return { ok: false, error: "The music service returned an invalid upload URL." };
  }
  if (parsedUrl.protocol !== "https:") {
    return { ok: false, error: "Secure HTTPS upload is required." };
  }
  if (!fileUri || (!fileUri.startsWith("file://") && !fileUri.startsWith("content://"))) {
    return { ok: false, error: "The selected audio file is no longer accessible. Select it again." };
  }
  try {
    const result = await FileSystem.uploadAsync(uploadUrl, fileUri, {
      httpMethod: "PUT",
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      headers: { "Content-Type": contentType || "application/octet-stream" },
    });
    if (result.status < 200 || result.status >= 300) {
      return { ok: false, error: `Audio upload failed (HTTP ${result.status}).` };
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Audio upload failed. Check your connection and try again.",
    };
  }
}

type MusicUploadState = { uploadId: string; state: string; trackId?: string; track_id?: string };

async function normalizeMusicUploadState(result: ApiResult<MusicUploadState>): Promise<ApiResult<{ uploadId: string; state: string; trackId?: string }>> {
  if (!result.ok || !result.data) return result as ApiResult<{ uploadId: string; state: string; trackId?: string }>;
  const raw = result.data as MusicUploadState;
  return {
    ...result,
    data: {
      ...raw,
      trackId: typeof raw.trackId === "string" ? raw.trackId : typeof raw.track_id === "string" ? raw.track_id : undefined,
    },
  };
}

export async function completeMusicUpload(token: string, uploadId: string): Promise<ApiResult<{ uploadId: string; state: string; trackId?: string }>> {
  const result = await requestMusicJson<MusicUploadState>(
    `/api/mobile/music/uploads/${encodeURIComponent(uploadId)}/complete`, "POST", token, {}
  );
  return normalizeMusicUploadState(result);
}

export async function getMusicUploadStatus(token: string, uploadId: string): Promise<ApiResult<{ uploadId: string; state: string; trackId?: string }>> {
  const result = await requestMusicJson<MusicUploadState>(
    `/api/mobile/music/uploads/${encodeURIComponent(uploadId)}`, "GET", token
  );
  return normalizeMusicUploadState(result);
}

export function publishMusicTrack(token: string, trackId: string, input: {
  title: string;
  genre?: string;
  rightsConfirmation: boolean;
}): Promise<ApiResult<{ trackId: string; state: string }>> {
  return requestMusicJson<{ trackId: string; state: string }>(
    `/api/mobile/music/tracks/${encodeURIComponent(trackId)}/publish`, "POST", token, input
  );
}

export function getMusicPlayback(token: string, trackId: string): Promise<ApiResult<{ url: string; expiresAt?: string }>> {
  return requestMusicJson<{ url: string; expiresAt?: string }>(
    `/api/mobile/music/tracks/${encodeURIComponent(trackId)}/playback`, "GET", token
  );
}

export function recordMusicEvent(token: string, trackId: string, eventType: "play_started" | "play_completed" | "like" | "unlike"): Promise<ApiResult<{ accepted: boolean }>> {
  return requestMusicJson<{ accepted: boolean }>(
    `/api/mobile/music/tracks/${encodeURIComponent(trackId)}/events`, "POST", token, { eventType }
  );
}

export async function fetchTracks(): Promise<ApiResult<any[]>> {
  const r = await tryLiveJson<any>("/api/mobile/music/tracks", { tracks: TRACKS }, "listTracks");
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
  if (!API_BASE) {
    return { ok: false, data: local, source: "error", error: "Dedicated Kilode API is not configured", fn: "saveTake" };
  }
  try {
    const res = await fetchWithTimeout(`${API_BASE}/api/mobile/takes`, {
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
  if (!API_BASE) {
    return { ok: false, data: local, source: "error", error: "Dedicated Kilode API is not configured", fn: "replyTake" };
  }
  try {
    const res = await fetchWithTimeout(
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
