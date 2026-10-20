# Kilode native ↔ backend status

**Last updated:** 2026-10-20

## Product policy

| Layer | Role |
|-------|------|
| **Dedicated backend** | System of record (new **Supabase** project) |
| **Vercel preview** | Visual export only |
| **Kilode-v2 / kilode-nine** | **Not** used as app backend |

## Client code (repository)

| Piece | Status |
|-------|--------|
| `lib/config.ts` | Env-driven; offline default |
| `lib/supabase.ts` | Client factory + profile/posts helpers |
| `lib/auth.tsx` | Supabase sign-in/up when mode=`supabase`; else localOnly |
| `package.json` | `@supabase/supabase-js` dependency declared |
| Schema migrations | `supabase/migrations/001_kilode_core.sql` through `017_music_platform.sql` (17 files; staging/live application still unverified) |

## Live readiness

**Not operational** until:

1. Owner creates the dedicated Supabase project and applies the complete ordered migration set in `supabase/migrations/` to staging, then production only after validating the staging results.
2. `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY` are set in the build environment.
3. `npm install` installs `@supabase/supabase-js`.
4. End-to-end sign-up → profile → post is verified.

Without credentials the app correctly stays in **offline/seed** mode (`localOnly` sessions, seed Socials).

## EAS

`app.json` → `extra.eas.projectId` is still empty. Owner must run `eas init` under Expo account `mudino`.

## Super Admin

No public path. Set `profiles.role = 'super_admin'` only via SQL as project owner.
