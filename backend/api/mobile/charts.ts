import { enforceRequestGuards } from "../_lib/requestGuard";

export default async function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  if (!enforceRequestGuards(req, res, { scope: "mobile-charts", maxRequests: 60 })) return;
  const chartKey = String(req.query?.chart || "top_50");
  if (chartKey !== "top_50" && chartKey !== "top_100") {
    return res.status(400).json({ ok: false, error: "chart must be top_50 or top_100" });
  }
  const base = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "");
  const key = process.env.SUPABASE_ANON_KEY?.trim();
  if (!base || !key) return res.status(503).json({ ok: false, error: "Verified charts are not configured" });
  const limit = chartKey === "top_50" ? 50 : 100;
  const query = new URLSearchParams({
    select: "rank,period_start,period_end,source_name,source_url,verified_at,track:music_tracks!inner(id,title,artist_name,genre,artwork_url,audio_url)",
    chart_key: "eq." + chartKey,
    verified_at: "not.is.null",
    "track.is_published": "eq.true",
    "track.rights_status": "eq.verified",
    order: "period_start.desc,rank.asc",
    limit: String(limit)
  });
  try {
    const upstream = await fetch(base + "/rest/v1/music_chart_entries?" + query.toString(), {
      headers: { apikey: key, Authorization: "Bearer " + key, Accept: "application/json" }
    });
    if (!upstream.ok) return res.status(502).json({ ok: false, error: "Verified charts are temporarily unavailable" });
    const rows = await upstream.json();
    if (!Array.isArray(rows)) return res.status(502).json({ ok: false, error: "Invalid chart response" });
    const entries = rows.map((row: any) => ({
      rank: row.rank,
      periodStart: row.period_start,
      periodEnd: row.period_end,
      source: row.source_name,
      sourceUrl: row.source_url,
      verifiedAt: row.verified_at,
      track: row.track ? {
        id: row.track.id,
        title: row.track.title,
        artist: row.track.artist_name,
        genre: row.track.genre,
        artworkUrl: row.track.artwork_url,
        audioUrl: row.track.audio_url
      } : null
    })).filter((row: any) => row.track);
    return res.status(200).json({ ok: true, source: "live", chart: chartKey, entries });
  } catch {
    return res.status(502).json({ ok: false, error: "Verified charts are temporarily unavailable" });
  }
}
