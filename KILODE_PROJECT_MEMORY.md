# KILODE — PROJECT MEMORY & BUILD RULES

Last updated: 2026-10-23  
Repository: https://github.com/mrceogodwin/Kilode  
Branch: `main`  
App: Kilode Native — Expo SDK 51 / React Native 0.74 / TypeScript  
Bundle ID: `ng.kilode.app`

## Non-negotiable product identity
- Build Kilode as its own premium native mobile product. Every screen and component must feel deliberately branded to Kilode, not like a generic SaaS template or copied music app.
- Visual direction: premium black / off-white / restrained gold; avoid generic blue-first styling. Preserve existing design tokens and polish interactions, typography, spacing, accessibility, and empty/error/loading states.
- Prioritize the native Expo React Native app on `main`. A Vercel/web preview is only a preview of source, not the native product and not the backend.
- Do not use the legacy Kilode Nine/v2 web app as the backend or treat it as the source of truth.
- Work in focused, complete slices. Music is the current active system; finish, test, and document it before casually jumping to unrelated modules.

## Working method
1. Inspect current `main`, the exact file, current blob SHA, latest commits, and workflow status before changing code. Never edit from stale snippets.
2. Fix real implementation defects, not only surface symptoms. Keep TypeScript strict, handle async races, errors, cancellation, empty states, and accessibility.
3. Make the smallest coherent change; do not overwrite unrelated work or introduce fake data to make a screen look complete.
4. Commit with a clear conventional message, then inspect the resulting diff and wait for GitHub Actions. Report the actual commit URL and exact workflow outcomes.
5. A cancelled workflow is **not a pass** and does not by itself prove the code failed. A failed workflow requires reading its job/step logs and fixing the specific error. Never call a feature production-ready from a typecheck alone.
6. Distinguish native CI/export checks from a signed iOS build, physical-device test, TestFlight release, or production deployment. Never claim the latter without evidence.

## Current focus: Music
- Music includes Discover, Search, Charts, Artists, Genres, Library, playlists, recent history, saved tracks, queue, and playback.
- Top 50 and Top 100 options must not display invented chart rankings. Show a clear honest no-data state until verified chart data is connected.
- Never invent audio URLs, artist rankings, play counts, revenue, credits, or backend success.
- Playback uses `lib/musicPlayer.ts`; local saved/recent/playlist persistence is in `lib/musicLibrary.ts`.
- Recent-history writes and reads are serialized through a mutation queue; screen refresh must wait for pending writes and prevent stale async reads overwriting newer UI state.
- Keep controls independent: tapping a row plays/opens as intended; save and options controls must not accidentally trigger row playback.
- Audio can only be called playable when a real supported audio URL exists. Expo AV playback on a physical iPhone is not yet claimed verified.

## Backend truth and required next phase
- The repository is currently the native app, not a deployed dedicated Kilode backend. `lib/api.ts` expects an explicitly configured dedicated API; README says `EXPO_PUBLIC_API_URL` must remain unset until that API is deployed and auth endpoints verified.
- Do not point the app at an unrelated legacy site. Do not claim Supabase/API is live unless a real deployed endpoint has been checked.
- Build the backend as a separate, deliberate system: authenticated API, database schema/migrations, server-side validation, ownership checks, rate limits, logging, health endpoint, tests, and deployment configuration. Keep secrets in server environment variables, never in the mobile bundle.
- For Music, backend work should cover real catalogue/track metadata, verified chart data source/provenance, artist profiles/releases, user saved tracks, listening history, playlists, and queue only if server persistence is needed. Define contracts first and wire the native client to those contracts with explicit `live` / `mock` / `error` states.
- Device-local AsyncStorage is currently the source for saved tracks, recent history, and playlists. It is not cross-device sync. Implement migration/sync only with authenticated backend semantics and conflict handling.
- No Apple Developer membership/TestFlight or production deployment is to be implied without verified account/configuration and successful release evidence.

## Known latest verified repository state (2026-10-23)
- Latest verified commit before the current backend slice: `a3a428aab8be4d41a1b2f2bafe03c5f2cc27faaf` — `feat(backend): expose verified Top 50 and Top 100 charts`; native checks and iOS validation passed:
  - https://github.com/mrceogodwin/Kilode/actions/runs/39927130170
  - https://github.com/mrceogodwin/Kilode/actions/runs/39927130036
- The authenticated Music library route (`backend/api/mobile/library.ts`, `4c868d3231ebdb7051f427e578ab578ffd5cddb2`) is committed and its native checks passed, but it remains code only—not a deployed API. Current native chart UI calls the dedicated `/api/mobile/charts?chart=top_50|top_100` contract and has explicit loading, error, timeout, and retry handling; with `API_BASE` unset it correctly reports that the dedicated API is not configured.
- Recent-history fixes are on the current branch and the runs inspected for the recent serialized-history / playlist work were successful:
  - https://github.com/mrceogodwin/Kilode/actions/runs/39904771844
  - https://github.com/mrceogodwin/Kilode/actions/runs/39904771818
  - https://github.com/mrceogodwin/Kilode/actions/runs/39904754691
  - https://github.com/mrceogodwin/Kilode/actions/runs/39904754680
- The fix commit `fe285f1c686c8cc8813dd321c32b762e2cc55f8c` initially failed both CI workflows because `screens/Music.tsx` did not initialize the newly required `recentHistoryRevision` field (TypeScript error at line 93). This was a real compile failure, not a cancellation. The field is now initialized in the current screen state, and later serialized-history fixes are verified by passing runs `39904771844` and `39904771818`.
- Dedicated API status: backend code is still **not configured/deployed/connected to a production database**. `backend/api/mobile/tracks.ts`, `charts.ts`, `health.ts`, and `library.ts` are code foundations only. Do not call the endpoints live until a separate Vercel project rooted at `backend`, dedicated Supabase configuration/schema, auth and RLS, route tests, and live health checks are verified.
- `library.ts` uses a caller Bearer token and Supabase Auth validation, then forwards the same token to PostgREST so database RLS is authoritative. Native app integration and authenticated session flow are still pending. It is not cross-device sync until wired and tested.

## Progress log — 2026-10-23
- Prior verified chart UI commit: `eedace2e9da9364e840d30edfdf3c239f15ce232` (`fix(music): make chart retry explicit and reliable`). Both native checks and iOS native validation passed: https://github.com/mrceogodwin/Kilode/actions/runs/39930896050 and https://github.com/mrceogodwin/Kilode/actions/runs/39930895684. The preceding chart API integration commit also passed both workflows: https://github.com/mrceogodwin/Kilode/actions/runs/39930866978 and https://github.com/mrceogodwin/Kilode/actions/runs/39930866923.

- Added the authenticated Music library route for saved tracks, recent listening history, and playlist reads/writes. It validates the Supabase session, validates identifiers/names, forwards user JWTs (not service-role credentials), uses private/no-store cache headers, and returns generic errors instead of upstream details.
- Next backend steps, in order: create/reuse a dedicated Vercel project with Root Directory `backend`; add server-only Supabase variables and apply migrations in order; validate preview health/auth/quota behavior; add a shared IP/edge limiter for public routes; then integrate authenticated native API calls with explicit local-vs-synced status and conflict-safe migration. Never point at legacy Kilode Nine/v2.

## API route testing and request guard progress — 2026-10-23
- Baseline before this slice was `df58d5865f02e97976306998afc9e84f0fb94a03`; both native CI workflows were green on that commit.
- Mobile health, tracks, charts, and library handlers now share `backend/api/_lib/requestGuard.ts`, which rejects malformed/oversized declared body lengths, caps mutation payloads at 16 KiB, and applies a best-effort fixed-window quota per runtime/client key.
- `npm run test:backend` uses Node's built-in test runner and the installed TypeScript transpiler to exercise the actual route handlers with mocked outbound requests. Both existing CI workflows run this test suite.
- The request counter is intentionally documented as per-runtime defense in depth only. It is not shared across serverless instances and cold starts reset it. Provision/verify a shared limiter, trusted proxy IP headers, and live infrastructure before deployment.
- Dedicated backend remains undeployed and the native API URL must remain unset until deployment, auth/RLS and live health checks are verified.


## Playlist backend semantics — 2026-10-23
- Added PATCH actions to rename playlists and reorder every track in a playlist. Rename checks UUID/name length and relies on caller JWT + RLS ownership; reordering accepts 1–500 unique track UUIDs and delegates atomic order changes to a security-invoker Supabase RPC.
- Added `backend/schema/002_playlist_mutations.sql` with an authenticated reorder function that validates ownership and exact membership before touching positions, uses a collision-free temporary position range, and updates playlist recency via a trigger. Grant is limited to authenticated callers; the function is not a service-role bypass.
- Added three handler-level regression tests for rename payloads, reorder RPC contract, and duplicate-ID rejection. Applying and validating the SQL migration on a dedicated Supabase project is still pending; the API remains undeployed.


## Shared library rate limiting — 2026-10-23
- Added `backend/schema/003_shared_library_rate_limits.sql`. An authenticated-only SECURITY DEFINER RPC derives the caller from `auth.uid()`, permits only hardcoded `library_read` / `library_write` scopes, and stores per-user minute counters in a table inaccessible to direct anon/authenticated DML.
- The library handler calls that RPC with the caller's JWT after token validation. It returns 429 when the account's shared quota is exhausted and fails closed with 503 if the limiter is unavailable. Route tests cover quota denial and verify that data calls stop before reaching PostgREST.
- Before the public shared-IP limiter slice, catalogue/charts/health used only the best-effort per-runtime guard. The following deployment-root and public-limiter slices add dedicated project metadata; no live SQL migration has been applied and the backend remains undeployed.


## Dedicated backend deployment root — 2026-10-23
- Added `backend/package.json` (private Node 24.x project), `backend/vercel.json` (API TypeScript functions capped at 15 seconds), and `backend/.env.example` containing names only, no credentials.
- Added `npm run check:backend-project` to both CI workflows. It verifies the independent backend root, required API/schema/migration files, function duration cap, and the root Vercel guard that blocks accidental deployment of the Expo app as a web app.
- Vercel context inspection found two existing projects linked to the native `mrceogodwin/Kilode` repository and no dedicated backend project in the linked-project list. No project was created and no deployment/domain/production environment was changed.
- Backend still requires the user/team to create or reuse a separate Vercel project with root directory `backend`, configure server environment values, apply SQL migrations 001–003, and test a preview before production.


## Shared IP limiter for public API routes — 2026-10-23
- Added `backend/api/_lib/sharedIpRateLimit.ts`, an Upstash Redis REST limiter using an atomic Lua EVAL (`INCR` + first-hit `PEXPIRE`) and a hashed client IP key. It uses Vercel's overwritten `x-forwarded-for` header, emits rate-limit headers, returns 429 after the per-route quota, and fails closed with 503 if configuration or Redis is unavailable.
- Health is capped at 30/minute per IP; public catalogue and charts at 60/minute per IP. The existing in-memory guard remains an additional local defense.
- Added `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` to the backend environment template and 2 unit tests for Redis counter/429 behaviour and missing configuration. Both Upstash credentials must be set on the dedicated Vercel project before public API routes can return data.

## Every future session
Read this file first, then inspect the current repository and latest workflow runs. Update this file when the focus, architecture, verified status, or next actions materially change. Keep a dated progress note for substantial milestones and record failures plus their fixes.
