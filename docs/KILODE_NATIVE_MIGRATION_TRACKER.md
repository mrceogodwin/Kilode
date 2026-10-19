# Kilode native migration tracker

**Source:** `mrceogodwin/Kilode-v2`  
**Target:** `mrceogodwin/Kilode` (Expo RN)

## Stage status

| Stage | Name | Status |
|------:|------|--------|
| 1 | Repository verification | **DONE** |
| 2 | Source audit (ongoing deep reads) | **IN PROGRESS** |
| 3 | Backend / API / auth contract | **IN PROGRESS** — 406 measured; mobile bridge code on v2; **live deploy pending** |
| 4 | Dependency map | PENDING |
| 5 | Design system + shell | PARTIAL |
| 6 | Auth (better-auth from native) | NOT STARTED (local session only) |
| 7–20 | Remaining port | PENDING |

## Stage 3 notes
- Bridge routes: `/api/mobile/health`, `/api/mobile/takes`, `/api/mobile/tracks`
- Reuse: `listTakes`, `saveTake`, `listTracks` from existing server modules
- Blocker until Vercel serves the new routes on the production host used by RN (`API_BASE`)
