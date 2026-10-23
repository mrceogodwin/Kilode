# Kilode Dedicated Backend Foundation

**Status: scaffold and contract only — not deployed or connected to a production database.**

This directory is intended to be the root of a separate Vercel project for the native Kilode app. Keep it separate from the Expo app root and from the legacy Kilode Nine/v2 site. Before linking a Vercel project, verify its Git repository and set its Root Directory to `backend`.

## Required server environment

- `SUPABASE_URL`: URL of the dedicated Kilode Supabase project.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only secret; never expose it through an `EXPO_PUBLIC_*` variable.
- `KILODE_API_ENV`: `development`, `preview`, or `production`.

No production values are checked into Git. Missing environment values must yield a degraded/unconfigured response, not fake success.

## Build sequence

1. Provision a dedicated database project and apply the SQL migrations in `schema/`.
2. Implement and test authentication, profile ownership, and RLS before exposing user-specific data.
3. Implement the versioned native routes for health, tracks, charts with source/provenance, saved tracks, recent history, playlists, and artist/release metadata.
4. Add request validation, authorization, rate limiting, idempotency for writes, structured redacted logs, and automated tests.
5. Deploy this directory as a separate Vercel project, verify health and database connectivity, then configure the native app's `EXPO_PUBLIC_API_URL` to that dedicated HTTPS host.
6. Only then mark the client source as `live`. Until then, the app must distinguish mock/preview content from live content.

## Music data rules

- No fabricated chart positions or play counts. Chart records must include a source, period, rank, and verification timestamp.
- Audio must be licensed/authorized and use a real playable URL. Never seed made-up streaming URLs.
- Saved tracks, listening history, and playlists are device-local today. Cross-device sync requires authenticated server routes and an explicit merge/conflict policy.
- Do not store provider secrets, service-role keys, or private storage credentials in the mobile app.
