import { enforceRequestGuards } from "../_lib/requestGuard";

/**
 * Kilode native Music library API.
 *
 * All user data is accessed with the caller's Supabase access token so Postgres
 * RLS enforces ownership. Never use a service-role key in this route.
 *
 * GET  ?resource=saved|history|playlists
 * POST { action: save_track|record_play|create_playlist|add_playlist_track, ... }
 * DELETE { action: unsave_track|clear_history|delete_playlist|remove_playlist_track, ... }
 */
type RequestLike = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
  body?: any;
};
type ResponseLike = {
  setHeader(name: string, value: string): void;
  status(code: number): ResponseLike;
  json(value: any): any;
};

function bearerToken(req: RequestLike): string | null {
  const raw = req.headers?.authorization ?? req.headers?.Authorization;
  const header = Array.isArray(raw) ? raw[0] : raw;
  const match = typeof header === "string" ? header.match(/^Bearer\s+(.+)$/i) : null;
  return match?.[1]?.trim() || null;
}

function cleanId(value: unknown): string | null {
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) return null;
  return value;
}

function cleanName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.trim();
  return name.length >= 1 && name.length <= 48 ? name : null;
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("Vary", "Authorization");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (!["GET", "POST", "DELETE"].includes(String(req.method || "").toUpperCase())) {
    res.setHeader("Allow", "GET, POST, DELETE");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (!enforceRequestGuards(req, res, { scope: "mobile-library", maxRequests: 60 })) return;
  const base = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "");
  const anonKey = process.env.SUPABASE_ANON_KEY?.trim();
  const token = bearerToken(req);
  if (!base || !anonKey) return res.status(503).json({ ok: false, error: "Music library API is not configured" });
  if (!token) return res.status(401).json({ ok: false, error: "Sign in to sync your music library" });

  const headers = {
    apikey: anonKey,
    Authorization: "Bearer " + token,
    Accept: "application/json",
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  try {
    // Validate the access token with Supabase Auth before issuing any data query.
    const identity = await fetch(base + "/auth/v1/user", {
      headers: { apikey: anonKey, Authorization: "Bearer " + token, Accept: "application/json" },
    });
    if (!identity.ok) return res.status(401).json({ ok: false, error: "Session is invalid or expired" });
    const user = await identity.json();
    if (!user || typeof user.id !== "string") return res.status(401).json({ ok: false, error: "Session is invalid or expired" });

    const method = String(req.method || "GET").toUpperCase();
    const resource = typeof req.query?.resource === "string" ? req.query.resource : "saved";
    const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};

    if (method === "GET") {
      const paths: Record<string, string> = {
        saved: "/rest/v1/music_saved_tracks?select=created_at,track:music_tracks!inner(id,title,artist_name,album_name,genre,artwork_url,audio_url,duration_seconds)&order=created_at.desc&limit=500",
        history: "/rest/v1/music_listening_history?select=id,played_at,track:music_tracks!inner(id,title,artist_name,album_name,genre,artwork_url,audio_url,duration_seconds)&order=played_at.desc&limit=40",
        playlists: "/rest/v1/music_playlists?select=id,name,created_at,updated_at,tracks:music_playlist_tracks(position,track:music_tracks!inner(id,title,artist_name,album_name,genre,artwork_url,audio_url,duration_seconds))&order=updated_at.desc&limit=100",
      };
      if (!paths[resource]) return res.status(400).json({ ok: false, error: "resource must be saved, history, or playlists" });
      const upstream = await fetch(base + paths[resource], { headers });
      if (!upstream.ok) return res.status(502).json({ ok: false, error: "Could not load your music library" });
      const rows = await upstream.json();
      if (!Array.isArray(rows)) return res.status(502).json({ ok: false, error: "Invalid music library response" });
      return res.status(200).json({ ok: true, source: "live", resource, data: rows });
    }

    const action = typeof body.action === "string" ? body.action : "";
    let path = "";
    let payload: any = undefined;
    let upstreamMethod = method;

    if (method === "POST" && action === "save_track") {
      const trackId = cleanId(body.trackId);
      if (!trackId) return res.status(400).json({ ok: false, error: "A valid trackId is required" });
      path = "/rest/v1/music_saved_tracks";
      payload = { user_id: user.id, track_id: trackId };
      upstreamMethod = "POST";
    } else if (method === "POST" && action === "record_play") {
      const trackId = cleanId(body.trackId);
      if (!trackId) return res.status(400).json({ ok: false, error: "A valid trackId is required" });
      path = "/rest/v1/music_listening_history";
      payload = { user_id: user.id, track_id: trackId };
      upstreamMethod = "POST";
    } else if (method === "POST" && action === "create_playlist") {
      const name = cleanName(body.name);
      if (!name) return res.status(400).json({ ok: false, error: "Playlist name must be 1–48 characters" });
      path = "/rest/v1/music_playlists";
      payload = { user_id: user.id, name };
      upstreamMethod = "POST";
    } else if (method === "POST" && action === "add_playlist_track") {
      const playlistId = cleanId(body.playlistId);
      const trackId = cleanId(body.trackId);
      const position = Number(body.position);
      if (!playlistId || !trackId || !Number.isInteger(position) || position < 0 || position > 10000) {
        return res.status(400).json({ ok: false, error: "Valid playlistId, trackId, and non-negative position are required" });
      }
      // The parent playlist RLS policy ensures the caller owns this playlist.
      path = "/rest/v1/music_playlist_tracks";
      payload = { playlist_id: playlistId, track_id: trackId, position };
      upstreamMethod = "POST";
    } else if (method === "DELETE" && action === "unsave_track") {
      const trackId = cleanId(body.trackId);
      if (!trackId) return res.status(400).json({ ok: false, error: "A valid trackId is required" });
      path = "/rest/v1/music_saved_tracks?track_id=eq." + trackId;
    } else if (method === "DELETE" && action === "clear_history") {
      path = "/rest/v1/music_listening_history?id=not.is.null";
    } else if (method === "DELETE" && action === "delete_playlist") {
      const playlistId = cleanId(body.playlistId);
      if (!playlistId) return res.status(400).json({ ok: false, error: "A valid playlistId is required" });
      path = "/rest/v1/music_playlists?id=eq." + playlistId;
    } else if (method === "DELETE" && action === "remove_playlist_track") {
      const playlistId = cleanId(body.playlistId);
      const trackId = cleanId(body.trackId);
      if (!playlistId || !trackId) return res.status(400).json({ ok: false, error: "Valid playlistId and trackId are required" });
      path = "/rest/v1/music_playlist_tracks?playlist_id=eq." + playlistId + "&track_id=eq." + trackId;
    } else {
      return res.status(400).json({ ok: false, error: "Unsupported library action" });
    }

    const upstream = await fetch(base + path, {
      method: upstreamMethod,
      headers: { ...headers, Prefer: method === "DELETE" ? "return=minimal" : "return=representation" },
      ...(payload !== undefined ? { body: JSON.stringify(payload) } : {}),
    });
    if (!upstream.ok) {
      // Keep provider details private; RLS and unique constraints intentionally reject
      // cross-user writes, duplicate saves, and invalid track references.
      if (upstream.status === 401 || upstream.status === 403) return res.status(403).json({ ok: false, error: "You are not allowed to change this library item" });
      if (upstream.status === 409 || upstream.status === 422) return res.status(409).json({ ok: false, error: "This library change conflicts with existing data" });
      return res.status(502).json({ ok: false, error: "Could not update your music library" });
    }
    const responseText = method === "DELETE" ? "" : await upstream.text();
    let data: any = null;
    if (responseText) {
      try { data = JSON.parse(responseText); } catch { return res.status(502).json({ ok: false, error: "Invalid music library response" }); }
    }
    return res.status(method === "DELETE" ? 200 : 200).json({ ok: true, source: "live", action, data });
  } catch {
    return res.status(502).json({ ok: false, error: "Music library is temporarily unavailable" });
  }
}
