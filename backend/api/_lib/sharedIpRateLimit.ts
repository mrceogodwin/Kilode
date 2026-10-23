type HeaderValue = string | string[] | undefined;

export type SharedLimitRequest = {
  headers?: Record<string, HeaderValue>;
};

export type SharedLimitResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): SharedLimitResponse;
  json(value: any): unknown;
};

export type SharedLimitOptions = {
  scope: string;
  maxRequests: number;
  windowMs?: number;
};

const DEFAULT_WINDOW_MS = 60_000;
const FIXED_WINDOW_SCRIPT = `
local count = redis.call("INCR", KEYS[1])
if count == 1 then
  redis.call("PEXPIRE", KEYS[1], tonumber(ARGV[1]))
end
local ttl = redis.call("PTTL", KEYS[1])
return { count, ttl }
`;

function getHeader(req: SharedLimitRequest, name: string): string | undefined {
  const headers = req.headers || {};
  const match = Object.entries(headers).find(([key]) => key.toLowerCase() === name.toLowerCase());
  const raw = match?.[1];
  return Array.isArray(raw) ? raw[0] : raw;
}

function failClosed(res: SharedLimitResponse, status: number, error: string): false {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(status).json({ ok: false, error });
  return false;
}

/**
 * Shared fixed-window IP limiting using Upstash Redis REST + an atomic Lua EVAL.
 * Vercel overwrites X-Forwarded-For with the public client IP, preventing spoofed
 * inbound X-Forwarded-For values. Do not use this helper behind an untrusted proxy.
 */
export async function enforceSharedIpRateLimit(
  req: SharedLimitRequest,
  res: SharedLimitResponse,
  options: SharedLimitOptions
): Promise<boolean> {
  const restUrl = process.env.UPSTASH_REDIS_REST_URL?.trim().replace(/\/+$/, "");
  const restToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!restUrl || !restToken) {
    return failClosed(res, 503, "Shared public-request protection is not configured");
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(restUrl);
  } catch {
    return failClosed(res, 503, "Shared public-request protection is misconfigured");
  }
  if (parsedUrl.protocol !== "https:" || parsedUrl.username || parsedUrl.password || parsedUrl.search || parsedUrl.hash) {
    return failClosed(res, 503, "Shared public-request protection is misconfigured");
  }

  const rawIp = getHeader(req, "x-forwarded-for");
  const clientIp = typeof rawIp === "string" ? rawIp.split(",")[0].trim() : "";
  if (!clientIp || clientIp.length > 80 || /[\r\n]/.test(clientIp)) {
    return failClosed(res, 503, "Client IP could not be determined");
  }

  if (!/^[a-z0-9-]{1,64}$/.test(options.scope) ||
      !Number.isSafeInteger(options.maxRequests) ||
      options.maxRequests < 1) {
    return failClosed(res, 503, "Shared public-request protection is misconfigured");
  }

  const windowMs = Number.isSafeInteger(options.windowMs) && (options.windowMs as number) > 0
    ? options.windowMs as number
    : DEFAULT_WINDOW_MS;

  try {
    const subtle = globalThis.crypto?.subtle;
    if (!subtle) return failClosed(res, 503, "Shared public-request protection is unavailable");
    const digest = await subtle.digest("SHA-256", new TextEncoder().encode(clientIp));
    const ipHash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    const key = "kilode:public:" + options.scope + ":" + ipHash;

    const upstream = await fetch(restUrl, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + restToken,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["EVAL", FIXED_WINDOW_SCRIPT, "1", key, String(windowMs)]),
    });
    if (!upstream.ok) return failClosed(res, 503, "Shared public-request protection is unavailable");

    const body = await upstream.json();
    const result = body?.result;
    if (!Array.isArray(result) || result.length !== 2) {
      return failClosed(res, 503, "Shared public-request protection returned an invalid response");
    }
    const count = Number(result[0]);
    const ttlMs = Number(result[1]);
    if (!Number.isSafeInteger(count) || count < 1 || !Number.isSafeInteger(ttlMs) || ttlMs < 0) {
      return failClosed(res, 503, "Shared public-request protection returned an invalid response");
    }

    const remaining = Math.max(0, options.maxRequests - count);
    const resetAtSeconds = Math.ceil((Date.now() + ttlMs) / 1000);
    res.setHeader("X-RateLimit-Limit", String(options.maxRequests));
    res.setHeader("X-RateLimit-Remaining", String(remaining));
    res.setHeader("X-RateLimit-Reset", String(resetAtSeconds));

    if (count > options.maxRequests) {
      const retryAfter = Math.max(1, Math.ceil(ttlMs / 1000));
      res.setHeader("Retry-After", String(retryAfter));
      return failClosed(res, 429, "Too many requests. Please try again shortly.");
    }
    return true;
  } catch {
    return failClosed(res, 503, "Shared public-request protection is unavailable");
  }
}
