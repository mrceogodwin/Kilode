# Kilode native ↔ backend status

**Verified:** 2026-10-19 against `https://kilode-nine.vercel.app`

| Endpoint | Accept | HTTP | Body (summary) |
|----------|--------|------|----------------|
| `/api/mobile/health` | `application/json` | **406** | `Only HTML requests are supported here` |
| `/api/mobile/takes` | `application/json` | **406** | same |
| `/api/mobile/tracks` | `application/json` | **406** | same |
| `/api/health` | `application/json` | **406** | same |

## Meaning

The production host currently rejects non-HTML (JSON) requests. The mobile bridge routes are **not** serving the native app in production.

Native client behaviour (`lib/api.ts`):

- Attempts live fetch.
- On failure / non-OK: `source: "error"` with seed **fallback for layout only**.
- `FORCE_MOCK` defaults to **false**.
- UI must show `ConnectionBanner` when `source !== "live"`.

## Auth

`lib/auth.tsx` does **not** create a session when sign-in/sign-up fails. Guest is explicit only.

## Required to go live

1. Deploy Kilode-v2 (or the correct API host) with `/api/mobile/*` routes that accept `Accept: application/json`.
2. Confirm health returns 200 + JSON body.
3. Point `EXPO_PUBLIC_API_URL` at that host if it is not kilode-nine.

Do **not** treat HTML website success as mobile API success.
