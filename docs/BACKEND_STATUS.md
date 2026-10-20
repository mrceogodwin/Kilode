# Kilode native ↔ backend status

**Last verified:** 2026-10-20

Native client default API host (`lib/config.ts`): `https://kilode-v2.vercel.app`

## Probes

| Host | Endpoint | Accept | HTTP | Body (summary) |
|------|----------|--------|------|----------------|
| **kilode-v2.vercel.app** | `/api/mobile/health` | `application/json` | **503** | JSON: `ready:false`, `database:"missing"`, `auth:"production_credentials_missing"` |
| **kilode-nine.vercel.app** | `/api/mobile/health` | `application/json` | **406** | `Only HTML requests are supported here` |

## Meaning

- **v2:** Mobile bridge route exists and returns JSON, but the service is **not production-ready** (no database / production auth credentials).
- **nine:** Rejects non-HTML requests; not a mobile JSON API host.

Native client behaviour (`lib/api.ts`):

- Attempts live fetch.
- On failure / non-OK: `source: "error"` with seed **fallback for layout only**.
- `FORCE_MOCK` defaults to **false**.
- UI must show `ConnectionBanner` when `source !== "live"` or session is device-only.

## Auth

`lib/auth.tsx` falls back to a **device session** (`localOnly`) when sign-in/sign-up cannot complete against a live host. Guest is explicit only.

## Required to go live

1. Provision database + production auth credentials on Kilode-v2 (or the chosen API host).
2. Confirm `/api/mobile/health` returns **200** with `ready:true`.
3. Point `EXPO_PUBLIC_API_URL` at that host if it differs from the default.

Do **not** treat HTML website success as mobile API success.

See also: `docs/KILODE_REQUIREMENTS_AUDIT.md`.
