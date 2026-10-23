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


## Music end-to-end readiness audit (2026-10-23)

Scope: review of `screens/Music.tsx`, `lib/musicPlayer.ts`, and `lib/musicLibrary.ts` on `main`, plus the latest GitHub Actions runs. This is a source/CI audit, not a physical-device manual test.

### Automated verification on current HEAD

HEAD: `9193580d32cc40262d35eba194c843f608be6759`

- [x] TypeScript check passed: https://github.com/mrceogodwin/Kilode/actions/runs/39904771818
- [x] Account capability regression check passed in the same workflow.
- [x] Expo config and native bundle identifiers passed in the same workflow.
- [x] Expo Doctor passed: https://github.com/mrceogodwin/Kilode/actions/runs/39904771844
- [x] iOS JavaScript bundle export and artifact upload passed in the same workflow.

### User-flow source review

- [x] Music screen starts on Discover and provides Discover, Search, Charts, Artists, Library, Genres and Queue sections.
- [x] Search result and catalogue rows call the shared queue/player; unavailable audio returns a visible message rather than silently switching the playing track.
- [x] Save/unsave has a per-track tap guard and serialized storage mutations.
- [x] Recently played writes are serialized; readers wait behind queued writes; playback publishes a history revision after the write completes.
- [x] Clear-history flow confirms the action and waits for serialized storage before refreshing the list.
- [x] Queue includes add, next, remove, reorder, clear-upcoming, shuffle and repeat controls in source.
- [x] Playlist source includes create, rename, delete, add/remove track, and duplicate-name handling.
- [x] Top 50 and Top 100 are present, and the chart view explicitly says verified chart data is not connected instead of inventing rankings.
- [x] Empty-library / empty-artist / empty-queue states are present in source.

### Not yet verified on a real iPhone

- [ ] Tap through every screen and modal with real touch input.
- [ ] Confirm audio is audible, pause/resume/seek work, and next/previous/repeat/shuffle behave during actual playback.
- [ ] Force-close/reopen the app and confirm saved tracks, playlists and recent history persist on-device.
- [ ] Test rapid save/unsave, rapid track changes, and clearing history while playback continues on-device.
- [ ] Confirm VoiceOver focus, dynamic text sizing, interruptions, silent switch, lock-screen/background audio and Bluetooth route behavior.
- [ ] Verify live catalogue/chart endpoints; verified Top 50/Top 100 rankings are not connected.

### Score

- **Automated native checks: 5/5 passed** on the latest commit.
- **Source-reviewed user-flow coverage: 9/9 checks marked above.**
- **Overall Music readiness: 7/10 (provisional).** The code and CI are healthy, but the score is capped because a real-device interaction/audio test and a live verified chart/catalogue source have not been completed. Do not interpret this as a physical iPhone test or a production-ready sign-off.
