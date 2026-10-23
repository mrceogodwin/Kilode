type HeaderValue = string | string[] | undefined;

export type GuardRequest = {
  method?: string;
  headers?: Record<string, HeaderValue>;
  body?: unknown;
};

export type GuardResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): GuardResponse;
  json(value: any): unknown;
};

export type GuardOptions = {
  scope: string;
  maxRequests?: number;
  windowMs?: number;
  maxBodyBytes?: number;
};

type RateBucket = { count: number; resetAt: number };

const rateBuckets = new Map<string, RateBucket>();
const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX_REQUESTS = 60;
const DEFAULT_MAX_BODY_BYTES = 16 * 1024;

function getHeader(req: GuardRequest, name: string): string | undefined {
  const headers = req.headers || {};
  const match = Object.entries(headers).find(([key]) => key.toLowerCase() === name.toLowerCase());
  const raw = match?.[1];
  return Array.isArray(raw) ? raw[0] : raw;
}

function reject(res: GuardResponse, statusCode: number, error: string, headers?: Record<string, string>): false {
  if (headers) Object.entries(headers).forEach(([name, value]) => res.setHeader(name, value));
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(statusCode).json({ ok: false, error });
  return false;
}

function clientIdentity(req: GuardRequest): string {
  const forwarded = getHeader(req, "x-forwarded-for");
  const firstForwarded = typeof forwarded === "string" ? forwarded.split(",")[0].trim() : "";
  const realIp = (getHeader(req, "x-real-ip") || "").trim();
  return (firstForwarded || realIp || "unknown").slice(0, 160);
}

/**
 * Lightweight per-runtime request guard. This is defense in depth only:
 * serverless instances do not share this map, and it resets on cold starts.
 * Production must also use a shared edge/database rate limiter.
 */
export function enforceRequestGuards(req: GuardRequest, res: GuardResponse, options: GuardOptions): boolean {
  const maxBodyBytes = Number.isInteger(options.maxBodyBytes) && (options.maxBodyBytes as number) > 0
    ? options.maxBodyBytes as number
    : DEFAULT_MAX_BODY_BYTES;

  const declaredLength = getHeader(req, "content-length");
  if (declaredLength !== undefined) {
    const parsedLength = Number(declaredLength);
    if (!Number.isSafeInteger(parsedLength) || parsedLength < 0) {
      return reject(res, 400, "Invalid Content-Length header");
    }
    if (parsedLength > maxBodyBytes) {
      return reject(res, 413, "Request body is too large");
    }
  }

  const method = String(req.method || "GET").toUpperCase();
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method) && req.body !== undefined && req.body !== null) {
    let serializedBody: string;
    try {
      serializedBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body) || "";
    } catch {
      return reject(res, 400, "Invalid request body");
    }
    if (new TextEncoder().encode(serializedBody).byteLength > maxBodyBytes) {
      return reject(res, 413, "Request body is too large");
    }
  }

  const now = Date.now();
  if (rateBuckets.size > 5_000) {
    for (const [key, bucket] of rateBuckets) {
      if (bucket.resetAt <= now) rateBuckets.delete(key);
    }
    if (rateBuckets.size > 10_000) {
      const oldestKey = rateBuckets.keys().next().value;
      if (oldestKey) rateBuckets.delete(oldestKey);
    }
  }

  const scope = options.scope.trim();
  const maxRequests = Number.isInteger(options.maxRequests) && (options.maxRequests as number) > 0
    ? options.maxRequests as number
    : DEFAULT_MAX_REQUESTS;
  const windowMs = Number.isInteger(options.windowMs) && (options.windowMs as number) > 0
    ? options.windowMs as number
    : DEFAULT_WINDOW_MS;
  const key = scope + ":" + clientIdentity(req);
  let bucket = rateBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 1, resetAt: now + windowMs };
    rateBuckets.set(key, bucket);
  } else if (bucket.count >= maxRequests) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return reject(res, 429, "Too many requests. Please try again shortly.", {
      "Retry-After": String(retryAfter),
      "X-RateLimit-Limit": String(maxRequests),
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": String(Math.ceil(bucket.resetAt / 1000))
    });
  } else {
    bucket.count += 1;
  }

  res.setHeader("X-RateLimit-Limit", String(maxRequests));
  res.setHeader("X-RateLimit-Remaining", String(Math.max(0, maxRequests - bucket.count)));
  res.setHeader("X-RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));
  return true;
}
