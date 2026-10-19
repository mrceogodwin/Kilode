# Kilode native test report

Updated: 2026-10-19

## Environment
- Source: `mrceogodwin/Kilode-v2` (includes mobile bridge commit `f033397ad0`)
- Target: `mrceogodwin/Kilode` Expo RN
- Live probe host: `https://kilode-nine.vercel.app`

## HTTP probes (real curl)

| Request | Result |
|---------|--------|
| `GET /` `Accept: application/json` | **406** `{"error":"Only HTML requests are supported here"}` |
| `GET /api/takes` `Accept: application/json` | **406** same body (route does not exist on deploy) |
| `GET /api/auth/get-session` `Accept: application/json` | **200** `null` (JSON allowed) |
| `GET /api/cron/digest` `Accept: application/json` | **401** JSON `CRON_SECRET not set` (JSON allowed on real API routes) |
| `GET /api/sitemap` | **200** XML |
| `GET /api/mobile/health` (before deploy) | **406** (route not on live deploy yet) |
| `GET /` `Accept: text/html` | **200** HTML Kilode shell |

### Interpretation
1. The 406 message is **real and measured**, not assumed.
2. Existing `/api/*` handlers that are deployed **do** return JSON (`/api/auth/*`, `/api/cron/*`).
3. Unknown paths with JSON Accept receive the HTML-only 406.
4. Mobile bridge routes were **committed to Kilode-v2** but are **not yet serving** on kilode-nine until that commit is deployed by Vercel.

## Code changes this cycle

### Kilode-v2
- `src/routes/api/mobile/health.ts`
- `src/routes/api/mobile/takes.ts` (wraps `listTakes`, `saveTake`)
- `src/routes/api/mobile/tracks.ts` (wraps `listTracks`)

### Kilode (RN)
- `lib/api.ts` points at `/api/mobile/*`
- Distinguishes live / mock / error

## Not yet verified
- Live `GET /api/mobile/takes` after deploy
- Authenticated `POST /api/mobile/takes`
- Expo device E2E
- better-auth sign-in from native

## Next verification after Vercel deploys v2
```bash
curl -sS -H 'Accept: application/json' https://kilode-nine.vercel.app/api/mobile/health
curl -sS -H 'Accept: application/json' https://kilode-nine.vercel.app/api/mobile/takes
```
Expect JSON `{ ok: true, ... }` not 406.
