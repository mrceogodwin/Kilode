export default function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return res.status(503).json({ ok: false, service: "kilode-native-api", status: "unconfigured" });
  }
  return res.status(503).json({ ok: false, service: "kilode-native-api", status: "database_probe_not_implemented" });
}
