"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));

const backendPackage = readJson("backend/package.json");
const backendVercel = readJson("backend/vercel.json");
const nativeVercel = readJson("vercel.json");

assert.equal(backendPackage.name, "kilode-native-api", "backend package must be separate from the Expo app");
assert.equal(backendPackage.private, true, "backend package must not be published");
assert.equal(backendPackage.engines?.node, "24.x", "dedicated API should pin Vercel's supported Node.js major");
assert.equal(backendVercel.$schema, "https://openapi.vercel.sh/vercel.json", "backend Vercel config schema is required");
assert.equal(backendVercel.functions?.["api/**/*.ts"]?.maxDuration, 15, "all backend TS routes must have an explicit duration cap");

for (const file of [
  "backend/api/mobile/health.ts",
  "backend/api/mobile/tracks.ts",
  "backend/api/mobile/charts.ts",
  "backend/api/mobile/library.ts",
  "backend/schema/001_music_core.sql",
  "backend/schema/002_playlist_mutations.sql",
  "backend/schema/003_shared_library_rate_limits.sql",
  "backend/schema/004_kilode_user_profiles.sql",
  "backend/api/_lib/authRoutes.ts",
  "backend/api/auth/sign-in/email.ts",
  "backend/api/auth/sign-up/email.ts",
  "backend/api/_lib/sharedIpRateLimit.ts",
  "backend/api/_lib/requestGuard.ts",
  "backend/.env.example"
]) {
  assert.equal(exists(file), true, `required backend file is missing: ${file}`);
}

assert.equal(typeof nativeVercel.buildCommand, "string", "root Vercel guard must remain in place");
assert.match(nativeVercel.buildCommand, /Expo native app/i, "root Vercel project must identify itself as the Expo app");
assert.match(nativeVercel.buildCommand, /exit 1/, "root Vercel configuration must refuse accidental native-app web deployment");
assert.equal(backendPackage.dependencies, undefined, "current API handlers should not acquire unnecessary runtime dependencies");
const backendEnv = fs.readFileSync(path.join(root, "backend/.env.example"), "utf8");
assert.ok(backendEnv.split("\n").includes("UPSTASH_REDIS_REST_URL="), "Upstash REST URL must be documented");
assert.ok(backendEnv.split("\n").includes("UPSTASH_REDIS_REST_TOKEN="), "Upstash REST token must be documented");
const publicLimiterSource = fs.readFileSync(path.join(root, "backend/api/_lib/sharedIpRateLimit.ts"), "utf8");
assert.ok(publicLimiterSource.includes('redis.call("INCR"'), "shared limiter must increment atomically in Redis");
assert.ok(publicLimiterSource.includes('redis.call("PEXPIRE"'), "shared limiter must set a fixed-window TTL");
assert.ok(publicLimiterSource.includes('"SHA-256"'), "shared limiter must hash client IPs before using them in keys");

console.log("Dedicated Kilode API project configuration verified; no deployment or database readiness is implied.");
