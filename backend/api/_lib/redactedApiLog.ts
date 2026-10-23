type HeaderValue = string | string[] | undefined;

type LogRequest = {
  method?: string;
  headers?: Record<string, HeaderValue>;
};

type LogResponse = {
  status(code: number): LogResponse;
  json(value: any): unknown;
};

function firstHeader(headers: Record<string, HeaderValue> | undefined, name: string): string | undefined {
  const match = Object.entries(headers || {}).find(([key]) => key.toLowerCase() === name.toLowerCase());
  const value = match?.[1];
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Structured request-completion logs. Only fixed route/method/status/timing and a
 * sanitized correlation ID are recorded. Never log IP, URL/query, headers, body,
 * user IDs, provider responses, or exception messages.
 */
export function attachRedactedApiLogger(req: LogRequest, res: LogResponse, route: string): void {
  const startedAt = Date.now();
  const rawId = firstHeader(req.headers, "x-vercel-id");
  const requestId = rawId && /^[A-Za-z0-9:_.-]{1,120}$/.test(rawId)
    ? rawId
    : (globalThis.crypto?.randomUUID?.() || "unavailable");
  const method = String(req.method || "UNKNOWN").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 12) || "UNKNOWN";
  let statusCode = 200;
  let logged = false;

  const originalStatus = res.status.bind(res);
  const originalJson = res.json.bind(res);

  res.status = (code: number) => {
    statusCode = Number.isInteger(code) && code >= 100 && code <= 599 ? code : 500;
    return originalStatus(code);
  };
  res.json = (payload: any) => {
    if (!logged) {
      logged = true;
      try {
        console.info(JSON.stringify({
          level: "info",
          event: "api_request_complete",
          requestId,
          route,
          method,
          status: statusCode,
          durationMs: Math.max(0, Date.now() - startedAt)
        }));
      } catch {
        // Observability must never interrupt a response.
      }
    }
    return originalJson(payload);
  };
}
