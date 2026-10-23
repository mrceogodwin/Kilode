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
- The latest backend change adds `backend/api/mobile/library.ts` (`4c868d3231ebdb7051f427e578ab578ffd5cddb2`) for authenticated saved-track, listening-history, and playlist reads/writes. This is committed code, but its new workflow checks still need to be inspected; it is not a deployed API.
- Recent-history fixes are on the current branch and the runs inspected for the recent serialized-history / playlist work were successful:
  - https://github.com/mrceogodwin/Kilode/actions/runs/39904771844
  - https://github.com/mrceogodwin/Kilode/actions/runs/39904771818
  - https://github.com/mrceogodwin/Kilode/actions/runs/39904754691
  - https://github.com/mrceogodwin/Kilode/actions/runs/39904754680
- The fix commit `fe285f1c686c8cc8813dd321c32b762e2cc55f8c` added a recent-history revision signal and waits for the recent-history write before publishing playback state. It must not be treated as a failure solely because a later message said “failed”; inspect the associated workflow run/logs for the exact evidence.
- Dedicated API status: backend code is still **not configured/deployed/connected to a production database**. `backend/api/mobile/tracks.ts`, `charts.ts`, `health.ts`, and `library.ts` are code foundations only. Do not call the endpoints live until a separate Vercel project rooted at `backend`, dedicated Supabase configuration/schema, auth and RLS, route tests, and live health checks are verified.
- `library.ts` uses a caller Bearer token and Supabase Auth validation, then forwards the same token to PostgREST so database RLS is authoritative. Native app integration and authenticated session flow are still pending. It is not cross-device sync until wired and tested.

## Progress log — 2026-10-23
- Added the authenticated Music library route for saved tracks, recent listening history, and playlist reads/writes. It validates the Supabase session, validates identifiers/names, forwards user JWTs (not service-role credentials), uses private/no-store cache headers, and returns generic errors instead of upstream details.
- Next backend steps, in order: verify CI on the library route; add route tests and request/rate-limit protections; complete playlist rename/reorder semantics; deploy backend separately with dedicated Supabase and apply migration; validate live health; then integrate authenticated native API calls with explicit local-vs-synced status and conflict-safe migration. Never point at legacy Kilode Nine/v2.

## Every future session
Read this file first, then inspect the current repository and latest workflow runs. Update this file when the focus, architecture, verified status, or next actions materially change. Keep a dated progress note for substantial milestones and record failures plus their fixes.
