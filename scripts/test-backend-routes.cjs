"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");
const ts = require("typescript");

const ROOT = path.resolve(__dirname, "..");
const unexpectedFetch = async () => {
  throw new Error("Unexpected outbound fetch in backend route test");
};

function loadTs(relativePath, options = {}) {
  const absolutePath = path.resolve(ROOT, relativePath);
  const sourceText = fs.readFileSync(absolutePath, "utf8");
  const output = ts.transpileModule(sourceText, {
    fileName: absolutePath,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      strict: true,
      esModuleInterop: true
    }
  }).outputText;

  const sandbox = {
    exports: {},
    process: { env: { ...(options.env || {}) } },
    fetch: options.fetchImpl || unexpectedFetch,
    URLSearchParams,
    URL,
    TextEncoder,
    TextDecoder,
    setTimeout,
    clearTimeout,
    console,
    require: (specifier) => {
      if (specifier.startsWith(".")) {
        let dependencyPath = path.resolve(path.dirname(absolutePath), specifier);
        if (!path.extname(dependencyPath)) dependencyPath += ".ts";
        return loadTs(path.relative(ROOT, dependencyPath), options);
      }
      return require(specifier);
    }
  };

  vm.runInNewContext(output, sandbox, { filename: absolutePath });
  return sandbox.exports;
}

function makeResponse() {
  return {
    headers: {},
    statusCode: 200,
    payload: undefined,
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(value) {
      this.payload = value;
      return this;
    }
  };
}

function envWithSupabase() {
  return {
    SUPABASE_URL: "https://kilode-test.supabase.co/",
    SUPABASE_ANON_KEY: "test-anon-key"
  };
}

test("read-only tracks route rejects unsupported methods without fetching", async () => {
  const { default: handler } = loadTs("backend/api/mobile/tracks.ts");
  const res = makeResponse();
  await handler({ method: "POST", headers: { "x-forwarded-for": "192.0.2.10" } }, res);
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.allow, "GET");
  assert.equal(res.payload.ok, false);
});

test("catalogue returns unconfigured instead of fake live data", async () => {
  const { default: handler } = loadTs("backend/api/mobile/tracks.ts");
  const res = makeResponse();
  await handler({ method: "GET", headers: { "x-forwarded-for": "192.0.2.11" } }, res);
  assert.equal(res.statusCode, 503);
  assert.equal(res.payload.ok, false);
  assert.match(res.payload.error, /not configured/i);
});

test("charts reject unsupported chart names before fetching", async () => {
  const { default: handler } = loadTs("backend/api/mobile/charts.ts", { env: envWithSupabase() });
  const res = makeResponse();
  await handler({ method: "GET", query: { chart: "top_30" }, headers: { "x-forwarded-for": "192.0.2.12" } }, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.payload.error, /top_50 or top_100/);
});

test("charts request only verified, published tracks and map the response contract", async () => {
  let requestedUrl = "";
  const { default: handler } = loadTs("backend/api/mobile/charts.ts", {
    env: envWithSupabase(),
    fetchImpl: async (url) => {
      requestedUrl = String(url);
      return {
        ok: true,
        json: async () => [{
          rank: 1,
          period_start: "2026-10-01",
          period_end: "2026-10-31",
          source_name: "Verified test source",
          source_url: "https://example.com/chart",
          verified_at: "2026-10-20T12:00:00Z",
          track: {
            id: "00000000-0000-4000-8000-000000000001",
            title: "Test track",
            artist_name: "Test artist",
            genre: "Afrobeats",
            artwork_url: null,
            audio_url: null,
            is_published: true,
            rights_status: "verified"
          }
        }]
      };
    }
  });
  const res = makeResponse();
  await handler({ method: "GET", query: { chart: "top_50" }, headers: { "x-forwarded-for": "192.0.2.13" } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.source, "live");
  assert.equal(res.payload.entries.length, 1);
  assert.equal(res.payload.entries[0].track.artist, "Test artist");
  const parsed = new URL(requestedUrl);
  assert.equal(parsed.searchParams.get("verified_at"), "not.is.null");
  assert.equal(parsed.searchParams.get("track.rights_status"), "eq.verified");
  assert.equal(parsed.searchParams.get("track.is_published"), "eq.true");
});

test("health reports unconfigured when Supabase settings are absent", async () => {
  const { default: handler } = loadTs("backend/api/mobile/health.ts");
  const res = makeResponse();
  await handler({ method: "GET", headers: { "x-forwarded-for": "192.0.2.14" } }, res);
  assert.equal(res.statusCode, 503);
  assert.equal(res.payload.status, "unconfigured");
  assert.equal(res.payload.database, "not_configured");
});

test("library rejects a missing bearer token before making an outbound request", async () => {
  const { default: handler } = loadTs("backend/api/mobile/library.ts", { env: envWithSupabase() });
  const res = makeResponse();
  await handler({ method: "GET", headers: { "x-forwarded-for": "192.0.2.15" }, query: { resource: "saved" } }, res);
  assert.equal(res.statusCode, 401);
  assert.match(res.payload.error, /sign in/i);
});

test("library stops at Supabase Auth when the bearer session is invalid", async () => {
  const called = [];
  const { default: handler } = loadTs("backend/api/mobile/library.ts", {
    env: envWithSupabase(),
    fetchImpl: async (url) => {
      called.push(String(url));
      return { ok: false, status: 401 };
    }
  });
  const res = makeResponse();
  await handler({
    method: "GET",
    headers: { authorization: "Bearer expired-token", "x-forwarded-for": "192.0.2.16" },
    query: { resource: "saved" }
  }, res);
  assert.equal(res.statusCode, 401);
  assert.equal(called.length, 1);
  assert.match(called[0], /\/auth\/v1\/user$/);
});

test("library rejects malformed track IDs before attempting a database write", async () => {
  const called = [];
  const { default: handler } = loadTs("backend/api/mobile/library.ts", {
    env: envWithSupabase(),
    fetchImpl: async (url) => {
      called.push(String(url));
      return { ok: true, json: async () => ({ id: "user-1" }) };
    }
  });
  const res = makeResponse();
  await handler({
    method: "POST",
    headers: { authorization: "Bearer valid-test-token", "x-forwarded-for": "192.0.2.17" },
    body: { action: "save_track", trackId: "not-a-uuid" }
  }, res);
  assert.equal(res.statusCode, 400);
  assert.equal(called.length, 1);
  assert.match(called[0], /\/auth\/v1\/user$/);
});

test("library rejects oversized mutation requests before outbound calls", async () => {
  const { default: handler } = loadTs("backend/api/mobile/library.ts", { env: envWithSupabase() });
  const res = makeResponse();
  await handler({
    method: "POST",
    headers: {
      authorization: "Bearer valid-test-token",
      "content-length": "20000",
      "x-forwarded-for": "192.0.2.18"
    },
    body: { action: "save_track", trackId: "00000000-0000-4000-8000-000000000001" }
  }, res);
  assert.equal(res.statusCode, 413);
  assert.equal(res.payload.ok, false);
});

test("shared request guard rate-limits repeat requests from the same client", () => {
  const { enforceRequestGuards } = loadTs("backend/api/_lib/requestGuard.ts");
  const options = { scope: "unit-test", maxRequests: 2, windowMs: 60000, maxBodyBytes: 128 };
  const request = { method: "GET", headers: { "x-forwarded-for": "203.0.113.44" } };
  const first = makeResponse();
  const second = makeResponse();
  const third = makeResponse();
  assert.equal(enforceRequestGuards(request, first, options), true);
  assert.equal(enforceRequestGuards(request, second, options), true);
  assert.equal(enforceRequestGuards(request, third, options), false);
  assert.equal(third.statusCode, 429);
  assert.ok(third.headers["retry-after"]);
});

test("shared request guard measures mutation bodies in UTF-8 bytes", () => {
  const { enforceRequestGuards } = loadTs("backend/api/_lib/requestGuard.ts");
  const res = makeResponse();
  const allowed = enforceRequestGuards({
    method: "POST",
    headers: { "x-forwarded-for": "203.0.113.45" },
    body: { name: "é".repeat(70) }
  }, res, { scope: "body-test", maxRequests: 10, windowMs: 60000, maxBodyBytes: 100 });
  assert.equal(allowed, false);
  assert.equal(res.statusCode, 413);
});
