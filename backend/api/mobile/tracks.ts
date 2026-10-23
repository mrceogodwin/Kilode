import { enforceSharedIpRateLimit } from "../_lib/sharedIpRateLimit";
import { enforceRequestGuards } from "../_lib/requestGuard";

export default async function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  if (!enforceRequestGuards(req, res, { scope: "mobile-tracks", maxRequests: 60 })) return;
  const base = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "");
  const key = process.env.SUPABASE_ANON_KEY?.trim();
  if (!base || !key) return res.status(503).json({ ok: false, error: "Music catalogue is not configured" });
  if (!(await enforceSharedIpRateLimit(req, res, { scope: "tracks", maxRequests: 60 }))) return;
  try {
    const upstream = await fetch(base + "/rest/v1/music_tracks?select=id,external_id,title,artist_name,album_name,genre,artwork_url,audio_url,duration_seconds&is_published=eq.true&rights_status=eq.verified&order=artist_name.asc,title.asc&limit=200", {
      headers: { apikey: key, Authorization: "Bearer " + key, Accept: "application/json" }
    });
    if (!upstream.ok) return res.status(502).json({ ok: false, error: "Music catalogue is temporarily unavailable" });
    const rows = await upstream.json();
    if (!Array.isArray(rows)) return res.status(502).json({ ok: false, error: "Invalid catalogue response" });
    const tracks = rows.map((row: any) => ({
      id: row.id,
      externalId: row.external_id,
      title: row.title,
      artist: row.artist_name,
      album: row.album_name,
      genre: row.genre,
      artworkUrl: row.artwork_url,
      audioUrl: row.audio_url,
      durationSeconds: row.duration_seconds
    }));
    return res.status(200).json({ ok: true, source: "live", tracks });
  } catch {
    return res.status(502).json({ ok: false, error: "Music catalogue is temporarily unavailable" });
  }
}
