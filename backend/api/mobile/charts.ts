import { attachRedactedApiLogger } from "../_lib/redactedApiLog";
import { enforceSharedIpRateLimit } from "../_lib/sharedIpRateLimit";
import { enforceRequestGuards } from "../_lib/requestGuard";

export default async function handler(req: any, res: any) {
  attachRedactedApiLogger(req, res, "mobile-charts");
  res.setHeader("Cache-Control", "private, no-store");
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
  if (!(await enforceSharedIpRateLimit(req, res, { scope: "charts", maxRequests: 60 }))) return;

  const headers = { apikey: key, Authorization: "Bearer " + key, Accept: "application/json" };
  const limit = chartKey === "top_50" ? 50 : 100;
  const commonFilters: Record<string, string> = {
    chart_key: "eq." + chartKey,
    verified_at: "not.is.null",
    "track.is_published": "eq.true",
    "track.rights_status": "eq.verified",
  };

  try {
    // Select the newest verified period first. Fetching the full Top 50/100
    // with only a period_start sort can append older periods when a period is sparse.
    const periodQuery = new URLSearchParams({
      select: "period_start,period_end,track:music_tracks!inner(id)",
      ...commonFilters,
      order: "period_start.desc,period_end.desc,verified_at.desc",
      limit: "1",
    });
    const periodResponse = await fetch(base + "/rest/v1/music_chart_entries?" + periodQuery.toString(), { headers });
    if (!periodResponse.ok) return res.status(502).json({ ok: false, error: "Verified charts are temporarily unavailable" });
    const periodRows = await periodResponse.json();
    if (!Array.isArray(periodRows)) return res.status(502).json({ ok: false, error: "Invalid chart period response" });

    if (periodRows.length === 0) {
      return res.status(200).json({ ok: true, source: "live", chart: chartKey, periodStart: null, periodEnd: null, entries: [] });
    }

    const periodStart = periodRows[0]?.period_start;
    const periodEnd = periodRows[0]?.period_end;
    if (
      typeof periodStart !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(periodStart) ||
      typeof periodEnd !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(periodEnd)
    ) {
      return res.status(502).json({ ok: false, error: "Invalid chart period response" });
    }

    const query = new URLSearchParams({
      select: "rank,period_start,period_end,source_name,source_url,verified_at,track:music_tracks!inner(id,title,artist_name,genre,artwork_url,audio_url)",
      ...commonFilters,
      period_start: "eq." + periodStart,
      period_end: "eq." + periodEnd,
      order: "rank.asc,verified_at.desc",
      limit: String(limit),
    });
    const upstream = await fetch(base + "/rest/v1/music_chart_entries?" + query.toString(), { headers });
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
    return res.status(200).json({ ok: true, source: "live", chart: chartKey, periodStart, periodEnd, entries });
  } catch {
    return res.status(502).json({ ok: false, error: "Verified charts are temporarily unavailable" });
  }
}
