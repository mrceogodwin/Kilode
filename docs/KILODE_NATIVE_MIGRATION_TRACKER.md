# Kilode native migration tracker

**Target app:** `mrceogodwin/Kilode` (Expo React Native)  
**Release priority:** native iOS first.

## Verified status — 2026-10-23

| Area | Status | Verified notes |
|---|---|---|
| Native CI | PASS | Latest verified commit `02de182`; [native checks](https://github.com/mrceogodwin/Kilode/actions/runs/39974307483) and [iOS validation](https://github.com/mrceogodwin/Kilode/actions/runs/39974307515) passed, including TypeScript, 19 backend regression tests, deployment-root checks, Expo Doctor and iOS JS bundle export. |
| Dedicated backend scaffold | READY IN REPOSITORY | `backend/` has its own private Node project, Vercel config, server-only environment template, API handlers, SQL migrations 001–003, shared rate limiters and redacted request logs. This does not mean it is deployed or database-connected. |
| Vercel backend project | BLOCKED BY PERMISSIONS | Attempt to create `kilode-native-api` under team `Godwin Oriabure` returned Vercel 403 Forbidden. No project was created; existing `kilode` and `kilodenew` projects/domains were not changed. Team/project creation permission is required before preview deployment. |
| Supabase / Upstash runtime | NOT CONFIGURED | SQL migrations have not been applied to a dedicated live Supabase project. Set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN` as server-side Vercel variables only after the correct projects exist. |
| Authentication API | IMPLEMENTED IN REPOSITORY, NOT LIVE | Email sign-in/sign-up, password-recovery request, and recovery-token password update routes proxy Supabase Auth; schema migration 004 creates the unique username/profile registry. Recovery requires `KILODE_AUTH_REDIRECT_URL`. Live email delivery and trigger/profile behavior still require a dedicated Supabase preview. |
| Music chart API | IMPLEMENTED, NOT LIVE | Native screen already calls `/api/mobile/charts` when `EXPO_PUBLIC_API_URL` is configured. Backend returns only one verified chart period; tests cover sparse/empty periods. Upstash and Supabase must exist before the route can serve live data. |
| Saved tracks, history and playlists | LOCAL CLIENT / SERVER ROUTES READY | `lib/musicLibrary.ts` persists to AsyncStorage. Backend route and schemas exist, but native sync is not wired. Local playlist IDs and metadata-only track IDs are not necessarily server UUIDs; never bulk-upload local entries without a validated ID mapping and conflict-safe migration flow. |
| EAS project linkage | BLOCKED | `app.config.js` still requires the real existing project ID under Expo owner `mudino`. Do not invent an ID or create a duplicate project. |
| Signed iOS / TestFlight | NOT VERIFIED | A successful JavaScript bundle export is not a signed IPA or TestFlight delivery. No successful EAS build or physical-device validation is claimed. |

## Required next steps

1. Have the Vercel team owner grant project-creation permission or create a dedicated project named `kilode-native-api` linked to `mrceogodwin/Kilode` with Root Directory set to `backend`. Do not repoint the existing website/native-app projects.
2. Provision a dedicated Supabase project and an Upstash Redis database. Apply `backend/schema/001_music_core.sql`, `002_playlist_mutations.sql`, `003_shared_library_rate_limits.sql`, and `004_kilode_user_profiles.sql` in that order. Set only server-side Vercel environment variables.
3. Configure Supabase email confirmation, trusted redirect URLs, and email delivery. Test sign-in, sign-up with confirmation on/off, duplicate username/email, invalid sessions, and logout behavior on the dedicated preview. Account-kind is profile metadata and must never substitute for database authorization.
4. Deploy a preview and verify health, RLS ownership, shared per-user quotas, shared IP quotas, playlist transactions, chart period correctness, redacted logs, and failure-closed behavior.
5. Implement native library sync as an explicit, conflict-safe layer. Preserve local-only state until a real server UUID can be mapped; never claim that local changes are synced.
6. Configure `EXPO_PUBLIC_API_URL` only after the dedicated backend preview passes all checks. Then complete the existing EAS project linkage, signed iOS preview build, and physical-device tests.

## Guardrails

- Never present seed/local data as live server data.
- Never treat a local placeholder token or guest session as authenticated.
- Never point the native app at the legacy Kilode Nine/v2 website or silently fall back to it.
- Never claim database migration, production deployment, EAS signing, TestFlight, or physical-device testing succeeded without a corresponding result.
