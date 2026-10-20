# Kilode Requirements Audit

**Repository:** `mrceogodwin/Kilode`  
**Primary product:** Expo React Native (iOS first)  
**Working branch:** `preview/web`  
**Audit date:** 2026-10-20  
**Baseline commit at audit:** `2f8617092f42ae4a323a645ba0c4cbb8be5664ee`

Source briefs:

1. Master Product Architecture, Functionality & Engineering Brief
2. Interaction Map, Screen Flows, Backend Wiring & Super Admin Audit

This document records **verified code facts**, not aspirations. Update after each major stage.

---

## 1. Source of truth

| Item | Value |
|------|--------|
| Native repo | `mrceogodwin/Kilode` |
| Default branch | `main` @ `721d38ea` |
| Active work branch | `preview/web` |
| Website / API (separate) | Kilode-v2 (`https://kilode-v2.vercel.app` per `lib/config.ts`) |
| Legacy web reference | `https://kilode-nine.vercel.app` (HTML-oriented; JSON mobile APIs return 406) |
| Expo owner | `mudino` |
| Bundle ID | `ng.kilode.app` |
| EAS projectId | **empty** — requires `eas init` on owner machine |

---

## 2. Product systems map

| System | Entry | Screen files | Status |
|--------|--------|--------------|--------|
| Home | Dock | `screens/Home.tsx` | Partial — discovery rails; seed when API not ready |
| Media | Dock / Home | `screens/Media.tsx` | Partial UI |
| Socials | Dock | `Socials`, `PostDetail`, `UserProfile`, `Comments` | Partial; local likes/follow |
| Music | More / Home | `Music`, `TrackDetail`, `ArtistDetail` | Partial UI; no proven licensed streaming |
| Events | More / rail | `Events.tsx` | Partial UI |
| Market | More / rail | `Market.tsx` | Partial UI; no checkout |
| Jobs | More / rail | `Jobs.tsx` | Partial UI |
| Communities | More | `Communities.tsx` | Partial UI |
| Cinema | More | `Cinema.tsx` | Partial UI |
| Creators | More | `Creators.tsx` | Partial UI |
| Chat | More | `Chat.tsx` | Partial UI |
| My Space | Avatar / More | Inline in `KilodeRoot.tsx` | Partial — kind chips, not full per-type dashboards |
| Settings | My Space | `Settings.tsx` | Partial — delete is client sign-out path |
| Ads & Business | Create / desks | No dedicated screen | Capability `ads_place` only |
| Push Link | — | **Not found in native code** | Missing |
| Super Admin | — | **Not found in native code** | Missing |

Bottom dock (`KilodeTabBar`): **Home · Media · + · Socials · More**. My Space is not a dock tab.

---

## 3. Account-type matrix (from `lib/accountKinds.ts` + `lib/permissions.ts`)

| Kind ID | Label | Client capabilities | My Space tools (current) |
|---------|--------|---------------------|---------------------------|
| `member` | Normal user | feed_post, jobs_apply | socials, media, jobs |
| `artist` | Artist | feed_post, music_list | socials, media, music |
| `writer` | Writer | feed_post, news_write | socials, media |
| `advertiser` | Ads Poster | feed_post, ads_place | socials, media, creators |
| `cinema` | Cinema Poster | feed_post, cinema_submit | socials, media, cinema |
| `job_poster` | Job Poster | feed_post, jobs_post | socials, media, jobs |
| `job_seeker` | Job Seeker | feed_post, jobs_apply | socials, media, jobs |
| `vendor` | Marketplace seller | feed_post, market_sell | socials, media, market |
| `renter` | Rent / space lister | feed_post, rent_list | socials, media, market |
| `brand` | Brand / business | feed_post, brand_page, ads_place | socials, media, creators |

**Registration:** multi-step Auth (welcome → account type → credentials). Kind stored on session / AsyncStorage.

**Gaps vs master brief:**

- No distinct full dashboard layouts per type (chips + Create gates only).
- No post-registration type-specific onboarding beyond kind selection.
- Capabilities are **client-side**; server enforcement not present in this repo.

---

## 4. Navigation model

State machine in `KilodeRoot.tsx` (not React Navigation):

- `tab` selects system screens.
- Detail overlays: post, profile, track, artist, desk item, settings.
- Modals: compose, create, more, comments.

Back navigation is mostly explicit `onBack` / clear selection. Full journey testing on device **not verified** in this audit cycle.

---

## 5. Backend integration matrix

| Endpoint (client) | Host config | Live probe 2026-10-20 | Native behaviour |
|-------------------|-------------|------------------------|------------------|
| `GET /api/mobile/health` | kilode-v2 | **503** JSON `ready:false`, DB missing, auth credentials missing | Treated as not ready |
| Same | kilode-nine | **406** HTML-only | Not usable for JSON |
| takes / tracks / news / rooms / activity | v2 | Not production-ready when health not ready | Seed/error path; banner shown |
| `POST /api/mobile/takes` | v2 | Not verified success | Client returns error + local fallback object |
| Better Auth sign-in/up | v2 | Not live production | Local device session (`localOnly`) |

`FORCE_MOCK` = false. Never report seed as `live`.

See also: `docs/BACKEND_STATUS.md` (Nine 406 notes; host may lag config).

---

## 6. Super Admin

| Requirement | Status |
|-------------|--------|
| Separate protected entry | **Missing** in native |
| Server-enforced admin role | **Not in this repo** |
| Moderation queue UI | Local report/block helpers only |
| Public self-promote to admin | Must never exist |

**Decision needed:** Confirm Super Admin lives only on Kilode-v2 web `/ops` vs native companion. Do not expose admin in user dock.

---

## 7. Brand tokens (preserve)

From `theme.ts`:

- BG `#0D0D10`, card `#18181C`, border `#2A2A30`
- Gold `#D4AF37` / `#E5C158`
- Text `#F5F5F5`

Do not introduce blue-and-white redesign.

---

## 8. Interaction / readiness checklist (summary)

| Area | Label |
|------|--------|
| Auth UI + kind selection | Partially implemented |
| Local session when API down | Implemented (labelled) |
| Live session | Blocked on v2 ready |
| Per-type dashboards | Incomplete |
| Create capability gates | Partially implemented |
| Moderation report/block | Local-only |
| Account deletion (App Store) | UI only; server wipe unverified |
| Payments / Push Link | Missing |
| EAS / TestFlight | Blocked on empty projectId |
| Device QA | Not run in CI/agent environment |

---

## 9. Prioritised work queue

1. Keep this audit current after each milestone.
2. Strengthen **account-type My Space** tool panels (real different tools, same brand).
3. Navigation dead-end pass on `KilodeRoot` + system screens.
4. Backend: wait for v2 `ready:true`; keep honest banners.
5. Super Admin: product decision + server roles before any native admin UI.
6. EAS: owner runs `eas login` / `eas init` / build.
7. Web preview: secondary only.

---

## 10. Change log

| Date | Commit | Note |
|------|--------|------|
| 2026-10-20 | (this file) | Initial master audit document |
