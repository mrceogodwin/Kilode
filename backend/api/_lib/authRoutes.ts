import { attachRedactedApiLogger } from "./redactedApiLog";
import { enforceRequestGuards } from "./requestGuard";
import { enforceSharedIpRateLimit } from "./sharedIpRateLimit";

type HeaderValue = string | string[] | undefined;
type AuthRequest = { method?: string; headers?: Record<string, HeaderValue>; body?: any };
type AuthResponse = { setHeader(name: string, value: string): void; status(code: number): AuthResponse; json(value: any): any };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-z0-9_.]{3,30}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ACCOUNT_KINDS = new Set(["member","artist","writer","advertiser","cinema","job_poster","job_seeker","vendor","renter","brand"]);

function reject(res: AuthResponse, code: number, error: string): false {
  res.setHeader("Cache-Control", "no-store");
  res.status(code).json({ ok: false, error });
  return false;
}
function cleanEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && EMAIL_RE.test(email) ? email : null;
}
async function begin(req: AuthRequest, res: AuthResponse, mode: "sign-in" | "sign-up" | "recover" | "reset") {
  const route = "auth-" + mode;
  attachRedactedApiLogger(req, res, route);
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (String(req.method || "").toUpperCase() !== "POST") {
    res.setHeader("Allow", "POST");
    reject(res, 405, "Method not allowed");
    return null;
  }
  if (!enforceRequestGuards(req, res, { scope: route, maxRequests: mode === "sign-in" ? 15 : mode === "sign-up" ? 8 : mode === "recover" ? 6 : 10, maxBodyBytes: 8 * 1024 })) return null;
  const base = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "");
  const anonKey = process.env.SUPABASE_ANON_KEY?.trim();
  if (!base || !anonKey) { reject(res, 503, "Kilode authentication is not configured"); return null; }
  if (!(await enforceSharedIpRateLimit(req, res, { scope: route, maxRequests: mode === "sign-in" ? 12 : mode === "sign-up" ? 5 : mode === "recover" ? 3 : 8 }))) return null;
  const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
  return { base, anonKey, body };
}
async function profileForUser(base: string, anonKey: string, token: string, userId: unknown) {
  if (typeof userId !== "string" || !UUID_RE.test(userId)) return null;
  const query = new URLSearchParams({ select: "username,display_name,account_kind", id: "eq." + userId, limit: "1" });
  const response = await fetch(base + "/rest/v1/kilode_user_profiles?" + query.toString(), {
    method: "GET",
    headers: { apikey: anonKey, Authorization: "Bearer " + token, Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return null;
  const rows = await response.json();
  if (!Array.isArray(rows) || rows.length !== 1) return null;
  const row = rows[0];
  if (!row || typeof row.username !== "string" || typeof row.display_name !== "string" || typeof row.account_kind !== "string" || !ACCOUNT_KINDS.has(row.account_kind)) return null;
  return { username: row.username, name: row.display_name, kind: row.account_kind };
}
async function readJson(response: any): Promise<any> { try { return await response.json(); } catch { return null; } }

export async function handleEmailSignIn(req: AuthRequest, res: AuthResponse) {
  const context = await begin(req, res, "sign-in");
  if (!context) return;
  const email = cleanEmail(context.body.email);
  const password = context.body.password;
  if (!email || typeof password !== "string" || password.length < 1 || new TextEncoder().encode(password).byteLength > 72) return reject(res, 400, "Enter a valid email address and password");
  try {
    const upstream = await fetch(context.base + "/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: { apikey: context.anonKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, password }), signal: AbortSignal.timeout(8000),
    });
    if (upstream.status === 429) { res.setHeader("Retry-After", "60"); return reject(res, 429, "Too many sign-in attempts. Try again shortly."); }
    if ([400, 401, 422].includes(upstream.status)) return reject(res, 401, "Email or password is incorrect");
    if (!upstream.ok) return reject(res, 502, "Kilode sign-in is temporarily unavailable");
    const session = await readJson(upstream);
    const token = session?.access_token;
    if (typeof token !== "string" || !token || token.length > 16_384) return reject(res, 502, "Authentication provider returned an invalid session");
    const user = await profileForUser(context.base, context.anonKey, token, session?.user?.id);
    if (!user) return reject(res, 503, "Kilode account profile is not ready. Try again later.");
    return res.status(200).json({ ok: true, token, session: { token }, user });
  } catch { return reject(res, 502, "Could not reach Kilode sign-in. Try again later."); }
}
export async function handleEmailSignUp(req: AuthRequest, res: AuthResponse) {
  const context = await begin(req, res, "sign-up");
  if (!context) return;
  const email = cleanEmail(context.body.email);
  const username = typeof context.body.username === "string" ? context.body.username.trim().toLowerCase() : "";
  const password = context.body.password;
  const displayName = typeof context.body.name === "string" ? context.body.name.trim() : "";
  const kind = typeof context.body.kind === "string" ? context.body.kind : "member";
  if (!email || !USERNAME_RE.test(username)) return reject(res, 400, "Enter a valid email and a username of 3–30 letters, numbers, underscores or periods");
  if (typeof password !== "string" || password.length < 8 || new TextEncoder().encode(password).byteLength > 72) return reject(res, 400, "Password must be at least 8 characters and no more than 72 UTF-8 bytes");
  if (displayName.length > 80) return reject(res, 400, "Display name must be 80 characters or fewer");
  if (!ACCOUNT_KINDS.has(kind)) return reject(res, 400, "Unsupported account type");
  try {
    const upstream = await fetch(context.base + "/auth/v1/signup", {
      method: "POST",
      headers: { apikey: context.anonKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, password, data: { username, display_name: displayName || username, account_kind: kind } }),
      signal: AbortSignal.timeout(8000),
    });
    if (upstream.status === 429) { res.setHeader("Retry-After", "60"); return reject(res, 429, "Too many sign-up attempts. Try again shortly."); }
    if (!upstream.ok) {
      if (upstream.status >= 500) return reject(res, 502, "Kilode registration is temporarily unavailable");
      return reject(res, 400, "Could not create this account. Check the details or try another email and username.");
    }
    const created = await readJson(upstream);
    const token = created?.access_token;
    if (typeof token !== "string" || !token) return res.status(202).json({ ok: true, requiresConfirmation: true });
    if (token.length > 16_384) return reject(res, 502, "Authentication provider returned an invalid session");
    const user = await profileForUser(context.base, context.anonKey, token, created?.user?.id);
    if (!user) return reject(res, 503, "Kilode account profile is not ready. Try again later.");
    return res.status(201).json({ ok: true, token, session: { token }, user, requiresConfirmation: false });
  } catch { return reject(res, 502, "Could not reach Kilode registration. Try again later."); }
}

function validRecoveryRedirect(): string | null {
  const value = process.env.KILODE_AUTH_REDIRECT_URL?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.username || url.password || url.search || url.hash) return null;
    if (url.protocol === "https:" && url.hostname) return url.toString();
    if (url.protocol === "kilode:" && url.hostname === "auth" && url.pathname === "/recovery") return url.toString();
    return null;
  } catch { return null; }
}

export async function handlePasswordRecovery(req: AuthRequest, res: AuthResponse) {
  const context = await begin(req, res, "recover");
  if (!context) return;
  const email = cleanEmail(context.body.email);
  if (!email) return reject(res, 400, "Enter a valid email address");
  const redirectTo = validRecoveryRedirect();
  if (!redirectTo) return reject(res, 503, "Password recovery is not configured");
  try {
    const query = new URLSearchParams({ redirect_to: redirectTo });
    const upstream = await fetch(context.base + "/auth/v1/recover?" + query.toString(), {
      method: "POST",
      headers: { apikey: context.anonKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email }),
      signal: AbortSignal.timeout(8000),
    });
    if (upstream.status === 429) {
      res.setHeader("Retry-After", "60");
      return reject(res, 429, "Too many recovery requests. Try again shortly.");
    }
    if (upstream.status >= 500) return reject(res, 502, "Password recovery is temporarily unavailable");
    // Provider 4xx responses are masked to avoid revealing whether an email is registered.
    return res.status(200).json({ ok: true });
  } catch { return reject(res, 502, "Could not reach password recovery. Try again later."); }
}

export async function handlePasswordUpdate(req: AuthRequest, res: AuthResponse) {
  const context = await begin(req, res, "reset");
  if (!context) return;
  const token = context.body.token;
  const password = context.body.password;
  if (typeof token !== "string" || token.length < 20 || token.length > 16_384) {
    return reject(res, 400, "The recovery link is invalid or expired. Request a new one.");
  }
  if (typeof password !== "string" || password.length < 8 || new TextEncoder().encode(password).byteLength > 72) {
    return reject(res, 400, "Password must be at least 8 characters and no more than 72 UTF-8 bytes");
  }

  try {
    const upstream = await fetch(context.base + "/auth/v1/user", {
      method: "PUT",
      headers: {
        apikey: context.anonKey,
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ password }),
      signal: AbortSignal.timeout(8000),
    });
    if (upstream.status === 429) {
      res.setHeader("Retry-After", "60");
      return reject(res, 429, "Too many password update attempts. Try again shortly.");
    }
    if (upstream.status === 400 || upstream.status === 401 || upstream.status === 403) {
      return reject(res, 401, "The recovery link is invalid or expired. Request a new one.");
    }
    if (!upstream.ok) return reject(res, 502, "Password could not be updated. Try again later.");
    return res.status(200).json({ ok: true });
  } catch {
    return reject(res, 502, "Could not reach password update. Try again later.");
  }
}
