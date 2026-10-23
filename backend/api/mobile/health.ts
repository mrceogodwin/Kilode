import { enforceSharedIpRateLimit } from "../_lib/sharedIpRateLimit";
import { enforceRequestGuards } from "../_lib/requestGuard";

export default async function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  if (!enforceRequestGuards(req, res, { scope: "mobile-health", maxRequests: 30 })) return;
  const base = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "");
  const key = process.env.SUPABASE_ANON_KEY?.trim();
  if (!base || !key) return res.status(503).json({ ok: false, service: "kilode-native-api", status: "unconfigured", database: "not_configured" });
  if (!(await enforceSharedIpRateLimit(req, res, { scope: "health", maxRequests: 30 }))) return;
  try {
    const probe = await fetch(base + "/rest/v1/music_tracks?select=id&limit=1", {
      headers: { apikey: key, Authorization: "Bearer " + key, Accept: "application/json" }
    });
    if (!probe.ok) return res.status(503).json({ ok: false, service: "kilode-native-api", status: "degraded", database: "unavailable" });
    return res.status(200).json({ ok: true, service: "kilode-native-api", status: "ready", database: "connected" });
  } catch {
    return res.status(503).json({ ok: false, service: "kilode-native-api", status: "degraded", database: "unavailable" });
  }
}
