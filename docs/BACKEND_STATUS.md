# Kilode native ↔ backend status

**Last updated:** 2026-10-20

## Product policy

| Layer | Role |
|-------|------|
| **Dedicated backend** | System of record for Kilode iOS/Android (recommended: **new Supabase project**) |
| **Vercel preview** | Visual export of the Expo web build only |
| **Kilode-v2 / kilode-nine** | **Not** the application backend for this native app |

See `docs/BACKEND_DEDICATED.md` and `supabase/migrations/001_kilode_core.sql`.

## Client configuration

`lib/config.ts`:

- `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY` → intended live mode
- `EXPO_PUBLIC_API_URL` → optional custom BFF only (empty by default)
- **No default** pointing at kilode-v2 or kilode-nine

When neither Supabase nor `API_BASE` is set, `lib/api.ts` stays in **offline/seed** mode (`source: mock`).

## Historical probes (legacy hosts — not product backends)

| Host | Path | Result |
|------|------|--------|
| kilode-v2.vercel.app | `/api/mobile/health` | 503 `ready:false` |
| kilode-nine.vercel.app | `/api/mobile/health` | 406 HTML-only |

These hosts are documented only so we do not reconnect to them by accident.

## Auth

`lib/auth.tsx` may still attempt Better Auth paths if `API_BASE` is set. Prefer migrating auth to Supabase Auth after the project exists. Device-local sessions remain `localOnly: true`.

## Operational checklist

1. Create dedicated Supabase project.
2. Run `001_kilode_core.sql`.
3. Put URL + anon key in local `.env`.
4. Add Supabase JS client and wire Socials/profile (next engineering phase).
5. Super Admin = SQL role only; never public registration.

**Dedicated backend readiness: not operational until owner project + migration + client keys are in place.**
