# Kilode Dedicated Backend Foundation

**Status: deployable scaffold and API contract only — not deployed or connected to a production database.**

This directory is designed to be the root of a separate Vercel project for the native Kilode app. The project-specific `package.json`, `vercel.json`, and `.env.example` live here; the root directory must be set to `backend`. Keep it separate from the Expo app root and from the legacy Kilode Nine/v2 site. Do not repoint either existing native-app project at this directory without verifying the target first.

## Required server environment

- `SUPABASE_URL`: URL of the dedicated Kilode Supabase project.
- `SUPABASE_ANON_KEY`: the project's public/anon API key stored as a server environment variable. Current public-read and caller-JWT routes use this key with row-level security; never put user tokens or secret keys in the mobile bundle.
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`: server-only credentials for atomic shared IP rate limiting on the public health, tracks, and charts routes. Public routes return 503 until these are configured; never expose the standard Redis REST token in the mobile app.
- `SUPABASE_SERVICE_ROLE_KEY`: do not configure or use it for current routes. Any future use requires a separately reviewed server-only operation and must never be exposed through an `EXPO_PUBLIC_*` variable.
- `KILODE_API_ENV`: `development`, `preview`, or `production`.

No production values are checked into Git. Missing environment values must yield a degraded/unconfigured response, not fake success.

## Build sequence

1. Create/reuse a dedicated Vercel project with Root Directory `backend`; provision a dedicated Supabase project and apply `schema/001_music_core.sql`, `schema/002_playlist_mutations.sql`, and `schema/003_shared_library_rate_limits.sql` in that order.
2. Implement and test authentication, profile ownership, and RLS before exposing user-specific data.
3. Implement the versioned native routes for health, tracks, charts with source/provenance, saved tracks, recent history, playlists, and artist/release metadata.
4. Add request validation, authorization, a shared rate limiter, idempotency for writes, structured redacted logs, and automated tests. The current checked-in guard caps request bodies at 16 KiB and applies a best-effort fixed-window quota per warm runtime; serverless instances do not share this counter and cold starts reset it.
5. Before production, replace or augment the per-runtime quota with a shared edge/database/Redis limiter and verify that the deployment provides a trusted client-IP header. The current quota is defense in depth, not a global abuse-prevention guarantee.
6. Add the server variables from `.env.example` to the dedicated Vercel project and deploy a preview first. Verify `/api/mobile/health`, auth failure cases, shared quota enforcement, route tests, and migration state.
7. Verify the Upstash-backed shared IP limiter for the public health/tracks/charts routes in preview, including 429 behavior and 503 failure-closed behavior when Redis is unavailable. The in-memory guard remains defense in depth only.
8. Promote the tested backend and configure the native app's `EXPO_PUBLIC_API_URL` to that dedicated HTTPS host only after all live checks pass. Until then, the app must distinguish mock/preview content from live content.


## Shared database-backed rate limiting

- After validating a bearer token, the library route calls `rpc/consume_kilode_library_rate_limit` with the same caller JWT. The database function applies a shared fixed-minute quota of 120 reads or 30 writes per authenticated account across serverless instances.
- Apply `schema/003_shared_library_rate_limits.sql` after the core and playlist migrations. The counter table is not directly readable/writable by anon or authenticated roles; the security-definer RPC uses `auth.uid()`, a fixed search path, and hardcoded allowed scopes.
- If the shared quota service is unavailable, library requests fail closed with 503. Quota exhaustion returns 429. Public tracks/charts/health endpoints still only have their per-runtime guard; a shared IP/edge limiter remains required before production.

## Playlist mutation contract

- Rename a caller-owned playlist with `PATCH /api/mobile/library` and body `{ "action": "rename_playlist", "playlistId": "<uuid>", "name": "<1–48 characters>" }`.
- Reorder all tracks with `PATCH /api/mobile/library` and body `{ "action": "reorder_playlist_tracks", "playlistId": "<uuid>", "trackIds": ["<uuid>", "..."] }`. Track IDs must be unique and must contain every track in that playlist exactly once (1–500 entries).
- Apply `schema/002_playlist_mutations.sql` after `schema/001_music_core.sql` to install the ownership-checked, RLS-respecting reorder RPC and playlist `updated_at` trigger. Reordering temporarily moves positions outside the current range before assigning the requested 0-based order, avoiding conflicts with the playlist-position unique constraint.
- These handlers are covered by the Node route regression suite. The SQL migration still needs to be applied and verified on the dedicated Supabase project before production use.

## Music data rules

- No fabricated chart positions or play counts. Chart records must include a source, period, rank, and verification timestamp.
- Audio must be licensed/authorized and use a real playable URL. Never seed made-up streaming URLs.
- Saved tracks, listening history, and playlists are device-local today. Cross-device sync requires authenticated server routes and an explicit merge/conflict policy.
- Do not store provider secrets, service-role keys, or private storage credentials in the mobile app.
