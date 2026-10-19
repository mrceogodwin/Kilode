# Kilode native test report

Updated: 2026-10-19 (deployment root cause)

## Verified: why `/api/mobile/*` is not live

### Vercel projects (team `team_F1UJzfByla9EZviJBNLRsrz2`)

| Project | ID | GitHub repo in production deploys |
|---------|-----|-------------------------------------|
| **kilodenew** | `prj_tOSHU45aXGXX4DeoFLQqqcgUJwEd` | **`mrceogodwin/Kilode`** (Expo RN) |
| **kilode** | `prj_UiLTbHnvL0iGbrM6hK8igZ33YIlU` | **`mrceogodwin/Kilode`** |

Latest **kilodenew** production deployment:
- SHA: `2535b07a5064a6c43e38531dfb1856a4fbb057a2`
- Message: `docs: Stage 3 evidence — 406 verified; mobile bridge committed on v2; live deploy pending`
- Repo: **Kilode** (not Kilode-v2)

### Mobile bridge location
- Code lives only in **`mrceogodwin/Kilode-v2`** @ `f033397ad0`
- Paths: `src/routes/api/mobile/health.ts`, `takes.ts`, `tracks.ts`
- **No Vercel project in this team is deploying Kilode-v2**

Therefore production host `kilode-nine.vercel.app` cannot serve `/api/mobile/*` until a project that builds **Kilode-v2** is deployed and aliased.

### Live probes (2026-10-19)

| URL | Status | Body |
|-----|--------|------|
| `https://kilode-nine.vercel.app/api/mobile/health` | **406** | `{"error":"Only HTML requests are supported here"}` |
| `https://kilode-nine.vercel.app/api/auth/get-session` | **200** | `null` |
| `https://kilode-nine.vercel.app/api/cron/digest` | **401** | JSON (route exists) |
| `https://kilodenew.vercel.app/api/mobile/health` | **404** | Vercel NOT_FOUND |

### Attempted fix
- `create_git_project` for `mrceogodwin/Kilode-v2` → **403** scope auth on Vercel connector
- Domain listing → **403** same scope

**Blocker requiring user action:** Re-auth Vercel connector and/or in Vercel dashboard:
1. Create or relink a project to **`mrceogodwin/Kilode-v2`** (production branch `main`).
2. Deploy production.
3. Point `kilode-nine.vercel.app` (or keep separate API host) at that deployment.
4. Do **not** keep deploying the Expo RN repo as the web product (`kilodenew` currently does).

### RN client
- Points at `API_BASE` + `/api/mobile/*`
- Correct after bridge is live; cannot pass live verification until deploy is fixed

### Auth on bridge (code review — not live-tested)
- `listTakes` uses `optionalAuthMiddleware` (public read OK)
- `saveTake` uses `authMiddleware` — rejects unauthenticated writes (no auth bypass)
- POST validates non-empty body; returns 400/401/500 appropriately in route wrapper
